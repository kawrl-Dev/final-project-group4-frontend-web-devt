import { Navigate } from 'react-router';
import { getToken } from '../lib/auth';

export default function Skip({ children }) {
    return getToken() ? <Navigate to="/menu" replace /> : children;
}