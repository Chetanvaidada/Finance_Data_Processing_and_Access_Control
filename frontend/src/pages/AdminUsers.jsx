import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { getApiErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

const DEACTIVATED_MSG = 'This account has been deactivated. Please contact an admin.';
const ROLE_NO_LONGER_ADMIN_MSG =
  'Your role was changed and you no longer have admin access. Please sign in again.';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users');
      setUsers(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load users'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const updateUser = async (userId, updates) => {
    try {
      await API.patch(`/users/${userId}`, updates);
      const isSelf = user && String(user.id) === String(userId);
      if (isSelf && updates.is_active === false) {
        logout();
        navigate('/login', { replace: true, state: { message: DEACTIVATED_MSG } });
        return;
      }
      const selfDemotedFromAdmin =
        isSelf &&
        updates.role != null &&
        user.role === 'admin' &&
        updates.role !== 'admin';
      if (selfDemotedFromAdmin) {
        logout();
        navigate('/login', { replace: true, state: { message: ROLE_NO_LONGER_ADMIN_MSG } });
        return;
      }
      fetchUsers();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Update failed'));
    }
  };

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div className="page">
      <h1>User Management (Admin)</h1>
      <p className="page-subtitle">Manage user roles and account status.</p>
      {error && <div className="error-msg">{error}</div>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => updateUser(user.id, { role: e.target.value })}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="analyst">Analyst</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <span className={`status-pill ${user.is_active ? 'active' : 'inactive'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn-sm"
                    onClick={() => updateUser(user.id, { is_active: !user.is_active })}
                  >
                    {user.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
