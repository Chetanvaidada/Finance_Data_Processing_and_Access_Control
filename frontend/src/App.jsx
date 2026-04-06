import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import TransactionForm from './pages/TransactionForm';
import TransactionEdit from './pages/TransactionEdit';
import AdminUsers from './pages/AdminUsers';
import './App.css';

function NavBar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const linkClassName = ({ isActive }) =>
    `nav-link${isActive ? ' active' : ''}`;

  return (
    <nav className="navbar">
      <div className="nav-brand">Zorvyn Financial</div>
      <div className="nav-links">
        <NavLink to="/" end className={linkClassName}>
          Dashboard
        </NavLink>
        {(user.role === 'analyst' || user.role === 'admin') && (
          <NavLink to="/transactions" className={linkClassName}>
            Transactions
          </NavLink>
        )}
        {user.role === 'admin' && (
          <>
            <NavLink to="/transactions/new" className={linkClassName}>
              Add Transaction
            </NavLink>
            <NavLink to="/admin/users" className={linkClassName}>
              Users
            </NavLink>
          </>
        )}
      </div>
      <div className="nav-user">
        <span>
          {user.email} ({user.role})
        </span>
        <button type="button" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <div className="app">
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute roles={['analyst', 'admin']}>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/new"
            element={
              <ProtectedRoute roles={['admin']}>
                <TransactionForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/:transactionId/edit"
            element={
              <ProtectedRoute roles={['admin']}>
                <TransactionEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
