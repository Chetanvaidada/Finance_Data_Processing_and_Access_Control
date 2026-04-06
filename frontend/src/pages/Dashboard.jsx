import { useState, useEffect } from 'react';
import API from '../api/client';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const formatCurrency = (value) => `$${Number(value).toLocaleString()}`;
const PIE_COLORS = {
  income: '#2ac37d',
  expense: '#ff5f6d',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboardView, setDashboardView] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [sumRes, trendRes, catRes, recentRes] = await Promise.all([
          API.get('/dashboard/summary'),
          API.get('/dashboard/trends'),
          API.get('/dashboard/categories'),
          API.get('/dashboard/recent'),
        ]);
        setSummary(sumRes.data);
        setTrends(trendRes.data);
        setCategories(catRes.data);
        setRecent(recentRes.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error-msg">{error}</div>;

  const pieData = summary
    ? [
        { name: 'Income', value: Number(summary.total_income), key: 'income' },
        { name: 'Expense', value: Number(summary.total_expenses), key: 'expense' },
      ].filter((item) => item.value > 0)
    : [];

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <p className="page-subtitle">
        Welcome back, {user?.email}. You are signed in as <strong>{user?.role}</strong>.
      </p>

      {summary && (
        <div className="summary-cards">
          <div className="card income">
            <h3>Total Income</h3>
            <p className="amount">{formatCurrency(summary.total_income)}</p>
          </div>
          <div className="card expense">
            <h3>Total Expenses</h3>
            <p className="amount">{formatCurrency(summary.total_expenses)}</p>
          </div>
          <div className="card balance">
            <h3>Net Balance</h3>
            <p className="amount">{formatCurrency(summary.net_balance)}</p>
          </div>
          <div className="card total">
            <h3>Transactions</h3>
            <p className="amount">{summary.total_transactions}</p>
          </div>
        </div>
      )}

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar" aria-label="Dashboard navigation">
          <div className="dashboard-sidebar-title">Views</div>
          <div className="sidebar-nav">
            <button
              type="button"
              className={`sidebar-button${dashboardView === 'overview' ? ' active' : ''}`}
              aria-current={dashboardView === 'overview' ? 'page' : undefined}
              onClick={() => setDashboardView('overview')}
            >
              Overview
            </button>
            <button
              type="button"
              className={`sidebar-button${dashboardView === 'recent' ? ' active' : ''}`}
              aria-current={dashboardView === 'recent' ? 'page' : undefined}
              onClick={() => setDashboardView('recent')}
            >
              Recent Transactions
            </button>
            <button
              type="button"
              className={`sidebar-button${dashboardView === 'categories' ? ' active' : ''}`}
              aria-current={dashboardView === 'categories' ? 'page' : undefined}
              onClick={() => setDashboardView('categories')}
            >
              Category Breakdown
            </button>
          </div>
        </aside>

        <div className="dashboard-main">
          {dashboardView === 'recent' ? (
            <div className="dashboard-grid">
              <div className="section section-wide">
                <h2>Recent Transactions</h2>
                {recent.length === 0 ? (
                  <p className="empty-state">No transactions yet.</p>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Category</th>
                          <th>Type</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recent.map((transaction) => (
                          <tr key={transaction.id}>
                            <td>{transaction.date}</td>
                            <td>{transaction.category}</td>
                            <td>{transaction.type}</td>
                            <td className={transaction.type === 'income' ? 'text-green' : 'text-red'}>
                              {formatCurrency(transaction.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : dashboardView === 'categories' ? (
            <div className="dashboard-grid">
              <div className="section section-wide">
                <h2>Category Breakdown</h2>
                {categories.length === 0 ? (
                  <p className="empty-state">No data available.</p>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Type</th>
                          <th>Total</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((category) => (
                          <tr key={`${category.category}-${category.type}`}>
                            <td>{category.category}</td>
                            <td>{category.type}</td>
                            <td>{formatCurrency(category.total)}</td>
                            <td>{category.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="dashboard-grid">
              <div className="section">
                <h2>Income vs Expense</h2>
                {pieData.length === 0 ? (
                  <p className="empty-state">No data available.</p>
                ) : (
                  <>
                    <div className="chart-wrap">
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={58}
                            outerRadius={88}
                            paddingAngle={2}
                          >
                            {pieData.map((entry) => (
                              <Cell key={entry.key} fill={PIE_COLORS[entry.key]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => formatCurrency(value)}
                            contentStyle={{
                              background: '#111a2e',
                              border: '1px solid #253451',
                              borderRadius: 8,
                              color: '#e5ecf9',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="chart-legend">
                      <span className="chart-legend-item">
                        <span className="chart-dot income" />
                        Income: {formatCurrency(summary.total_income)}
                      </span>
                      <span className="chart-legend-item">
                        <span className="chart-dot expense" />
                        Expense: {formatCurrency(summary.total_expenses)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="section">
                <h2>Monthly Trends</h2>
                {trends.length === 0 ? (
                  <p className="empty-state">No data available.</p>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th>Income</th>
                          <th>Expenses</th>
                          <th>Net</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trends.map((t) => (
                          <tr key={t.month}>
                            <td>{t.month}</td>
                            <td className="text-green">{formatCurrency(t.income)}</td>
                            <td className="text-red">{formatCurrency(t.expenses)}</td>
                            <td>{formatCurrency(t.net)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
