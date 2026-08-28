import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PortalLayout from './components/portal/PortalLayout';
import PortalProtectedRoute from './components/portal/PortalProtectedRoute';
import Loader from './components/common/Loader';

// Páginas cargadas bajo demanda (code splitting por ruta)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Clients = lazy(() => import('./pages/Clients'));
const Pets = lazy(() => import('./pages/Pets'));
const Appointments = lazy(() => import('./pages/Appointments'));
const Medical = lazy(() => import('./pages/Medical'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Invoices = lazy(() => import('./pages/Invoices'));
const Payments = lazy(() => import('./pages/Payments'));
const Plans = lazy(() => import('./pages/Plans'));
const Login = lazy(() => import('./pages/auth/Login'));
const MedicalHistory = lazy(() => import('./pages/MedicalHistory'));
const Vaccinations = lazy(() => import('./pages/Vaccinations'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Subscription = lazy(() => import('./pages/Subscription'));

// Portal
const PortalLogin = lazy(() => import('./pages/portal/PortalLogin'));
const PortalRegister = lazy(() => import('./pages/portal/PortalRegister'));
const PortalDashboard = lazy(() => import('./pages/portal/PortalDashboard'));
const PortalAppointments = lazy(() => import('./pages/portal/PortalAppointments'));
const PortalPets = lazy(() => import('./pages/portal/PortalPets'));
const PortalPetDetails = lazy(() => import('./pages/portal/PortalPetDetails'));
const PortalPlans = lazy(() => import('./pages/portal/PortalPlans'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader fullScreen />}>
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/portal/login" element={<PortalLogin />} />
        <Route path="/portal/register" element={<PortalRegister />} />

        <Route
          path="/portal"
          element={
            <PortalProtectedRoute>
              <PortalLayout />
            </PortalProtectedRoute>
          }
        >
          <Route index element={<PortalDashboard />} />
          <Route path="appointments" element={<PortalAppointments />} />
          <Route path="pets" element={<PortalPets />} />
          <Route path="plans" element={<PortalPlans />} />
          <Route path="pets/:petId" element={<PortalPetDetails />} />
        </Route>

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                {/* Layout wraps sidebar + main content */}
              </Layout>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="pets" element={<Pets />} />
          <Route path="pets/:petId/history" element={<MedicalHistory />} />
          <Route path="vaccinations/:petId" element={<Vaccinations />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="medical" element={<Medical />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="plans" element={<Plans />} />
          <Route path="payments" element={<Payments />} />
          <Route path="subscription" element={<Subscription />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;






