import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import Modal from '../components/Modal.jsx';

export default function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', isActive: true });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await api.get('/categories?all=true');
    setCategories(res.data.categories);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: '', description: '', isActive: true });
    setError('');
    setShowModal(true);
  }

  function openEdit(cat) {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || '', isActive: cat.isActive });
    setError('');
    setShowModal(true);
  }

  async function save(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/categories/${editing._id}`, form);
      } else {
        await api.post('/categories', form);
      }
      setShowModal(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(cat) {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await api.delete(`/categories/${cat._id}`);
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Categories</h1>
          <div className="sub">Click a category to open it and add products inside</div>
        </div>
        <button className="btn btn-gold" onClick={openCreate}>
          + New category
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner" />
        ) : categories.length === 0 ? (
          <div className="empty">No categories yet. Create your first one (e.g. Televisions).</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Products</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr
                  key={c._id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/categories/${c._id}`)}
                >
                  <td style={{ fontWeight: 700 }}>
                    {c.name}{' '}
                    <span style={{ color: 'var(--gold)', fontSize: 12 }}>›</span>
                  </td>
                  <td style={{ color: 'var(--muted)' }}>{c.slug}</td>
                  <td>{c.productCount}</td>
                  <td>
                    <span className={`badge ${c.isActive ? 'green' : 'gray'}`}>
                      {c.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td
                    style={{ textAlign: 'right', whiteSpace: 'nowrap' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="btn btn-sm btn-gold"
                      onClick={() => navigate(`/categories/${c._id}`)}
                    >
                      Open
                    </button>{' '}
                    <button className="btn btn-sm btn-ghost" onClick={() => openEdit(c)}>
                      Edit
                    </button>{' '}
                    <button className="btn btn-sm btn-danger" onClick={() => remove(c)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal
          title={editing ? 'Edit category' : 'New category'}
          onClose={() => setShowModal(false)}
        >
          {error && <div className="alert error">{error}</div>}
          <form onSubmit={save}>
            <div className="field">
              <label>Name *</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Televisions"
                required
              />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea
                className="textarea"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Smart TVs and displays"
              />
            </div>
            <div className="field">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Visible in app
              </label>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-gold" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
