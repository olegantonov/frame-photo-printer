'use client';

import { useState, useEffect } from 'react';
import CameraCapture from '@/components/CameraCapture';

export default function Home() {
  const [step, setStep] = useState<'camera' | 'preview' | 'printing'>('camera');
  const [photoId, setPhotoId] = useState('');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [previewUrl, setPreviewUrl] = useState('');
  const [defaultPrinter, setDefaultPrinter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [configLoading, setConfigLoading] = useState(true);
  const [customCopies, setCustomCopies] = useState(1);

  useEffect(() => {
    // Load system config to get default printer
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const config = await response.json();
          if (config.default_printer) {
            setDefaultPrinter(config.default_printer);
          }
        }
      } catch (error) {
        console.error('Failed to load config:', error);
      } finally {
        setConfigLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handlePhotoCaptured = async (id: string, orient: string, preview: string) => {
    setPhotoId(id);
    setOrientation(orient as 'portrait' | 'landscape');
    setPreviewUrl(preview);
    setMessage(`📸 Foto capturada em modo ${orient === 'portrait' ? 'Retrato' : 'Paisagem'}`);
    setStep('preview');
  };

  const handlePrint = async (copies: number) => {
    if (!defaultPrinter) {
      setMessage('⚠️ Nenhuma impressora configurada. Acesse /admin para configurar.');
      return;
    }

    if (copies < 1 || copies > 10) {
      setMessage('⚠️ Número de cópias deve ser entre 1 e 10');
      return;
    }

    setIsLoading(true);
    setMessage(`🖨️ Enviando ${copies} cópia${copies > 1 ? 's' : ''} para impressão...`);

    try {
      const response = await fetch('/api/print-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          photoId, 
          printerName: defaultPrinter,
          copies 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        setStep('printing');
        setTimeout(() => {
          resetToCamera();
        }, 3000);
      } else {
        setMessage(`❌ Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Print failed:', error);
      setMessage('❌ Erro ao enviar para impressão');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToCamera = () => {
    setStep('camera');
    setPhotoId('');
    setPreviewUrl('');
    setMessage('');
    setCustomCopies(1);
  };

  if (configLoading) {
    return (
      <main className="app-container">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Carregando configurações...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-container">
      <header className="app-header">
        <h1>📸 Frame Photo Printer</h1>
        <p className="subtitle">Capture, enquadre e imprima suas fotos 15x21</p>
        {defaultPrinter && (
          <p className="printer-badge">🖨️ {defaultPrinter}</p>
        )}
      </header>

      {!defaultPrinter && (
        <div className="message-banner warning">
          ⚠️ Nenhuma impressora configurada. <a href="/admin">Clique aqui para configurar</a>
        </div>
      )}

      {message && (
        <div className={`message-banner ${message.includes('✅') ? 'success' : message.includes('❌') ? 'error' : 'info'}`}>
          {message}
        </div>
      )}

      <div className="main-content">
        {step === 'camera' && (
          <CameraCapture onCaptured={handlePhotoCaptured} />
        )}

        {step === 'preview' && (
          <div className="preview-section">
            <div className="photo-preview-container">
              <h2>📷 Prévia da Foto</h2>
              <div className={`photo-frame ${orientation}`}>
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="photo-preview-img"
                />
              </div>
              <p className="orientation-badge">
                {orientation === 'portrait' ? '📱 Retrato 15×21' : '🖼️ Paisagem 21×15'}
              </p>
            </div>

            {/* Quick print buttons */}
            <div className="print-options">
              <p className="print-label">Imprimir cópias:</p>
              <div className="quick-print-buttons">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => handlePrint(num)}
                    className="btn btn-print-quick"
                    disabled={!defaultPrinter || isLoading}
                  >
                    {num}
                  </button>
                ))}
              </div>
              
              <div className="custom-copies">
                <label>Ou escolha a quantidade:</label>
                <div className="custom-copies-input">
                  <button 
                    onClick={() => setCustomCopies(Math.max(1, customCopies - 1))}
                    className="btn btn-small"
                    disabled={isLoading}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={customCopies}
                    onChange={(e) => setCustomCopies(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="copies-input"
                    disabled={isLoading}
                  />
                  <button 
                    onClick={() => setCustomCopies(Math.min(10, customCopies + 1))}
                    className="btn btn-small"
                    disabled={isLoading}
                  >
                    +
                  </button>
                  <button
                    onClick={() => handlePrint(customCopies)}
                    className="btn btn-success"
                    disabled={!defaultPrinter || isLoading}
                  >
                    {isLoading ? '⏳' : '🖨️'} Imprimir
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={resetToCamera}
              className="btn btn-secondary btn-large"
              disabled={isLoading}
            >
              🔄 Nova Foto
            </button>
          </div>
        )}

        {step === 'printing' && (
          <div className="printing-section">
            <div className="printing-animation">
              <div className="printer-icon">🖨️</div>
              <p>Impressão em andamento...</p>
            </div>
          </div>
        )}
      </div>

      <footer className="app-footer">
        <p>Moldura aplicada automaticamente • 15×21 cm</p>
      </footer>
    </main>
  );
}
