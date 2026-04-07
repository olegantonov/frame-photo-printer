'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    todayPhotos: 0,
    todayPrints: 0,
    pendingPrints: 0,
    totalUsers: 0,
    totalFrames: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchStats();
    }
  }, [status]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
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
        <div className="dashboard-header">
          <h1>📊 Dashboard</h1>
          <p>Bem-vindo, {session.user.name || session.user.email}</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📸</div>
            <div className="stat-value">{stats.todayPhotos}</div>
            <div className="stat-label">Fotos Hoje</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🖨️</div>
            <div className="stat-value">{stats.todayPrints}</div>
            <div className="stat-label">Impressões Hoje</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-value">{stats.pendingPrints}</div>
            <div className="stat-label">Pendentes</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Usuários</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🖼️</div>
            <div className="stat-value">{stats.totalFrames}</div>
            <div className="stat-label">Molduras Ativas</div>
          </div>
        </div>

        <div className="quick-actions">
          <h2>Ações Rápidas</h2>
          <div className="actions-grid">
            <a href="/admin/users" className="action-card">
              <div className="action-icon">👥</div>
              <div className="action-title">Gerenciar Usuários</div>
              <div className="action-desc">Adicionar, editar ou remover usuários</div>
            </a>

            <a href="/admin/frames" className="action-card">
              <div className="action-icon">🖼️</div>
              <div className="action-title">Gerenciar Molduras</div>
              <div className="action-desc">Upload e configuração de molduras</div>
            </a>

            <a href="/admin/printers" className="action-card">
              <div className="action-icon">🖨️</div>
              <div className="action-title">Configurar Impressora</div>
              <div className="action-desc">Testar e configurar impressoras</div>
            </a>

            <a href="/admin/prints" className="action-card">
              <div className="action-icon">📋</div>
              <div className="action-title">Histórico de Impressões</div>
              <div className="action-desc">Ver todas as impressões realizadas</div>
            </a>
          </div>
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

        .dashboard-header {
          margin-bottom: 2rem;
        }

        .dashboard-header h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .dashboard-header p {
          color: #666;
          font-size: 1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .stat-icon {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          color: #666;
          font-size: 0.9rem;
        }

        .quick-actions h2 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #333;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .action-card {
          background: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .action-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .action-icon {
          font-size: 2rem;
          margin-bottom: 0.75rem;
        }

        .action-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .action-desc {
          font-size: 0.9rem;
          color: #666;
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
            padding-top: 80px;
          }
        }
      `}</style>
    </div>
  );
}
