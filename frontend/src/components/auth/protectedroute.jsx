import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
const { user, loading } = useAuth();
  if (loading) {
    return null; 
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
};
export default ProtectedRoute;