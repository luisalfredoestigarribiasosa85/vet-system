import { useState, useEffect } from 'react';
import { Users, PawPrint, Calendar, Package, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import Loader from '../components/common/Loader';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [clients, pets, appointments, inventory] = await Promise.all([
        api.get('/clients'),
        api.get('/pets'),
        api.get('/appointments'),
        api.get('/inventory/alerts')
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointments.data.filter(a => a.date === today);

      setStats({
        clients: clients.data.length,
        pets: pets.data.length,
        todayAppointments: todayAppointments.length,
        inventory: inventory.data.lowStock.length + inventory.data.expiring.length,
        alerts: inventory.data
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

      {stats?.alerts && (stats.alerts.lowStock.length > 0 || stats.alerts.expiring.length > 0) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-start">
            <AlertCircle className="text-yellow-400 mr-3 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-yellow-800">Alertas de Inventario</h3>
              {stats.alerts.lowStock.length > 0 && (
                <p className="text-sm text-yellow-700">
                  {stats.alerts.lowStock.length} producto(s) con stock bajo
                </p>
              )}
              {stats.alerts.expiring.length > 0 && (
                <p className="text-sm text-yellow-700">
                  {stats.alerts.expiring.length} producto(s) próximos a vencer
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Clientes Activos</p>
              <p className="text-3xl font-bold mt-2">{stats?.clients || 0}</p>
            </div>
            <Users size={40} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Mascotas Registradas</p>
              <p className="text-3xl font-bold mt-2">{stats?.pets || 0}</p>
            </div>
            <PawPrint size={40} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Citas Hoy</p>
              <p className="text-3xl font-bold mt-2">{stats?.todayAppointments || 0}</p>
            </div>
            <Calendar size={40} className="text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Alertas de Inventario</p>
              <p className="text-3xl font-bold mt-2">{stats?.inventory || 0}</p>
            </div>
            <Package size={40} className="text-orange-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;