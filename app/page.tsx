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

  const handlePrint = async () => {
    if (!defaultPrinter) {
      setMessage('⚠️ Nenhuma impressora configurada. Acesse /admin para configurar.');
      return;
    }

    setIsLoading(true);
    setMessage('🖨️ Enviando para impressão...');

    try {
      const response = await fetch('/api/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, printerName: defaultPrinter }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Foto impressa com sucesso!');
        setTimeout(() => {
          resetToCamera();
        }, 2000);
      } else {
        setMessage(`❌ Erro: ${data.details || data.error}`);
      }
    } catch (error) {
      console.error('Print failed:', error);
      setMessage('❌ Erro ao imprimir');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToCamera = () => {
    setStep('camera');
    setPhotoId('');
    setPreviewUrl('');
    setMessage('');
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

            <div className="action-buttons-vertical">
              <button
                onClick={handlePrint}
                className="btn btn-success btn-xlarge"
                disabled={!defaultPrinter || isLoading}
              >
                {isLoading ? '⏳ Imprimindo...' : '🖨️ IMPRIMIR'}
              </button>
              <button
                onClick={resetToCamera}
                className="btn btn-secondary btn-large"
                disabled={isLoading}
              >
                🔄 Nova Foto
              </button>
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
