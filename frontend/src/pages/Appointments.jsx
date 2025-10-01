import { useState, useEffect } from 'react';
import Loader from '../components/common/Loader';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data || []);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al cargar citas';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Citas</h1>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-6 text-gray-600">
          No hay citas para mostrar aún.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Fecha</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Hora</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Mascota</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Dueño</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {appointments.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-700">{a.date}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{a.time}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{a.pet?.name || '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{a.pet?.owner?.name || '-'}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 capitalize">{a.status || 'pendiente'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Appointments;