import { Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { getToken } from '../lib/auth';
import Spinner from './Spinner';

export default function RequireAdmin({ children }) {
  const { isAdmin, loading } = useAuth();

  if (!getToken()) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-slate">
        <Spinner />
      </main>
    );
  }

  return isAdmin ? children : <Navigate to="/menu" replace />;
}
