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

interface SystemConfig {
  default_printer: string | null;
  hotspot_enabled: boolean;
  hotspot_ssid: string;
  hotspot_password: string;
}

export default function SettingsPage() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [hotspotStatus, setHotspotStatus] = useState<HotspotStatus | null>(null);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [ssid, setSsid] = useState('FramePhotoPrinter');
  const [password, setPassword] = useState('foto1234');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hotspotLoading, setHotspotLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [printersRes, configRes, hotspotRes] = await Promise.all([
        fetch('/api/printers'),
        fetch('/api/config'),
        fetch('/api/hotspot')
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
      }

      if (hotspotRes.ok) {
        const data = await hotspotRes.json();
        setHotspotStatus(data);
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
