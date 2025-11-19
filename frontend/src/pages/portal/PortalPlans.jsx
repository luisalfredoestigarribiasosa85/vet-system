import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import portalApi from '../../api/portalApi';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import usePortalAuth from '../../hooks/usePortalAuth';

const currencyFormatter = new Intl.NumberFormat('es-PY', {
  style: 'currency',
  currency: 'PYG',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const PortalPlans = () => {
  const { refreshProfile } = usePortalAuth();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState([]);
  const [creating, setCreating] = useState(false);
  const [confirming, setConfirming] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, historyRes] = await Promise.all([
        portalApi.get('/portal/plans'),
        portalApi.get('/portal/plans/history'),
      ]);
      setPlans(plansRes.data || []);
      setHistory(historyRes.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error al cargar planes');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (planId) => {
    setCreating(true);
    try {
      const res = await portalApi.post('/portal/plans/checkout', { planId });
      const { purchase, paymentUrl } = res.data;
      toast.success('Pago mock creado. Confirma para simular Bancard.');
      setHistory((prev) => [purchase, ...prev]);
      window.open(paymentUrl, '_blank', 'noopener');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'No se pudo iniciar el pago');
    } finally {
      setCreating(false);
    }
  };

  const handleConfirm = async (purchaseId, success = true) => {
    setConfirming((prev) => ({ ...prev, [purchaseId]: true }));
    try {
      await portalApi.post(`/portal/plans/checkout/${purchaseId}/confirm`, {
        success,
      });
      toast.success(success ? 'Pago marcado como aprobado' : 'Pago cancelado');
      await Promise.all([loadData(), refreshProfile()]);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'No se pudo confirmar el pago');
    } finally {
      setConfirming((prev) => ({ ...prev, [purchaseId]: false }));
    }
  };

  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [history],
  );

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-bold text-slate-800">Plan preventivo</h2>
        <p className="text-sm text-slate-500 mt-1">
          Contrata el plan preventivo y abona al contado utilizando la pasarela Bancard (mock).
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.filter((plan) => plan.isActive).map((plan) => (
            <div key={plan.id} className="border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">{plan.name}</h3>
                  {plan.description ? (
                    <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
                  ) : null}
                </div>
                <p className="text-lg font-bold text-blue-600">
                  {currencyFormatter.format(plan.price)}
                </p>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                IVA del {plan.vatPercentage}% incluido. Pago en Guaranies.
              </p>
              <Button
                className="mt-4"
                onClick={() => handleCheckout(plan.id)}
                disabled={creating}
              >
                {creating ? 'Iniciando pago...' : 'Pagar plan (mock)'}
              </Button>
            </div>
          ))}

          {plans.filter((plan) => plan.isActive).length === 0 ? (
            <p className="text-sm text-slate-500">Aun no hay planes disponibles.</p>
          ) : null}
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-semibold text-slate-800">Historial de pagos</h3>
        {sortedHistory.length === 0 ? (
          <p className="text-sm text-slate-500 mt-4">Aun no registras pagos de planes.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {sortedHistory.map((purchase) => (
              <div
                key={purchase.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-slate-200 rounded-xl p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {purchase.plan?.name || 'Plan'} ? {currencyFormatter.format(purchase.amount)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(purchase.createdAt).toLocaleString()} ? Estado: {purchase.status}
                  </p>
                  {purchase.paymentReference ? (
                    <p className="text-xs text-slate-400">Ref: {purchase.paymentReference}</p>
                  ) : null}
                </div>
                {purchase.status === 'pendiente' ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleConfirm(purchase.id, true)}
                      disabled={confirming[purchase.id]}
                    >
                      {confirming[purchase.id] ? 'Confirmando...' : 'Marcar pagado'}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleConfirm(purchase.id, false)}
                      disabled={confirming[purchase.id]}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PortalPlans;
