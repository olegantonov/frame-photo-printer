'use client';

import { useState, useEffect } from 'react';

export default function PrinterSettings({
  onPrinterSelected,
}: {
  onPrinterSelected: (printerName: string) => void;
}) {
  const [printers, setPrinters] = useState<Array<{ name: string; status: string }>>([]);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        const response = await fetch('/api/printers');
        const data = await response.json();
        setPrinters(data);
        if (data.length > 0) {
          setSelectedPrinter(data[0].name);
          onPrinterSelected(data[0].name); // Auto-select first printer
        }
      } catch (error) {
        console.error('Failed to fetch printers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrinters();
  }, [onPrinterSelected]);

  const handlePrinterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const printer = e.target.value;
    setSelectedPrinter(printer);
    onPrinterSelected(printer);
  };

  return (
    <div className="printer-settings">
      <h3>Configuração de Impressora</h3>
      {loading ? (
        <p>Carregando impressoras...</p>
      ) : printers.length > 0 ? (
        <select value={selectedPrinter} onChange={handlePrinterChange}>
          {printers.map(p => (
            <option key={p.name} value={p.name}>
              {p.name} - {p.status}
            </option>
          ))}
        </select>
      ) : (
        <p>Nenhuma impressora encontrada</p>
      )}
    </div>
  );
}
