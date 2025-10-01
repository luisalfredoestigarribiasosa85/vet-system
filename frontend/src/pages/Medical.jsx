import { Search } from 'lucide-react';
import Loader from '../components/common/Loader';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Medical = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const res = await api.get('/medical');
      setRecords(res.data || []);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al cargar historial médico';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Historial Médico</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por cliente o mascota..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {records.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-6 text-gray-600">
          No hay registros médicos para mostrar aún.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Fecha</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Mascota</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Dueño</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Veterinario</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records
                .filter((r) => {
                  const q = (searchTerm || '').toLowerCase().trim();
                  if (!q) return true;
                  const pet = r.pet?.name?.toLowerCase() || '';
                  const owner = r.pet?.owner?.name?.toLowerCase() || '';
                  return pet.includes(q) || owner.includes(q);
                })
                .map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-700">{r.date}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{r.pet?.name || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{r.pet?.owner?.name || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{r.veterinarian?.name || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-700 truncate max-w-xs" title={r.notes || ''}>
                      {r.notes || '-'}
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

export default Medical;