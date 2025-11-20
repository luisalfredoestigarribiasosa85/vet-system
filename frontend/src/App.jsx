import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Pets from './pages/Pets';
import Appointments from './pages/Appointments';
import Medical from './pages/Medical';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import Plans from './pages/Plans';
import Login from './pages/auth/Login';
import MedicalHistory from './pages/MedicalHistory';
import PortalLogin from './pages/portal/PortalLogin';
import PortalRegister from './pages/portal/PortalRegister';
import PortalLayout from './components/portal/PortalLayout';
import PortalProtectedRoute from './components/portal/PortalProtectedRoute';
import PortalDashboard from './pages/portal/PortalDashboard';
import PortalAppointments from './pages/portal/PortalAppointments';
import PortalPets from './pages/portal/PortalPets';
import PortalPetDetails from './pages/portal/PortalPetDetails';
import PortalPlans from './pages/portal/PortalPlans';
import Vaccinations from './pages/Vaccinations';

function App() {
  return (
    <BrowserRouter>
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
            <Layout>
              {/* Layout wraps sidebar + main content */}
            </Layout>
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
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;






