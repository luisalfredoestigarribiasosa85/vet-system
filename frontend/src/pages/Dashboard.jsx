import { useState, useEffect } from 'react';
import { Calendar, DollarSign, Syringe, Users } from 'lucide-react';
import {
  getOverviewStats,
  getAppointmentStats,
  getRevenueStats,
  getVaccinationStats,
} from '../api/statsApi';
import StatsCard from '../components/dashboard/StatsCard';
import AppointmentsChart from '../components/dashboard/AppointmentsChart';
import RevenueChart from '../components/dashboard/RevenueChart';
import VaccinationsChart from '../components/dashboard/VaccinationsChart';
import Loader from '../components/common/Loader';
import '../components/dashboard/Charts.css';
import './Dashboard.css';

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewData, appointmentsData, revenueData, vaccinationsData] = await Promise.all([
        getOverviewStats(),
        getAppointmentStats(),
        getRevenueStats(),
        getVaccinationStats(),
      ]);

      setOverview(overviewData);
      setAppointments(appointmentsData);
      setRevenue(revenueData);
      setVaccinations(vaccinationsData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatsCard
          title="Citas del Mes"
          value={overview?.appointmentsThisMonth || 0}
          icon={<Calendar size={24} />}
          color="#3498db"
          subtitle="Citas programadas"
        />
        <StatsCard
          title="Ingresos del Mes"
          value={`₲ ${(overview?.revenueThisMonth || 0).toLocaleString()}`}
          icon={<DollarSign size={24} />}
          color="#27ae60"
          subtitle="Total facturado"
        />
        <StatsCard
          title="Mascotas Registradas"
          value={overview?.totalPets || 0}
          icon={<Users size={24} />}
          color="#9b59b6"
          subtitle="Total en sistema"
        />
        <StatsCard
          title="Vacunas Aplicadas"
          value={overview?.vaccinationsThisMonth || 0}
          icon={<Syringe size={24} />}
          color="#e74c3c"
          subtitle="Este mes"
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {appointments.length > 0 && (
          <div className="chart-wrapper">
            <AppointmentsChart data={appointments} />
          </div>
        )}

        {revenue.length > 0 && (
          <div className="chart-wrapper">
            <RevenueChart data={revenue} />
          </div>
        )}

        {vaccinations.length > 0 && (
          <div className="chart-wrapper">
            <VaccinationsChart data={vaccinations} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;