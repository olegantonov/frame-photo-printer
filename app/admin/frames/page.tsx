'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';

interface Frame {
  id: string;
  name: string;
  width_mm: number;
  height_mm: number;
  border_px: number;
  image_url: string | null;
  active: boolean;
  created_at: string;
}

export default function AdminFrames() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFrame, setEditingFrame] = useState<Frame | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    width_mm: '150',
    height_mm: '210',
    border_px: '40',
    image_url: '',
    active: true,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchFrames();
    }
  }, [status]);

  const fetchFrames = async () => {
    try {
      const response = await fetch('/api/admin/frames');
      const data = await response.json();
      setFrames(data);
    } catch (error) {
      console.error('Error fetching frames:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = '/api/admin/frames';
      const method = editingFrame ? 'PUT' : 'POST';
      const body = editingFrame
        ? { ...formData, id: editingFrame.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchFrames();
        setShowModal(false);
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao salvar moldura');
      }
    } catch (error) {
      console.error('Error saving frame:', error);
      alert('Erro ao salvar moldura');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta moldura?')) return;

    try {
      const response = await fetch(`/api/admin/frames?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchFrames();
      } else {
        alert('Erro ao deletar moldura');
      }
    } catch (error) {
      console.error('Error deleting frame:', error);
      alert('Erro ao deletar moldura');
    }
  };

  const handleEdit = (frame: Frame) => {
    setEditingFrame(frame);
    setFormData({
      name: frame.name,
      width_mm: frame.width_mm.toString(),
      height_mm: frame.height_mm.toString(),
      border_px: frame.border_px.toString(),
      image_url: frame.image_url || '',
      active: frame.active,
    });
    setShowModal(true);
  };

  const toggleActive = async (frame: Frame) => {
    try {
      await fetch('/api/admin/frames', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: frame.id,
          ...frame,
          active: !frame.active,
        }),
      });
      await fetchFrames();
    } catch (error) {
      console.error('Error toggling frame:', error);
    }
  };

  const resetForm = () => {
    setEditingFrame(null);
    setFormData({
      name: '',
      width_mm: '150',
      height_mm: '210',
      border_px: '40',
      image_url: '',
      active: true,
    });
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
          <h1>🖼️ Gerenciar Molduras</h1>
          <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-primary">
            ➕ Nova Moldura
          </button>
        </div>

        <div className="frames-grid">
          {frames.map((frame) => (
            <div key={frame.id} className={`frame-card ${!frame.active ? 'inactive' : ''}`}>
              <div className="frame-preview">
                {frame.image_url ? (
                  <img src={frame.image_url} alt={frame.name} />
                ) : (
                  <div className="frame-placeholder">🖼️</div>
                )}
              </div>
              
              <div className="frame-info">
                <h3>{frame.name}</h3>
                <div className="frame-dimensions">
                  📏 {frame.width_mm} x {frame.height_mm} mm
                </div>
                <div className="frame-border">
                  🔲 Borda: {frame.border_px}px
                </div>
              </div>

              <div className="frame-actions">
                <button
                  onClick={() => toggleActive(frame)}
                  className={`btn-toggle ${frame.active ? 'active' : ''}`}
                  title={frame.active ? 'Desativar' : 'Ativar'}
                >
                  {frame.active ? '✅ Ativa' : '❌ Inativa'}
                </button>
                <button onClick={() => handleEdit(frame)} className="btn-icon">✏️</button>
                <button onClick={() => handleDelete(frame.id)} className="btn-icon danger">🗑️</button>
              </div>
            </div>
          ))}

          {frames.length === 0 && (
            <div className="empty-state">
              <p>😕 Nenhuma moldura cadastrada</p>
              <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-primary">
                Criar primeira moldura
              </button>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>{editingFrame ? '✏️ Editar Moldura' : '➕ Nova Moldura'}</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nome</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Ex: 15x21 Retrato"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Largura (mm)</label>
                    <input
                      type="number"
                      value={formData.width_mm}
                      onChange={(e) => setFormData({ ...formData, width_mm: e.target.value })}
                      required
                      min="10"
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label>Altura (mm)</label>
                    <input
                      type="number"
                      value={formData.height_mm}
                      onChange={(e) => setFormData({ ...formData, height_mm: e.target.value })}
                      required
                      min="10"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Borda (pixels)</label>
                  <input
                    type="number"
                    value={formData.border_px}
                    onChange={(e) => setFormData({ ...formData, border_px: e.target.value })}
                    required
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>URL da Imagem (opcional)</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://exemplo.com/moldura.png"
                  />
                  <small>Deixe em branco para usar moldura padrão (borda branca)</small>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    />
                    Moldura ativa (disponível para uso)
                  </label>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingFrame ? 'Salvar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
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

        .frames-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .frame-card {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: transform 0.2s;
        }

        .frame-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .frame-card.inactive {
          opacity: 0.6;
        }

        .frame-preview {
          aspect-ratio: 3/4;
          background: #f7fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 2px solid #e2e8f0;
        }

        .frame-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .frame-placeholder {
          font-size: 4rem;
          opacity: 0.3;
        }

        .frame-info {
          padding: 1.5rem;
        }

        .frame-info h3 {
          font-size: 1.2rem;
          margin-bottom: 0.75rem;
          color: #333;
        }

        .frame-dimensions,
        .frame-border {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.25rem;
        }

        .frame-actions {
          padding: 1rem 1.5rem;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .btn-toggle {
          flex: 1;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.2s;
        }

        .btn-toggle.active {
          background: #c6f6d5;
          color: #22543d;
        }

        .btn-toggle:not(.active) {
          background: #fed7d7;
          color: #c53030;
        }

        .btn-icon {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          transition: transform 0.2s;
        }

        .btn-icon:hover {
          transform: scale(1.2);
        }

        .btn-icon.danger:hover {
          filter: brightness(0.8);
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem 2rem;
          color: #666;
        }

        .empty-state p {
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal h2 {
          margin-bottom: 1.5rem;
          color: #333;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }

        .form-group input[type="text"],
        .form-group input[type="number"],
        .form-group input[type="url"] {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 1rem;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-group small {
          display: block;
          margin-top: 0.25rem;
          font-size: 0.85rem;
          color: #999;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 1.2rem;
          height: 1.2rem;
          cursor: pointer;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-primary {
          background: #667eea;
          color: white;
        }

        .btn-primary:hover {
          background: #5568d3;
        }

        .btn-secondary {
          background: #e2e8f0;
          color: #4a5568;
        }

        .btn-secondary:hover {
          background: #cbd5e0;
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

          .frames-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
