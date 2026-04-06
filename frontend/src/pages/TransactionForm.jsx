import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/client';

export default function TransactionForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/transactions', {
        ...form,
        amount: parseFloat(form.amount),
      });
      navigate('/transactions');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create transaction');
    }
  };

  return (
    <div className="page">
      <h1>Add Transaction</h1>
      <p className="page-subtitle">Create a new income or expense record.</p>
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
        <button type="submit">Create Transaction</button>
      </form>
    </div>
  );
}
