'use client';

import { useRef, useState } from 'react';

export default function CameraCapture({
  onCaptured,
}: {
  onCaptured: (photoId: string, orientation: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const startCamera = async () => {
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
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Permissão de câmera negada');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const toggleCamera = async () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setTimeout(() => startCamera(), 200);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    const imageData = canvasRef.current.toDataURL('image/jpeg');
    const orientation =
      canvasRef.current.height > canvasRef.current.width ? 'portrait' : 'landscape';

    try {
      const response = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData, orientation }),
      });

      const data = await response.json();
      onCaptured(data.photoId, orientation);
      stopCamera();
    } catch (error) {
      console.error('Capture failed:', error);
      alert('Falha ao capturar foto');
    }
  };

  return (
    <div className="camera-capture">
      {!isCameraActive ? (
        <button onClick={startCamera} className="btn btn-primary">
          Iniciar Câmera
        </button>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="camera-preview"
          />
          <canvas ref={canvasRef} hidden />
          <div className="button-group">
            <button onClick={capturePhoto} className="btn btn-success btn-large">
              📸 Capturar Foto
            </button>
            <button onClick={toggleCamera} className="btn btn-primary btn-large">
              🔄 Trocar Câmera
            </button>
            <button onClick={stopCamera} className="btn btn-secondary btn-large">
              ❌ Cancelar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
