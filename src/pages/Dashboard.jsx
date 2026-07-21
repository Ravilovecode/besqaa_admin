import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function Dashboard() {
  const [stats, setStats] = useState({ categories: 0, products: 0, orders: 0, queries: 0 });
  const [revenue, setRevenue] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [cats, prods, orders, queries] = await Promise.all([
          api.get('/categories?all=true'),
          api.get('/products?all=true&limit=1'),
          api.get('/admin/orders'),
          api.get('/admin/queries'),
        ]);
        const orderList = orders.data.orders;
        setStats({
          categories: cats.data.categories.length,
          products: prods.data.pagination.total,
          orders: orderList.length,
          queries: queries.data.queries.length,
        });
        setRevenue(orderList.reduce((sum, o) => sum + o.total, 0));
        setRecentOrders(orderList.slice(0, 6));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <div className="sub">Overview of your Besqaa store</div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="num">{stats.products}</div>
          <div className="label">Products listed</div>
        </div>
        <div className="stat">
          <div className="num">{stats.categories}</div>
          <div className="label">Categories</div>
        </div>
        <div className="stat">
          <div className="num">{stats.orders}</div>
          <div className="label">Orders</div>
        </div>
        <div className="stat">
          <div className="num">{stats.queries}</div>
          <div className="label">Besqaa queries</div>
        </div>
        <div className="stat">
          <div className="num">{inr(revenue)}</div>
          <div className="label">Total order value</div>
        </div>
      </div>

      <div className="card">
        <div className="page-head" style={{ marginBottom: 12 }}>
          <h1 style={{ fontSize: 18 }}>Recent orders</h1>
          <Link className="btn btn-sm btn-ghost" to="/orders">
            View all
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="empty">No orders yet.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o._id}>
                  <td>#{o.orderNumber}</td>
                  <td>{o.user?.name || '—'}</td>
                  <td>{inr(o.total)}</td>
                  <td>
                    <span className="badge gray">{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
