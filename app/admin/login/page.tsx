'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou senha inválidos');
      } else {
        router.push('/admin/dashboard');
      }
    } catch (error) {
      setError('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="login-card">
        <h1>🔐 Admin Login</h1>
        <p className="subtitle">Frame Photo Printer - Painel Administrativo</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@exemplo.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
            {loading ? '⏳ Entrando...' : '🚀 Entrar'}
          </button>
        </form>

        <div className="login-footer">
          <a href="/">← Voltar para captura</a>
        </div>
      </div>

      <style jsx>{`
        .admin-login {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .login-card {
          background: white;
          padding: 3rem;
          border-radius: 1rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          max-width: 450px;
          width: 100%;
        }

        h1 {
          text-align: center;
          margin-bottom: 0.5rem;
          color: #333;
          font-size: 2rem;
        }

        .subtitle {
          text-align: center;
          color: #666;
          margin-bottom: 2rem;
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e0e0e0;
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        input:focus {
          outline: none;
          border-color: #667eea;
        }

        input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          text-align: center;
          font-size: 0.9rem;
        }

        .btn-large {
          width: 100%;
          padding: 1rem;
          font-size: 1.1rem;
          margin-top: 0.5rem;
        }

        .login-footer {
          text-align: center;
          margin-top: 1.5rem;
        }

        .login-footer a {
          color: #667eea;
          text-decoration: none;
          font-size: 0.9rem;
        }

        .login-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
