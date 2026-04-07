'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';

interface PrintLog {
  id: string;
  printer_name: string;
  status: string;
  printed_at: string;
  error_message: string | null;
  photo: {
    id: string;
    orientation: string;
    created_at: string;
  };
  user: {
    id: string;
    email: string;
    name: string | null;
  } | null;
}

export default function AdminPrints() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<PrintLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 25;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLogs();
    }
  }, [status, page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/prints?limit=${limit}&offset=${page * limit}`);
      const data = await response.json();
      setLogs(data.logs);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching print logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      pending: { label: '⏳ Pendente', color: '#ffc107' },
      printing: { label: '🖨️ Imprimindo', color: '#2196f3' },
      success: { label: '✅ Sucesso', color: '#4caf50' },
      failed: { label: '❌ Falha', color: '#f44336' },
    };

    return badges[status] || { label: status, color: '#999' };
  };

  if (status === 'loading' || loading) {
    return <div className="loading">⏳ Carregando...</div>;
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return null;
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="admin-layout">
      <AdminNav />
      
      <div className="admin-content">
        <div className="page-header">
          <h1>📋 Histórico de Impressões</h1>
          <div className="stats">
            <span className="stat-badge">Total: {total}</span>
          </div>
        </div>

        <div className="prints-table">
          <table>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Impressora</th>
                <th>Foto</th>
                <th>Usuário</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    Nenhuma impressão registrada ainda
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const badge = getStatusBadge(log.status);
                  return (
                    <tr key={log.id}>
                      <td>
                        {new Date(log.printed_at).toLocaleString('pt-BR')}
                      </td>
                      <td>{log.printer_name}</td>
                      <td>
                        <span className="photo-id">
                          {log.photo.orientation === 'portrait' ? '📱' : '🖼️'}{' '}
                          {log.photo.id.substring(0, 8)}
                        </span>
                      </td>
                      <td>
                        {log.user ? (log.user.name || log.user.email) : '-'}
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: badge.color }}
                        >
                          {badge.label}
                        </span>
                        {log.error_message && (
                          <div className="error-tooltip" title={log.error_message}>
                            ⚠️
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              className="btn btn-secondary"
            >
              ← Anterior
            </button>
            <span className="page-info">
              Página {page + 1} de {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1}
              className="btn btn-secondary"
            >
              Próxima →
            </button>
          </div>
        )}
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

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2rem;
          color: #333;
        }

        .stats {
          display: flex;
          gap: 1rem;
        }

        .stat-badge {
          background: #667eea;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .prints-table {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          margin-bottom: 2rem;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: #f7fafc;
        }

        th, td {
          padding: 1rem;
          text-align: left;
        }

        th {
          font-weight: 600;
          color: #4a5568;
          font-size: 0.9rem;
        }

        tbody tr {
          border-top: 1px solid #e2e8f0;
        }

        tbody tr:hover {
          background: #f7fafc;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #999;
          font-style: italic;
        }

        .photo-id {
          font-family: monospace;
          background: #f7fafc;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.85rem;
        }

        .status-badge {
          display: inline-block;
          padding: 0.35rem 0.75rem;
          border-radius: 1rem;
          color: white;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .error-tooltip {
          display: inline-block;
          margin-left: 0.5rem;
          cursor: help;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
        }

        .page-info {
          font-size: 0.9rem;
          color: #666;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.2s;
        }

        .btn-secondary {
          background: #e2e8f0;
          color: #4a5568;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #cbd5e0;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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

          .page-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          table {
            font-size: 0.85rem;
          }

          th, td {
            padding: 0.75rem 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
