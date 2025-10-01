import { useState, useEffect } from 'react';
import Loader from '../components/common/Loader';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data || []);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al cargar facturas';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Facturas</h1>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-6 text-gray-600">
          No hay facturas para mostrar aún.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">#</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Cliente</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Fecha</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Total</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-700">{inv.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{inv.client?.name || '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{inv.date}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{inv.total}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 capitalize">{inv.status || 'pendiente'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Invoices;