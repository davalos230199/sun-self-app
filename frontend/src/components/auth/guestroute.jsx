import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const GuestRoute = ({ children }) => {
const { user, loading } = useAuth();
  if (loading) {
    return null;
  }
  if (user) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

export default GuestRoute;