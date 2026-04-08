'use client';

import { useState } from 'react';
import CameraCapture from '@/components/CameraCapture';
import PrinterSettings from '@/components/PrinterSettings';

export default function Home() {
  const [step, setStep] = useState<'camera' | 'preview' | 'printing'>('camera');
  const [photoId, setPhotoId] = useState('');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePhotoCaptured = async (id: string, orient: string, preview: string) => {
    setPhotoId(id);
    setOrientation(orient as 'portrait' | 'landscape');
    setPreviewUrl(preview);
    setMessage(`📸 Foto capturada em modo ${orient === 'portrait' ? 'Retrato' : 'Paisagem'}`);
    setStep('preview');
  };

  const handlePrinterSelected = (printerName: string) => {
    setSelectedPrinter(printerName);
  };

  const handlePrint = async () => {
    if (!selectedPrinter || selectedPrinter.includes('Nenhuma')) {
      setMessage('⚠️ Selecione uma impressora válida');
      return;
    }

    setIsLoading(true);
    setMessage('🖨️ Enviando para impressão...');

    try {
      const response = await fetch('/api/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, printerName: selectedPrinter }),
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

  return (
    <main className="app-container">
      <header className="app-header">
        <h1>📸 Frame Photo Printer</h1>
        <p className="subtitle">Capture, enquadre e imprima suas fotos 15x21</p>
      </header>

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

            <div className="print-section">
              <PrinterSettings onPrinterSelected={handlePrinterSelected} />
              
              <div className="action-buttons">
                <button
                  onClick={resetToCamera}
                  className="btn btn-secondary btn-large"
                  disabled={isLoading}
                >
                  🔄 Nova Foto
                </button>
                <button
                  onClick={handlePrint}
                  className="btn btn-success btn-large"
                  disabled={!selectedPrinter || isLoading}
                >
                  {isLoading ? '⏳ Imprimindo...' : '🖨️ Imprimir'}
                </button>
              </div>
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
