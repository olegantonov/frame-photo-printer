'use client';

import { useState, useEffect, useCallback } from 'react';

interface Printer {
  name: string;
  status: string;
  isDefault?: boolean;
}

interface HotspotStatus {
  enabled: boolean;
  ssid: string;
  password: string;
  ip?: string;
  interface?: string;
  clients?: number;
}

interface FrameOption {
  name: string;
  path: string;
  displayName: string;
}

interface SystemConfig {
  default_printer: string | null;
  hotspot_enabled: boolean;
  hotspot_ssid: string;
  hotspot_password: string;
  frame_portrait: string | null;
  frame_landscape: string | null;
  frame_show_id: boolean;
  frame_show_datetime: boolean;
}

export default function SettingsPage() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [hotspotStatus, setHotspotStatus] = useState<HotspotStatus | null>(null);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [ssid, setSsid] = useState('FramePhotoPrinter');
  const [password, setPassword] = useState('foto1234');
  // Frame settings - separate for portrait and landscape
  const [frames, setFrames] = useState<FrameOption[]>([]);
  const [framePortrait, setFramePortrait] = useState<string | null>(null);
  const [frameLandscape, setFrameLandscape] = useState<string | null>(null);
  const [showId, setShowId] = useState(true);
  const [showDateTime, setShowDateTime] = useState(true);
  const [uploadingFrame, setUploadingFrame] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingFrame, setSavingFrame] = useState(false);
  const [hotspotLoading, setHotspotLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [printersRes, configRes, hotspotRes, framesRes] = await Promise.all([
        fetch('/api/printers'),
        fetch('/api/config'),
        fetch('/api/hotspot'),
        fetch('/api/frames')
      ]);

      if (printersRes.ok) {
        const data = await printersRes.json();
        setPrinters(Array.isArray(data) ? data : []);
      }

      if (configRes.ok) {
        const data = await configRes.json();
        setConfig(data);
        setSelectedPrinter(data.default_printer || '');
        setSsid(data.hotspot_ssid || 'FramePhotoPrinter');
        setPassword(data.hotspot_password || 'foto1234');
        setFramePortrait(data.frame_portrait || null);
        setFrameLandscape(data.frame_landscape || null);
        setShowId(data.frame_show_id ?? true);
        setShowDateTime(data.frame_show_datetime ?? true);
      }

      if (hotspotRes.ok) {
        const data = await hotspotRes.json();
        setHotspotStatus(data);
      }

      if (framesRes.ok) {
        const data = await framesRes.json();
        setFrames(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setMessage('❌ Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const savePrinter = async () => {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ default_printer: selectedPrinter })
      });

      if (response.ok) {
        setMessage('✅ Impressora salva com sucesso!');
        fetchData();
      } else {
        setMessage('❌ Erro ao salvar impressora');
      }
    } catch (error) {
      setMessage('❌ Erro ao salvar impressora');
    } finally {
      setSaving(false);
    }
  };

  const saveFrameSettings = async () => {
    setSavingFrame(true);
    setMessage('');
    try {
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frame_portrait: framePortrait,
          frame_landscape: frameLandscape,
          frame_show_id: showId,
          frame_show_datetime: showDateTime
        })
      });

      if (response.ok) {
        setMessage('✅ Configurações da moldura salvas!');
        fetchData();
      } else {
        setMessage('❌ Erro ao salvar moldura');
      }
    } catch (error) {
      setMessage('❌ Erro ao salvar moldura');
    } finally {
      setSavingFrame(false);
    }
  };

  const uploadFrame = async (file: File) => {
    setUploadingFrame(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/frames', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setMessage('✅ Moldura enviada com sucesso!');
        fetchData();
      } else {
        const data = await response.json();
        setMessage(`❌ ${data.error || 'Erro ao enviar moldura'}`);
      }
    } catch (error) {
      setMessage('❌ Erro ao enviar moldura');
    } finally {
      setUploadingFrame(false);
    }
  };

  const deleteFrame = async (frameName: string) => {
    if (!confirm(`Deseja excluir a moldura "${frameName}"?`)) return;
    
    const framePath = `/frames/${frameName}`;
    
    try {
      const response = await fetch(`/api/frames?name=${encodeURIComponent(frameName)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('✅ Moldura excluída!');
        // Clear selection if deleted frame was selected
        if (framePortrait === framePath) setFramePortrait(null);
        if (frameLandscape === framePath) setFrameLandscape(null);
        fetchData();
      } else {
        setMessage('❌ Erro ao excluir moldura');
      }
    } catch (error) {
      setMessage('❌ Erro ao excluir moldura');
    }
  };

  const toggleHotspot = async (start: boolean) => {
    setHotspotLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/hotspot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: start ? 'start' : 'stop',
          ssid,
          password
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessage(start 
          ? `✅ Hotspot iniciado! Conecte-se a "${ssid}" e acesse http://${data.ip}:3000`
          : '✅ Hotspot desativado'
        );
        fetchData();
      } else {
        setMessage(`❌ ${data.message || 'Erro ao controlar hotspot'}`);
      }
    } catch (error) {
      setMessage('❌ Erro ao controlar hotspot');
    } finally {
      setHotspotLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'idle': return '🟢';
      case 'printing': return '🟡';
      case 'disabled':
      case 'offline': return '🔴';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>⚙️ Configurações do Sistema</h1>
        <a href="/" className="btn btn-secondary">← Voltar</a>
      </header>

      {message && (
        <div className={`message-banner ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="settings-grid">
        {/* Printer Section */}
        <section className="settings-card">
          <h2>🖨️ Impressora Padrão</h2>
          <p className="settings-description">
            Selecione a impressora que será usada automaticamente para todas as impressões.
          </p>

          {printers.length > 0 ? (
            <>
              <div className="printer-list">
                {printers.map(printer => (
                  <label 
                    key={printer.name} 
                    className={`printer-option ${selectedPrinter === printer.name ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="printer"
                      value={printer.name}
                      checked={selectedPrinter === printer.name}
                      onChange={(e) => setSelectedPrinter(e.target.value)}
                    />
                    <span className="printer-info">
                      <span className="printer-name">
                        {getStatusIcon(printer.status)} {printer.name}
                      </span>
                      <span className="printer-status">
                        {printer.status === 'idle' ? 'Pronta' : printer.status}
                        {printer.isDefault && ' ⭐ Padrão do sistema'}
                      </span>
                    </span>
                  </label>
                ))}
              </div>

              <button 
                onClick={savePrinter} 
                className="btn btn-primary btn-large"
                disabled={saving || !selectedPrinter}
              >
                {saving ? '⏳ Salvando...' : '💾 Salvar Impressora'}
              </button>
            </>
          ) : (
            <p className="no-printers">
              ⚠️ Nenhuma impressora encontrada. Verifique se o CUPS está instalado e configurado.
            </p>
          )}
        </section>

        {/* Frame Settings Section */}
        <section className="settings-card">
          <h2>🖼️ Configuração das Molduras</h2>
          <p className="settings-description">
            Configure molduras separadas para fotos em retrato (vertical) e paisagem (horizontal).
          </p>

          {/* Dual Frame Preview */}
          <div className="dual-frame-preview">
            <div className="frame-preview-box">
              <h3>📱 Retrato (15×21)</h3>
              {framePortrait ? (
                <div className="frame-preview-image portrait">
                  <img src={framePortrait} alt="Moldura retrato" />
                </div>
              ) : (
                <div className="frame-preview no-frame portrait">
                  <span>Sem moldura</span>
                </div>
              )}
            </div>
            <div className="frame-preview-box">
              <h3>🖼️ Paisagem (21×15)</h3>
              {frameLandscape ? (
                <div className="frame-preview-image landscape">
                  <img src={frameLandscape} alt="Moldura paisagem" />
                </div>
              ) : (
                <div className="frame-preview no-frame landscape">
                  <span>Sem moldura</span>
                </div>
              )}
            </div>
          </div>

          <div className="frame-settings">
            {/* Portrait Frame Selection */}
            <div className="form-group">
              <label>📱 Moldura para Retrato (Vertical)</label>
              <div className="frames-grid">
                <label 
                  className={`frame-option ${!framePortrait ? 'selected' : ''}`}
                  onClick={() => setFramePortrait(null)}
                >
                  <div className="frame-thumb no-frame-thumb">
                    <span>Sem moldura</span>
                  </div>
                </label>
                {frames.map(frame => (
                  <label 
                    key={`portrait-${frame.name}`}
                    className={`frame-option ${framePortrait === frame.path ? 'selected' : ''}`}
                    onClick={() => setFramePortrait(frame.path)}
                  >
                    <img src={frame.path} alt={frame.displayName} />
                    <span className="frame-name">{frame.displayName}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Landscape Frame Selection */}
            <div className="form-group">
              <label>🖼️ Moldura para Paisagem (Horizontal)</label>
              <div className="frames-grid">
                <label 
                  className={`frame-option ${!frameLandscape ? 'selected' : ''}`}
                  onClick={() => setFrameLandscape(null)}
                >
                  <div className="frame-thumb no-frame-thumb">
                    <span>Sem moldura</span>
                  </div>
                </label>
                {frames.map(frame => (
                  <label 
                    key={`landscape-${frame.name}`}
                    className={`frame-option ${frameLandscape === frame.path ? 'selected' : ''}`}
                    onClick={() => setFrameLandscape(frame.path)}
                  >
                    <img src={frame.path} alt={frame.displayName} />
                    <span className="frame-name">{frame.displayName}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Upload Frame */}
            <div className="form-group">
              <label>📤 Enviar Nova Moldura</label>
              <div className="upload-area">
                <input
                  type="file"
                  accept=".png"
                  id="frame-upload"
                  className="file-input"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFrame(file);
                    e.target.value = '';
                  }}
                  disabled={uploadingFrame}
                />
                <label htmlFor="frame-upload" className="upload-label">
                  {uploadingFrame ? '⏳ Enviando...' : '📤 Selecionar arquivo PNG'}
                </label>
              </div>
              {frames.length > 0 && (
                <div className="frames-manage">
                  <p className="small-text">Molduras disponíveis:</p>
                  <div className="frames-list">
                    {frames.map(frame => (
                      <span key={frame.name} className="frame-tag">
                        {frame.displayName}
                        <button 
                          onClick={() => deleteFrame(frame.name)}
                          className="delete-tag"
                          title="Excluir"
                        >×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Informações na Foto</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={showId}
                    onChange={(e) => setShowId(e.target.checked)}
                  />
                  <span>Mostrar ID da foto (ex: ABC123)</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={showDateTime}
                    onChange={(e) => setShowDateTime(e.target.checked)}
                  />
                  <span>Mostrar data e hora</span>
                </label>
              </div>
            </div>
          </div>

          <button 
            onClick={saveFrameSettings}
            className="btn btn-primary btn-large"
            disabled={savingFrame}
          >
            {savingFrame ? '⏳ Salvando...' : '💾 Salvar Configurações de Moldura'}
          </button>
        </section>

        {/* Hotspot Section */}
        <section className="settings-card">
          <h2>📶 Hotspot Wi-Fi</h2>
          <p className="settings-description">
            Crie uma rede Wi-Fi para que dispositivos móveis acessem o sistema.
          </p>

          <div className="hotspot-status">
            <div className={`status-indicator ${hotspotStatus?.enabled ? 'active' : 'inactive'}`}>
              {hotspotStatus?.enabled ? '🟢 Ativo' : '⚪ Inativo'}
            </div>
            
            {hotspotStatus?.enabled && (
              <div className="hotspot-info">
                <p>📡 Rede: <strong>{hotspotStatus.ssid}</strong></p>
                <p>🌐 IP: <strong>http://{hotspotStatus.ip}:3000</strong></p>
                <p>👥 Clientes conectados: <strong>{hotspotStatus.clients || 0}</strong></p>
              </div>
            )}
          </div>

          {!hotspotStatus?.enabled && (
            <div className="hotspot-config">
              <div className="form-group">
                <label>Nome da Rede (SSID)</label>
                <input
                  type="text"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  placeholder="FramePhotoPrinter"
                />
              </div>
              <div className="form-group">
                <label>Senha (mínimo 8 caracteres)</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="foto1234"
                  minLength={8}
                />
              </div>
            </div>
          )}

          <button
            onClick={() => toggleHotspot(!hotspotStatus?.enabled)}
            className={`btn btn-large ${hotspotStatus?.enabled ? 'btn-danger' : 'btn-success'}`}
            disabled={hotspotLoading || (!hotspotStatus?.enabled && password.length < 8)}
          >
            {hotspotLoading 
              ? '⏳ Processando...' 
              : hotspotStatus?.enabled 
                ? '🛑 Desativar Hotspot' 
                : '📶 Iniciar Hotspot'}
          </button>
        </section>

        {/* QR Code Section */}
        {hotspotStatus?.enabled && (
          <section className="settings-card qr-section">
            <h2>📱 Acesso Mobile</h2>
            <p className="settings-description">
              Compartilhe estas informações com os usuários:
            </p>
            <div className="access-info">
              <div className="info-box">
                <strong>1. Conecte-se à rede Wi-Fi:</strong>
                <p className="highlight">{hotspotStatus.ssid}</p>
                <p>Senha: <code>{hotspotStatus.password}</code></p>
              </div>
              <div className="info-box">
                <strong>2. Acesse no navegador:</strong>
                <p className="highlight">http://{hotspotStatus.ip}:3000</p>
              </div>
            </div>
          </section>
        )}
      </div>

      <style jsx>{`
        .admin-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 1rem;
          min-height: 100vh;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .admin-header h1 {
          font-size: 1.5rem;
        }

        .settings-grid {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .settings-card {
          background: #1e293b;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .settings-card h2 {
          margin-bottom: 0.5rem;
          font-size: 1.25rem;
        }

        .settings-description {
          color: #94a3b8;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }

        .printer-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .printer-option {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #334155;
          border-radius: 12px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.2s;
        }

        .printer-option:hover {
          background: #3b4d63;
        }

        .printer-option.selected {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
        }

        .printer-option input {
          width: 20px;
          height: 20px;
          accent-color: #3b82f6;
        }

        .printer-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .printer-name {
          font-weight: 600;
          font-size: 1rem;
        }

        .printer-status {
          color: #94a3b8;
          font-size: 0.85rem;
        }

        .no-printers {
          color: #f59e0b;
          padding: 1rem;
          background: rgba(245, 158, 11, 0.1);
          border-radius: 8px;
        }

        .hotspot-status {
          margin-bottom: 1.5rem;
        }

        .status-indicator {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .status-indicator.active {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }

        .status-indicator.inactive {
          background: rgba(148, 163, 184, 0.2);
          color: #94a3b8;
        }

        .hotspot-info {
          background: #334155;
          padding: 1rem;
          border-radius: 12px;
        }

        .hotspot-info p {
          margin: 0.5rem 0;
        }

        .hotspot-config {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          font-size: 0.9rem;
        }

        .form-group input {
          padding: 0.75rem 1rem;
          background: #334155;
          border: 1px solid #475569;
          border-radius: 8px;
          color: white;
          font-size: 1rem;
        }

        .form-group input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .btn-danger {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
        }

        /* Frame Settings Styles */
        .dual-frame-preview {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .frame-preview-box {
          background: #0f172a;
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
        }

        .frame-preview-box h3 {
          font-size: 0.9rem;
          margin-bottom: 0.75rem;
          color: #94a3b8;
        }

        .frame-preview-container {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .frame-preview-image {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #1e293b;
          border-radius: 8px;
          padding: 0.5rem;
        }

        .frame-preview-image.portrait {
          min-height: 140px;
        }

        .frame-preview-image.landscape {
          min-height: 100px;
        }

        .frame-preview-image img {
          max-width: 100%;
          max-height: 120px;
          object-fit: contain;
        }

        .preview-photo-placeholder {
          position: absolute;
          font-size: 3rem;
          z-index: 0;
          opacity: 0.5;
        }

        .frame-preview {
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #1e293b;
          min-height: 100px;
        }

        .frame-preview.portrait {
          min-height: 140px;
        }

        .frame-preview.no-frame {
          border: 2px dashed #475569;
        }

        .frame-preview.no-frame span {
          color: #64748b;
          font-size: 0.8rem;
        }

        .frames-manage {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #334155;
        }

        .small-text {
          font-size: 0.8rem;
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .frames-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .frame-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          background: #334155;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .delete-tag {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          font-size: 1rem;
          padding: 0 0.25rem;
        }

        .delete-tag:hover {
          color: #f87171;
        }

        .frame-preview {
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          background: #0f172a;
        }

        .frame-preview.no-frame {
          border: 3px dashed #475569;
        }

        .no-frame-text {
          margin-top: 0.5rem;
          color: #64748b;
          font-size: 0.85rem;
        }

        .preview-photo {
          width: 120px;
          height: 160px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
        }

        .preview-overlay {
          position: absolute;
          top: 16px;
          right: 20px;
          font-size: 10px;
          color: #888;
          font-family: Arial, sans-serif;
        }

        .frames-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .frame-option {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.75rem;
          background: #334155;
          border-radius: 12px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.2s;
        }

        .frame-option:hover {
          background: #3b4d63;
        }

        .frame-option.selected {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
        }

        .frame-option img {
          max-width: 100px;
          max-height: 140px;
          object-fit: contain;
          border-radius: 4px;
        }

        .frame-thumb {
          width: 100px;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1e293b;
          border-radius: 4px;
          border: 2px dashed #475569;
        }

        .no-frame-thumb span {
          color: #64748b;
          font-size: 0.75rem;
          text-align: center;
        }

        .frame-name {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: #94a3b8;
          text-align: center;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .delete-frame-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(239, 68, 68, 0.8);
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .frame-option:hover .delete-frame-btn {
          opacity: 1;
        }

        .upload-area {
          margin-top: 0.5rem;
        }

        .file-input {
          display: none;
        }

        .upload-label {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background: #334155;
          border: 2px dashed #475569;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
        }

        .upload-label:hover {
          background: #3b4d63;
          border-color: #3b82f6;
        }

        .frame-settings {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .checkbox-label:hover {
          background: rgba(59, 130, 246, 0.1);
        }

        .checkbox-label input[type="checkbox"] {
          width: 20px;
          height: 20px;
          accent-color: #3b82f6;
          padding: 0;
        }

        .qr-section {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid #3b82f6;
        }

        .access-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .info-box {
          background: #334155;
          padding: 1rem;
          border-radius: 12px;
        }

        .info-box strong {
          display: block;
          margin-bottom: 0.5rem;
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .highlight {
          font-size: 1.25rem;
          font-weight: 700;
          color: #3b82f6;
          margin: 0.5rem 0;
        }

        code {
          background: #0f172a;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: monospace;
        }

        .loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          gap: 1rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #334155;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
