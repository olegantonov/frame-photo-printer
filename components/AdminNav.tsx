'use client';

import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function AdminNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="admin-nav">
      <div className="nav-header">
        <h2>📸 Frame Photo</h2>
        <p className="user-info">{session?.user?.email}</p>
      </div>

      <ul className="nav-menu">
        <li>
          <a href="/admin/dashboard" className={isActive('/admin/dashboard') ? 'active' : ''}>
            📊 Dashboard
          </a>
        </li>
        <li>
          <a href="/admin/users" className={isActive('/admin/users') ? 'active' : ''}>
            👥 Usuários
          </a>
        </li>
        <li>
          <a href="/admin/frames" className={isActive('/admin/frames') ? 'active' : ''}>
            🖼️ Molduras
          </a>
        </li>
        <li>
          <a href="/admin/printers" className={isActive('/admin/printers') ? 'active' : ''}>
            🖨️ Impressoras
          </a>
        </li>
        <li>
          <a href="/admin/prints" className={isActive('/admin/prints') ? 'active' : ''}>
            📋 Histórico
          </a>
        </li>
      </ul>

      <div className="nav-footer">
        <a href="/" className="btn-secondary">← Captura</a>
        <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="btn-logout">
          🚪 Sair
        </button>
      </div>

      <style jsx>{`
        .admin-nav {
          position: fixed;
          left: 0;
          top: 0;
          width: 250px;
          height: 100vh;
          background: #2d3748;
          color: white;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .nav-header {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nav-header h2 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .user-info {
          font-size: 0.8rem;
          color: #a0aec0;
          word-break: break-word;
        }

        .nav-menu {
          list-style: none;
          padding: 0;
          margin: 0;
          flex: 1;
        }

        .nav-menu li {
          margin-bottom: 0.5rem;
        }

        .nav-menu a {
          display: block;
          padding: 0.75rem 1rem;
          color: #e2e8f0;
          text-decoration: none;
          border-radius: 0.5rem;
          transition: background 0.2s;
        }

        .nav-menu a:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .nav-menu a.active {
          background: #667eea;
          color: white;
        }

        .nav-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .btn-secondary, .btn-logout {
          padding: 0.75rem;
          border-radius: 0.5rem;
          text-align: center;
          text-decoration: none;
          transition: background 0.2s;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          display: block;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .btn-logout {
          background: #e53e3e;
          color: white;
          width: 100%;
        }

        .btn-logout:hover {
          background: #c53030;
        }

        @media (max-width: 768px) {
          .admin-nav {
            width: 100%;
            height: auto;
            position: relative;
          }

          .nav-menu {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .nav-menu li {
            margin: 0;
          }

          .nav-footer {
            flex-direction: row;
          }
        }
      `}</style>
    </nav>
  );
}
