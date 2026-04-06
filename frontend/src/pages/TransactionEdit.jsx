import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API, { getApiErrorMessage } from '../api/client';

function normalizeDate(d) {
  if (!d) return '';
  return typeof d === 'string' ? d.split('T')[0] : d;
}

export default function TransactionEdit() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    type: 'expense',
    category: '',
    date: '',
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setError('');
      setLoading(true);
      try {
        const res = await API.get(`/transactions/${transactionId}`);
        const t = res.data;
        if (cancelled) return;
        setForm({
          amount: String(t.amount),
          type: t.type,
          category: t.category,
          date: normalizeDate(t.date),
          notes: t.notes ?? '',
        });
        setLoaded(true);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, 'Failed to load transaction'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [transactionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.put(`/transactions/${transactionId}`, {
        amount: parseFloat(form.amount),
        type: form.type,
        category: form.category,
        date: form.date,
        notes: form.notes.trim() ? form.notes.trim() : null,
      });
      navigate('/transactions');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update transaction'));
    }
  };

  if (loading) return <div className="loading">Loading transaction...</div>;

  if (!loaded) {
    return (
      <div className="page">
        <h1>Edit Transaction</h1>
        {error && <div className="error-msg">{error}</div>}
        <p className="page-subtitle">
          <button type="button" className="btn-sm" onClick={() => navigate('/transactions')}>
            ← Back to transactions
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Edit Transaction</h1>
      <p className="page-subtitle">Update this income or expense record.</p>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit} className="form">
        <label>
          Amount
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={form.amount}
            onChange={(e) => setForm((current) => ({ ...current, amount: e.target.value }))}
            required
          />
        </label>
        <label>
          Type
          <select value={form.type} onChange={(e) => setForm((current) => ({ ...current, type: e.target.value }))}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>
        <label>
          Category
          <input
            type="text"
            value={form.category}
            onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))}
            required
          />
        </label>
        <label>
          Date
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((current) => ({ ...current, date: e.target.value }))}
            required
          />
        </label>
        <label>
          Notes
          <textarea
            value={form.notes}
            onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))}
          />
        </label>
        <button type="submit">Save changes</button>
      </form>
    </div>
  );
}
