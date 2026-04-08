'use client';

import { useRef, useState, useCallback } from 'react';

export default function CameraCapture({
  onCaptured,
}: {
  onCaptured: (photoId: string, orientation: string, previewUrl: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState('');

  const startCamera = useCallback(async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setError('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  }, []);

  const toggleCamera = useCallback(async () => {
    stopCamera();
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    setTimeout(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: newMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      } catch (err) {
        setError('Não foi possível trocar a câmera.');
      }
    }, 200);
  }, [facingMode, stopCamera]);

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    setIsCapturing(true);
    setError('');

    const context = canvasRef.current.getContext('2d');
    if (!context) {
      setIsCapturing(false);
      return;
    }

    const video = videoRef.current;
    canvasRef.current.width = video.videoWidth;
    canvasRef.current.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvasRef.current.toDataURL('image/jpeg', 0.92);

    try {
      const response = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData }),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar foto');
      }

      const data = await response.json();
      stopCamera();
      onCaptured(data.photoId, data.orientation, imageData);
    } catch (err) {
      console.error('Capture failed:', err);
      setError('Falha ao capturar foto. Tente novamente.');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="camera-section">
      {error && <div className="error-message">{error}</div>}
      
      {!isCameraActive ? (
        <div className="camera-start">
          <div className="camera-icon">📷</div>
          <h2>Pronto para capturar</h2>
          <p>Clique para iniciar a câmera</p>
          <button onClick={startCamera} className="btn btn-primary btn-large">
            🎥 Iniciar Câmera
          </button>
        </div>
      ) : (
        <div className="camera-active">
          <div className="video-wrapper">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-preview"
            />
            {isCapturing && (
              <div className="capture-flash" />
            )}
          </div>
          <canvas ref={canvasRef} hidden />
          
          <div className="camera-controls">
            <button 
              onClick={stopCamera} 
              className="btn btn-secondary"
              disabled={isCapturing}
            >
              ✕ Cancelar
            </button>
            <button 
              onClick={capturePhoto} 
              className="btn btn-capture"
              disabled={isCapturing}
            >
              {isCapturing ? '⏳' : '📸'}
            </button>
            <button 
              onClick={toggleCamera} 
              className="btn btn-secondary"
              disabled={isCapturing}
            >
              🔄 Trocar
            </button>
          </div>
          
          <p className="camera-hint">
            A moldura 15×21 será aplicada automaticamente
          </p>
        </div>
      )}
    </div>
  );
}
