import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client.js';
import ProductFormModal from '../components/ProductFormModal.jsx';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// Products inside one category. Add/edit here — no category picker needed.
export default function CategoryProducts() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        api.get(`/categories/${id}`),
        api.get(`/products?all=true&category=${id}&limit=200`),
      ]);
      setCategory(catRes.data.category);
      setProducts(prodRes.data.products);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function remove(p) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try {
      await api.delete(`/products/${p._id}`);
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading && !category) return <div className="spinner" />;

  return (
    <>
      <div className="page-head">
        <div>
          <div style={{ marginBottom: 6 }}>
            <Link to="/categories" style={{ fontSize: 13 }}>
              ← All categories
            </Link>
          </div>
          <h1>{category?.name}</h1>
          <div className="sub">
            {products.length} product(s) in this category
            {category?.description ? ` · ${category.description}` : ''}
          </div>
        </div>
        <button
          className="btn btn-gold"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          + Add product
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner" />
        ) : products.length === 0 ? (
          <div className="empty">
            No products in “{category?.name}” yet.
            <br />
            Click <strong>Add product</strong> to list the first one — it appears in the app
            instantly.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Flags</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    {p.images?.[0] ? (
                      <img className="thumb" src={p.images[0]} alt="" />
                    ) : (
                      <div className="thumb" />
                    )}
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    {p.name}
                    {p.specs?.length > 0 && (
                      <div style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 400 }}>
                        {p.specs
                          .slice(0, 2)
                          .map((s) => `${s.label}: ${s.value}`)
                          .join(' · ')}
                      </div>
                    )}
                  </td>
                  <td>
                    {inr(p.price)}
                    {p.compareAtPrice > 0 && (
                      <span
                        style={{
                          color: 'var(--muted)',
                          textDecoration: 'line-through',
                          marginLeft: 6,
                          fontSize: 12,
                        }}
                      >
                        {inr(p.compareAtPrice)}
                      </span>
                    )}
                  </td>
                  <td>{p.stock}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {p.isDeal && <span className="badge">Deal</span>}{' '}
                    {p.isRecommended && <span className="badge gray">Reco</span>}
                  </td>
                  <td>
                    <span className={`badge ${p.isActive ? 'green' : 'gray'}`}>
                      {p.isActive ? 'Live' : 'Hidden'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => {
                        setEditing(p);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </button>{' '}
                    <button className="btn btn-sm btn-danger" onClick={() => remove(p)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && category && (
        <ProductFormModal
          category={category}
          product={editing}
          onClose={() => setShowForm(false)}
          onSaved={async () => {
            setShowForm(false);
            await load();
          }}
        />
      )}
    </>
  );
}
