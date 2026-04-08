'use client';

import { useState, useEffect, useCallback } from 'react';

interface Printer {
  name: string;
  status: string;
  isDefault?: boolean;
}

export default function PrinterSettings({
  onPrinterSelected,
}: {
  onPrinterSelected: (printerName: string) => void;
}) {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPrinters = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/printers');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setPrinters(data);
        if (data.length > 0) {
          const defaultPrinter = data.find((p: Printer) => p.isDefault) || data[0];
          setSelectedPrinter(defaultPrinter.name);
          onPrinterSelected(defaultPrinter.name);
        }
      }
    } catch (err) {
      console.error('Failed to fetch printers:', err);
      setError('Não foi possível carregar impressoras');
    } finally {
      setLoading(false);
    }
  }, [onPrinterSelected]);

  useEffect(() => {
    fetchPrinters();
  }, [fetchPrinters]);

  const handlePrinterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const printer = e.target.value;
    setSelectedPrinter(printer);
    onPrinterSelected(printer);
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'idle': return 'Pronta';
      case 'printing': return 'Imprimindo';
      case 'disabled': return 'Desativada';
      case 'offline': return 'Offline';
      default: return status;
    }
  };

  return (
    <div className="printer-settings">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3>🖨️ Impressora</h3>
        <button 
          onClick={fetchPrinters} 
          className="btn btn-secondary"
          style={{ padding: '8px 12px', minHeight: 'auto', fontSize: '14px' }}
          disabled={loading}
        >
          🔄 Atualizar
        </button>
      </div>

      {error && (
        <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
      )}

      {loading ? (
        <p style={{ color: '#94a3b8' }}>⏳ Buscando impressoras...</p>
      ) : printers.length > 0 ? (
        <select value={selectedPrinter} onChange={handlePrinterChange}>
          {printers.map(p => (
            <option key={p.name} value={p.name}>
              {getStatusIcon(p.status)} {p.name} - {getStatusText(p.status)}
              {p.isDefault ? ' ⭐' : ''}
            </option>
          ))}
        </select>
      ) : (
        <p style={{ color: '#94a3b8' }}>Nenhuma impressora encontrada. Verifique o CUPS.</p>
      )}
    </div>
  );
}
