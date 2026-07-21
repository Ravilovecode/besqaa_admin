import { useEffect, useState } from 'react';
import api from '../api/client.js';
import Modal from '../components/Modal.jsx';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const STATUSES = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const badgeClass = { delivered: 'green', cancelled: 'red' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);

  async function load() {
    setLoading(true);
    const q = filter ? `?status=${filter}` : '';
    const res = await api.get(`/admin/orders${q}`);
    setOrders(res.data.orders);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function updateStatus(order, status) {
    try {
      const res = await api.put(`/admin/orders/${order._id}`, { status });
      setOrders((list) => list.map((o) => (o._id === order._id ? res.data.order : o)));
      if (selected?._id === order._id) setSelected(res.data.order);
    } catch (err) {
      alert(err.message);
    }
  }

  // Verify payment + confirm in one step — this also emails the buyer.
  async function verifyAndConfirm(order) {
    try {
      const res = await api.put(`/admin/orders/${order._id}`, {
        paymentStatus: 'paid',
        status: 'confirmed',
      });
      setOrders((list) => list.map((o) => (o._id === order._id ? res.data.order : o)));
      setSelected(res.data.order);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Orders</h1>
          <div className="sub">{orders.length} order(s)</div>
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
        ) : orders.length === 0 ? (
          <div className="empty">No orders yet.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td style={{ fontWeight: 700 }}>#{o.orderNumber}</td>
                  <td>
                    {o.user?.name || '—'}
                    <div style={{ color: 'var(--muted)', fontSize: 12 }}>{o.user?.email}</div>
                  </td>
                  <td>{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                  <td>{inr(o.total)}</td>
                  <td>
                    <span className="badge gray">{o.paymentMethod}</span>
                  </td>
                  <td>
                    <select
                      className="select"
                      style={{ width: 140 }}
                      value={o.status}
                      onChange={(e) => updateStatus(o, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-ghost" onClick={() => setSelected(o)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <Modal title={`Order #${selected.orderNumber}`} onClose={() => setSelected(null)}>
          <p style={{ color: 'var(--muted)', marginTop: 0 }}>
            {selected.user?.name} · {selected.user?.email}
          </p>
          <table className="table">
            <tbody>
              {selected.items.map((i, idx) => (
                <tr key={idx}>
                  <td>{i.name}</td>
                  <td>× {i.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{inr(i.price * i.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 16, lineHeight: 1.9 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Subtotal</span>
              <span>{inr(selected.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>GST (18%)</span>
              <span>{inr(selected.gst)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Delivery</span>
              <span>{inr(selected.deliveryFee)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 800,
                marginTop: 6,
              }}
            >
              <span>Total</span>
              <span style={{ color: 'var(--gold)' }}>{inr(selected.total)}</span>
            </div>
          </div>
          {/* Payment verification */}
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <strong>Payment:</strong>
              <span className="badge gray">{selected.paymentMethod}</span>
              <span
                className={`badge ${
                  selected.paymentStatus === 'paid'
                    ? 'green'
                    : selected.paymentStatus === 'failed'
                      ? 'red'
                      : ''
                }`}
              >
                {selected.paymentStatus}
              </span>
            </div>

            {selected.paymentMethod === 'online' &&
              (selected.paymentProofUrl ? (
                <div style={{ marginTop: 12 }}>
                  <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 8 }}>
                    Payment screenshot (click to open full size):
                  </div>
                  <a href={selected.paymentProofUrl} target="_blank" rel="noreferrer">
                    <img
                      src={selected.paymentProofUrl}
                      alt="Payment proof"
                      style={{
                        maxWidth: 240,
                        maxHeight: 320,
                        borderRadius: 12,
                        border: '1px solid var(--border)',
                      }}
                    />
                  </a>
                </div>
              ) : (
                <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 10 }}>
                  ⚠ No payment screenshot attached.
                </div>
              ))}

            {selected.status === 'placed' && (
              <button
                className="btn btn-gold"
                style={{ marginTop: 14 }}
                onClick={() => verifyAndConfirm(selected)}
              >
                ✓ Verify payment & confirm order (emails buyer)
              </button>
            )}
          </div>

          {selected.shippingAddress?.line1 && (
            <div style={{ marginTop: 16, color: 'var(--muted)', fontSize: 14 }}>
              <strong style={{ color: 'var(--text)' }}>Ship to:</strong>{' '}
              {selected.shippingAddress.line1},{' '}
              {selected.shippingAddress.landmark ? `${selected.shippingAddress.landmark}, ` : ''}
              {selected.shippingAddress.city}, {selected.shippingAddress.state}{' '}
              {selected.shippingAddress.pincode}
              {selected.shippingAddress.phone ? ` · ${selected.shippingAddress.phone}` : ''}
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
