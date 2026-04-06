import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { getApiErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

const formatCurrency = (value) => `$${Number(value).toLocaleString()}`;

export default function Transactions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const [data, setData] = useState({ items: [], total: 0, page: 1, page_size: 20, total_pages: 0 });
  const [draftFilters, setDraftFilters] = useState({ type: '', category: '' });
  const [appliedFilters, setAppliedFilters] = useState({ type: '', category: '', page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page: appliedFilters.page, page_size: 20 };
      if (appliedFilters.type) params.type = appliedFilters.type;
      if (appliedFilters.category) params.category = appliedFilters.category;
      const res = await API.get('/transactions', { params });
      setData(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load transactions'));
    } finally {
      setLoading(false);
    }
  }, [appliedFilters.page, appliedFilters.type, appliedFilters.category]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleFilter = (e) => {
    e.preventDefault();
    setAppliedFilters((current) => ({
      ...current,
      type: draftFilters.type,
      category: draftFilters.category,
      page: 1,
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await API.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Delete failed'));
    }
  };

  return (
    <div className="page">
      <div className="page-header-row">
        <h1>Transactions</h1>
      </div>
      <p className="page-subtitle">Track and review all recorded transactions.</p>

      <form onSubmit={handleFilter} className="filter-bar">
        <select
          value={draftFilters.type}
          onChange={(e) => setDraftFilters((current) => ({ ...current, type: e.target.value }))}
        >
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input
          type="text"
          placeholder="Category"
          value={draftFilters.category}
          onChange={(e) => setDraftFilters((current) => ({ ...current, category: e.target.value }))}
        />
        <button type="submit">Filter</button>
      </form>

      {error && <div className="error-msg">{error}</div>}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <p className="muted-text">
            Showing {data.items.length} of {data.total} transactions (Page {data.page}/{data.total_pages || 1})
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th><th>Category</th><th>Type</th><th>Amount</th><th>Notes</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {data.items.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.date}</td>
                    <td>{transaction.category}</td>
                    <td>{transaction.type}</td>
                    <td className={transaction.type === 'income' ? 'text-green' : 'text-red'}>
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td>{transaction.notes || '—'}</td>
                    {isAdmin && (
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn-sm"
                            onClick={() => navigate(`/transactions/${transaction.id}/edit`)}
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            className="btn-sm btn-danger"
                            onClick={() => handleDelete(transaction.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              type="button"
              disabled={data.page <= 1}
              onClick={() => setAppliedFilters((current) => ({ ...current, page: current.page - 1 }))}
            >
              ← Prev
            </button>
            <span>Page {data.page} / {data.total_pages}</span>
            <button
              type="button"
              disabled={data.page >= data.total_pages}
              onClick={() => setAppliedFilters((current) => ({ ...current, page: current.page + 1 }))}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
