'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';

export default function AdminPrinters() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [printers, setPrinters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testPrinter, setTestPrinter] = useState('');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPrinters();
    }
  }, [status]);

  const fetchPrinters = async () => {
    try {
      const response = await fetch('/api/printers');
      const data = await response.json();
      setPrinters(data);
    } catch (error) {
      console.error('Error fetching printers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (!testPrinter) return;
    
    setTesting(true);
    try {
      const response = await fetch('/api/admin/test-print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ printerName: testPrinter }),
      });

      if (response.ok) {
        alert('✅ Teste de impressão enviado com sucesso!');
      } else {
        alert('❌ Erro ao enviar teste de impressão');
      }
    } catch (error) {
      console.error('Error testing printer:', error);
      alert('❌ Erro ao testar impressora');
    } finally {
      setTesting(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="loading">⏳ Carregando...</div>;
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="admin-layout">
      <AdminNav />
      
      <div className="admin-content">
        <div className="page-header">
          <h1>🖨️ Configurar Impressoras</h1>
        </div>

        <div className="info-card">
          <h2>ℹ️ Informações</h2>
          <p>O sistema detecta automaticamente impressoras instaladas no Windows.</p>
          <p>Certifique-se que a impressora está:</p>
          <ul>
            <li>✅ Instalada no sistema (Painel de Controle → Dispositivos e Impressoras)</li>
            <li>✅ Online e com papel</li>
            <li>✅ Configurada como padrão ou com nome exato conhecido</li>
          </ul>
        </div>

        <div className="printers-section">
          <h2>Impressoras Detectadas</h2>
          {printers.length === 0 ? (
            <div className="empty-state">
              <p>😕 Nenhuma impressora detectada</p>
              <p className="hint">Instale uma impressora no Windows e recarregue a página</p>
            </div>
          ) : (
            <div className="printers-grid">
              {printers.map((printer: any) => (
                <div key={printer.name} className="printer-card">
                  <div className="printer-icon">🖨️</div>
                  <div className="printer-name">{printer.name}</div>
                  <div className="printer-status">{printer.status || 'idle'}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="test-section">
          <h2>🧪 Testar Impressão</h2>
          <p>Envie uma página de teste para verificar se a impressora está funcionando.</p>
          
          <div className="test-form">
            <select
              value={testPrinter}
              onChange={(e) => setTestPrinter(e.target.value)}
              disabled={testing || printers.length === 0}
            >
              <option value="">Selecione uma impressora</option>
              {printers.map((printer: any) => (
                <option key={printer.name} value={printer.name}>
                  {printer.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleTest}
              disabled={!testPrinter || testing}
              className="btn btn-primary"
            >
              {testing ? '⏳ Enviando...' : '🚀 Enviar Teste'}
            </button>
          </div>
        </div>

        <div className="manual-config">
          <h2>⚙️ Configuração Manual</h2>
          <p>Se a impressora não foi detectada, você pode adicioná-la manualmente:</p>
          
          <div className="code-block">
            <code>
              # PowerShell - Listar impressoras<br />
              Get-Printer | Select-Object Name, DriverName
            </code>
          </div>

          <p>Copie o nome exato da impressora e use na interface de captura.</p>
        </div>
      </div>

      <style jsx>{`
        .admin-layout {
          min-height: 100vh;
          background: #f5f7fa;
        }

        .admin-content {
          margin-left: 250px;
          padding: 2rem;
        }

        .page-header h1 {
          font-size: 2rem;
          margin-bottom: 2rem;
          color: #333;
        }

        .info-card {
          background: #e3f2fd;
          padding: 1.5rem;
          border-radius: 0.75rem;
          margin-bottom: 2rem;
          border-left: 4px solid #2196f3;
        }

        .info-card h2 {
          font-size: 1.2rem;
          margin-bottom: 0.75rem;
          color: #1565c0;
        }

        .info-card p {
          margin-bottom: 0.5rem;
          color: #333;
        }

        .info-card ul {
          margin-top: 0.5rem;
          padding-left: 1.5rem;
        }

        .info-card li {
          margin-bottom: 0.25rem;
        }

        .printers-section,
        .test-section,
        .manual-config {
          background: white;
          padding: 2rem;
          border-radius: 0.75rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        h2 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #333;
        }

        .printers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .printer-card {
          border: 2px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 1.5rem;
          text-align: center;
          transition: border-color 0.2s;
        }

        .printer-card:hover {
          border-color: #667eea;
        }

        .printer-icon {
          font-size: 3rem;
          margin-bottom: 0.5rem;
        }

        .printer-name {
          font-weight: 600;
          margin-bottom: 0.5rem;
          word-break: break-word;
        }

        .printer-status {
          font-size: 0.85rem;
          color: #666;
          text-transform: uppercase;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: #666;
        }

        .empty-state p:first-child {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
        }

        .hint {
          font-size: 0.9rem;
          color: #999;
        }

        .test-form {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .test-form select {
          flex: 1;
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 1rem;
        }

        .test-form select:focus {
          outline: none;
          border-color: #667eea;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.2s;
        }

        .btn-primary {
          background: #667eea;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #5568d3;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .code-block {
          background: #2d3748;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 0.5rem;
          margin: 1rem 0;
          overflow-x: auto;
        }

        .code-block code {
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          font-size: 1.5rem;
        }

        @media (max-width: 768px) {
          .admin-content {
            margin-left: 0;
            padding: 1rem;
            padding-top: 80px;
          }

          .test-form {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
