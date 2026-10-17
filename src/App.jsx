import { Link } from 'react-router';
import { usePWA } from './hooks/usePWA';

export default function App() {
  const { isInstallable, installApp, isOnline } = usePWA();

  return (
    <>
      <h1>MinosDB</h1>
      <Link to="/register" style={{color: '#2563eb', textDecoration: 'underline'}}>
        Go to Register
      </Link>
    </>
  );
}