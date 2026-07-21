import { useEffect, useState } from 'react';
import api from '../api/client.js';
import Modal from '../components/Modal.jsx';

const STATUSES = ['new', 'in_review', 'responded', 'closed'];
const badgeClass = { new: '', in_review: 'gray', responded: 'green', closed: 'gray' };
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function Queries() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('new');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const q = filter ? `?status=${filter}` : '';
    const res = await api.get(`/admin/queries${q}`);
    setQueries(res.data.queries);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  function open(q) {
    setSelected(q);
    setNote(q.adminNote || '');
    setStatus(q.status);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await api.put(`/admin/queries/${selected._id}`, { status, adminNote: note });
      setQueries((list) => list.map((q) => (q._id === selected._id ? res.data.query : q)));
      setSelected(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Besqaa Queries</h1>
          <div className="sub">Sourcing requests submitted from the app</div>
        </div>
        <select
          className="select"
          style={{ width: 180 }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner" />
        ) : queries.length === 0 ? (
          <div className="empty">No queries yet.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>From</th>
                <th>Category</th>
                <th>Qty / Budget</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {queries.map((q) => (
                <tr key={q._id}>
                  <td style={{ fontWeight: 700 }}>{q.subject}</td>
                  <td>
                    {q.name}
                    <div style={{ color: 'var(--muted)', fontSize: 12 }}>{q.email}</div>
                  </td>
                  <td style={{ color: 'var(--muted)' }}>{q.category?.name || '—'}</td>
                  <td>
                    {q.quantity} · {q.budget ? inr(q.budget) : '—'}
                  </td>
                  <td>
                    <span className={`badge ${badgeClass[q.status] ?? ''}`}>{q.status}</span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-ghost" onClick={() => open(q)}>
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <Modal title={selected.subject} onClose={() => setSelected(null)}>
          <p style={{ color: 'var(--muted)', marginTop: 0 }}>
            {selected.name} · {selected.email}
            {selected.phone ? ` · ${selected.phone}` : ''}
          </p>
          <div className="card" style={{ background: 'var(--bg-2)', marginBottom: 16 }}>
            {selected.message}
          </div>
          <div className="row">
            <div className="field">
              <label>Category</label>
              <div>{selected.category?.name || '—'}</div>
            </div>
            <div className="field">
              <label>Quantity</label>
              <div>{selected.quantity}</div>
            </div>
            <div className="field">
              <label>Budget</label>
              <div>{selected.budget ? inr(selected.budget) : '—'}</div>
            </div>
          </div>
          <div className="field">
            <label>Status</label>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Internal note / response</label>
            <textarea
              className="textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about how this query was handled…"
            />
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setSelected(null)}>
              Close
            </button>
            <button className="btn btn-gold" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
