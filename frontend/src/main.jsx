import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext';
import { PortalAuthProvider } from './contexts/PortalAuthContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <PortalAuthProvider>
        <App />
      </PortalAuthProvider>
    </AuthProvider>
  </StrictMode>,
);
