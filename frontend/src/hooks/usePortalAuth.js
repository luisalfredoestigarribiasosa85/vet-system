import { useContext } from 'react';
import { PortalAuthContext } from '../contexts/PortalAuthContext';

const usePortalAuth = () => {
  const context = useContext(PortalAuthContext);
  if (!context) {
    throw new Error('usePortalAuth debe usarse dentro de PortalAuthProvider');
  }
  return context;
};

export default usePortalAuth;
