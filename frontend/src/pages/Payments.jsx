import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';

const currencyFormatter = new Intl.NumberFormat('es-PY', {
  style: 'currency',
  currency: 'PYG',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const statusLabels = {
  pendiente: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700' },
  pagado: { label: 'Pagado', className: 'bg-green-100 text-green-700' },
  cancelado: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
};

const Payments = () => {
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments/plans');
      setPurchases(res.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error al obtener pagos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, updates) => {
    setUpdating((prev) => ({ ...prev, [id]: true }));
    try {
      await api.patch(`/payments/plans/${id}`, updates);
      toast.success('Pago actualizado');
      await loadPurchases();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'No se pudo actualizar');
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Pagos de planes</h1>
        <Button variant="secondary" onClick={loadPurchases}>
          Actualizar
        </Button>
      </div>

      {purchases.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-6 text-gray-600">
          No hay pagos registrados.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Monto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Referencia</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {purchases.map((purchase) => {
                const statusInfo = statusLabels[purchase.status] || statusLabels.pendiente;
                return (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(purchase.createdAt).toLocaleString('es-PY')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {purchase.client?.name || 'Cliente'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {purchase.plan?.name || 'Plan'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {currencyFormatter.format(purchase.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {purchase.paymentReference || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleUpdateStatus(purchase.id, { status: 'pagado' })}
                          disabled={updating[purchase.id] || purchase.status === 'pagado'}
                        >
                          Marcar pagado
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleUpdateStatus(purchase.id, { status: 'cancelado' })}
                          disabled={updating[purchase.id] || purchase.status === 'cancelado'}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Payments;
