import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Activity,
  FileText,
  Calendar,
  PawPrint,
  User
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#65a30d'];

const Medical = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      console.log('Cargando estadísticas del dashboard...');
      const res = await api.get('/medical/dashboard/stats');
      console.log('Estadísticas recibidas:', res.data);
      setStats(res.data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      console.error('Respuesta del servidor:', err?.response);
      const msg = err?.response?.data?.message || err?.message || 'Error al cargar estadísticas';
      toast.error(msg);
      // Mostrar datos vacíos en lugar de null para evitar el mensaje de error
      setStats({
        totalRecords: 0,
        recordsThisMonth: 0,
        commonDiagnoses: [],
        monthlyTrends: [],
        recentRecords: [],
        recordsBySpecies: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  // Formatear datos para el gráfico de tendencias
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const trendData = stats.monthlyTrends.map(item => ({
    name: monthNames[parseInt(item.month.split('-')[1]) - 1],
    consultas: item.count
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard de Historial Médico</h1>
        <p className="text-gray-600 mt-1">Resumen y estadísticas de consultas veterinarias</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Registros</p>
              <p className="text-3xl font-bold mt-2">{stats.totalRecords}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <FileText size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Este Mes</p>
              <p className="text-3xl font-bold mt-2">{stats.recordsThisMonth}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <Calendar size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium">Diagnósticos</p>
              <p className="text-3xl font-bold mt-2">{stats.commonDiagnoses.length}</p>
              <p className="text-pink-100 text-xs mt-1">más comunes</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <Activity size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Especies</p>
              <p className="text-3xl font-bold mt-2">{stats.recordsBySpecies.length}</p>
              <p className="text-orange-100 text-xs mt-1">atendidas</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <PawPrint size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencias Mensuales */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Tendencias Mensuales</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="consultas"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: '#2563eb', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Diagnósticos Más Comunes */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Diagnósticos Más Comunes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.commonDiagnoses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#7c3aed" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Species Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Distribución por Especie</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stats.recordsBySpecies}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {stats.recordsBySpecies.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Records */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Registros Recientes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Mascota</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Especie</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Propietario</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Veterinario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(record.createdAt).toLocaleDateString('es-PY')}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {record.pet?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {record.pet?.species || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="flex items-center">
                        <User size={14} className="mr-1 text-gray-400" />
                        {record.pet?.owner?.name || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {record.veterinarian?.name || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Medical;