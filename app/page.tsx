'use client';

import { useState } from 'react';
import CameraCapture from '@/components/CameraCapture';
import FrameSelector from '@/components/FrameSelector';
import PrinterSettings from '@/components/PrinterSettings';

export default function Home() {
  const [step, setStep] = useState<'camera' | 'frame' | 'printer' | 'preview'>('camera');
  const [photoId, setPhotoId] = useState('');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhotoCaptured = (id: string, orient: string) => {
    setPhotoId(id);
    setOrientation(orient as 'portrait' | 'landscape');
    setStep('frame');
  };

  const handleOrientationSelected = async (orient: 'portrait' | 'landscape') => {
    setOrientation(orient);
    setIsLoading(true);

    try {
      await fetch('/api/frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, orientation: orient }),
      });

      setStep('printer');
    } catch (error) {
      console.error('Frame application failed:', error);
      alert('Falha ao aplicar moldura');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrinterSelected = (printerName: string) => {
    setSelectedPrinter(printerName);
  };

  const handlePrint = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, printerName: selectedPrinter }),
      });

      if (response.ok) {
        alert('Foto enviada para impressão com sucesso');
        setStep('camera');
        setPhotoId('');
      } else {
        alert('Falha ao enviar para impressão');
      }
    } catch (error) {
      console.error('Print failed:', error);
      alert('Erro ao imprimir');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container">
      <h1 className="title">Frame Photo Printer</h1>

      <div className="section">
        {step === 'camera' && <CameraCapture onCaptured={handlePhotoCaptured} />}

        {step === 'frame' && (
          <FrameSelector onOrientationSelected={handleOrientationSelected} />
        )}

        {step === 'printer' && (
          <>
            <PrinterSettings onPrinterSelected={handlePrinterSelected} />
            <div className="button-group" style={{ marginTop: '2rem', justifyContent: 'center' }}>
              <button
                onClick={() => setStep('camera')}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                Voltar
              </button>
              <button
                onClick={handlePrint}
                className="btn btn-success"
                disabled={!selectedPrinter || isLoading}
              >
                {isLoading ? 'Enviando...' : 'Imprimir'}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
