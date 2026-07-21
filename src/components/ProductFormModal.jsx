import { useRef, useState } from 'react';
import api from '../api/client.js';
import Modal from './Modal.jsx';

const emptyForm = {
  name: '',
  price: '',
  compareAtPrice: '',
  stock: '',
  brand: '',
  description: '',
  images: [],
  specs: [],
  shipsInDays: 2,
  isDeal: false,
  isRecommended: false,
  isActive: true,
};

// Add/edit a product inside a fixed category (no category picker — the
// category comes from the page you're on).
export default function ProductFormModal({ category, product, onClose, onSaved }) {
  const editing = Boolean(product);
  const [form, setForm] = useState(
    editing
      ? {
          name: product.name,
          price: product.price,
          compareAtPrice: product.compareAtPrice || '',
          stock: product.stock,
          brand: product.brand || '',
          description: product.description || '',
          images: product.images || [],
          specs: product.specs || [],
          shipsInDays: product.shipsInDays ?? 2,
          isDeal: product.isDeal,
          isRecommended: product.isRecommended,
          isActive: product.isActive,
        }
      : emptyForm
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  async function handleUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setError('');
    try {
      const data = new FormData();
      files.forEach((f) => data.append('images', f));
      const res = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((f) => ({ ...f, images: [...f.images, ...res.data.urls] }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function removeImage(url) {
    setForm((f) => ({ ...f, images: f.images.filter((i) => i !== url) }));
  }

  function updateSpec(idx, key, value) {
    setForm((f) => {
      const specs = [...f.specs];
      specs[idx] = { ...specs[idx], [key]: value };
      return { ...f, specs };
    });
  }
  const addSpec = () => setForm((f) => ({ ...f, specs: [...f.specs, { label: '', value: '' }] }));
  const removeSpec = (idx) =>
    setForm((f) => ({ ...f, specs: f.specs.filter((_, i) => i !== idx) }));

  async function save(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        category: category._id,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : 0,
        stock: Number(form.stock) || 0,
        shipsInDays: Number(form.shipsInDays) || 2,
        specs: form.specs.filter((s) => s.label && s.value),
      };
      if (editing) await api.put(`/products/${product._id}`, payload);
      else await api.post('/products', payload);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={editing ? `Edit product · ${category.name}` : `Add product to ${category.name}`}
      onClose={onClose}
      width="640px"
    >
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={save}>
        <div className="field">
          <label>Product name *</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder='43" LED Smart TV'
            required
            autoFocus
          />
        </div>

        <div className="row">
          <div className="field">
            <label>Price (₹) *</label>
            <input
              className="input"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Compare-at price (₹)</label>
            <input
              className="input"
              type="number"
              value={form.compareAtPrice}
              onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
              placeholder="Original price for deals"
            />
          </div>
          <div className="field">
            <label>Stock *</label>
            <input
              className="input"
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label>Brand</label>
            <input
              className="input"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Ships in (days)</label>
            <input
              className="input"
              type="number"
              value={form.shipsInDays}
              onChange={(e) => setForm({ ...form, shipsInDays: e.target.value })}
            />
          </div>
        </div>

        <div className="field">
          <label>Details / description</label>
          <textarea
            className="textarea"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Key details buyers should know…"
          />
        </div>

        {/* Images */}
        <div className="field">
          <label>Images (uploaded to S3)</label>
          <div className="uploader" onClick={() => fileRef.current?.click()}>
            {uploading ? 'Uploading…' : '📷 Click to upload product photos'}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleUpload} />
          {form.images.length > 0 && (
            <div className="img-preview-row">
              {form.images.map((url) => (
                <div className="img-preview" key={url}>
                  <img src={url} alt="" />
                  <button type="button" className="rm" onClick={() => removeImage(url)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Specifications — size, display, warranty, etc. */}
        <div className="field">
          <label>Specifications (size, display, warranty…)</label>
          {form.specs.map((s, idx) => (
            <div className="row" key={idx} style={{ marginBottom: 8 }}>
              <input
                className="input"
                placeholder="Label (e.g. Size)"
                value={s.label}
                onChange={(e) => updateSpec(idx, 'label', e.target.value)}
              />
              <input
                className="input"
                placeholder='Value (e.g. 43 inch)'
                value={s.value}
                onChange={(e) => updateSpec(idx, 'value', e.target.value)}
              />
              <button
                type="button"
                className="btn btn-sm btn-danger"
                style={{ flex: '0 0 auto' }}
                onClick={() => removeSpec(idx)}
              >
                ×
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-sm btn-ghost" onClick={addSpec}>
            + Add spec row
          </button>
        </div>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={form.isDeal}
              onChange={(e) => setForm({ ...form, isDeal: e.target.checked })}
            />
            Best deal
          </label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={form.isRecommended}
              onChange={(e) => setForm({ ...form, isRecommended: e.target.checked })}
            />
            Recommended
          </label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Visible in app
          </label>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-gold" disabled={saving || uploading}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Add product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
