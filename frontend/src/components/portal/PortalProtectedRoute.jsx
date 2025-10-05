import { Navigate, Outlet } from 'react-router-dom';
import Loader from '../common/Loader';
import usePortalAuth from '../../hooks/usePortalAuth';

const PortalProtectedRoute = ({ children }) => {
  const { user, loading } = usePortalAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!user) {
    return <Navigate to="/portal/login" replace />;
  }

  return children || <Outlet />;
};

export default PortalProtectedRoute;
