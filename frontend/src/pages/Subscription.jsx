import { useState, useEffect } from 'react';
import { CreditCard, Calendar, Users, Database, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';

const Subscription = () => {
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [usage, setUsage] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orgRes, usageRes, plansRes] = await Promise.all([
        api.get('/organizations/current'),
        api.get('/organizations/usage'),
        api.get('/subscriptions/plans')
      ]);

      setOrganization(orgRes.data);
      setSubscription(orgRes.data.subscription);
      setUsage(usageRes.data);
      setPlans(plansRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar información de suscripción');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      const response = await api.post('/subscriptions/checkout', {
        planId,
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: `${window.location.origin}/subscription`
      });

      // Redirigir a Stripe Checkout
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error al crear checkout:', error);
      toast.error('Error al procesar el pago');
    }
  };

  const handleCancel = async () => {
    if (!confirm('¿Estás seguro de que quieres cancelar tu suscripción? Se cancelará al final del período actual.')) {
      return;
    }

    try {
      await api.post('/subscriptions/cancel');
      toast.success('Suscripción cancelada exitosamente');
      loadData(); // Recargar datos
    } catch (error) {
      console.error('Error al cancelar suscripción:', error);
      toast.error('Error al cancelar suscripción');
    }
  };

  const handleReactivate = async () => {
    try {
      await api.post('/subscriptions/reactivate');
      toast.success('Suscripción reactivada exitosamente');
      loadData(); // Recargar datos
    } catch (error) {
      console.error('Error al reactivar suscripción:', error);
      toast.error('Error al reactivar suscripción');
    }
  };

  const formatCurrency = (amount) => {
    return `Gs. ${parseInt(amount || 0).toLocaleString('es-PY')}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      trialing: 'bg-blue-100 text-blue-800',
      past_due: 'bg-red-100 text-red-800',
      canceled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.trialing;
  };

  const getStatusText = (status) => {
    const texts = {
      active: 'Activa',
      trialing: 'En período de prueba',
      past_due: 'Pago pendiente',
      canceled: 'Cancelada'
    };
    return texts[status] || status;
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Suscripción</h1>
          <p className="text-gray-600 mt-1">Gestiona tu plan y límites</p>
        </div>
      </div>

      {/* Current Subscription */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Plan Actual</h2>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-gray-800">
                {subscription?.plan?.name || 'Free'}
              </span>
              {subscription?.status && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                  {getStatusText(subscription.status)}
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-gray-800">
              {formatCurrency(subscription?.plan?.price || 0)}
            </div>
            <div className="text-sm text-gray-500">por mes</div>
          </div>
        </div>

        {/* Subscription Details */}
        {subscription && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={20} className="text-blue-600" />
                <span className="font-medium text-gray-700">Período Actual</span>
              </div>
              <div className="text-sm text-gray-600">
                {subscription.currentPeriodStart && new Date(subscription.currentPeriodStart).toLocaleDateString('es-PY')}
                {' - '}
                {subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd).toLocaleDateString('es-PY')}
              </div>
            </div>

            {subscription.trialEnd && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={20} className="text-blue-600" />
                  <span className="font-medium text-gray-700">Fin de Prueba</span>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(subscription.trialEnd).toLocaleDateString('es-PY')}
                </div>
              </div>
            )}

            {subscription.cancelAtPeriodEnd && (
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={20} className="text-red-600" />
                  <span className="font-medium text-gray-700">Cancelación</span>
                </div>
                <div className="text-sm text-gray-600">
                  Se cancelará el {subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd).toLocaleDateString('es-PY')}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {subscription?.cancelAtPeriodEnd ? (
            <button
              onClick={handleReactivate}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Reactivar Suscripción
            </button>
          ) : (
            <>
              <button
                onClick={handleUpgrade}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Cambiar Plan
              </button>
              {subscription?.status === 'active' && (
                <button
                  onClick={handleCancel}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Cancelar Suscripción
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Usuarios</p>
              <p className="text-2xl font-bold text-gray-800">
                {usage.usage?.users || 0} / {usage.limits?.users === -1 ? '∞' : (usage.limits?.users || 0)}
              </p>
            </div>
            <Users size={24} className="text-blue-600" />
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${usage.percentages?.users || 0}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Clientes</p>
              <p className="text-2xl font-bold text-gray-800">
                {usage.usage?.clients || 0} / {usage.limits?.clients === -1 ? '∞' : (usage.limits?.clients || 0)}
              </p>
            </div>
            <Users size={24} className="text-green-600" />
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${usage.percentages?.clients || 0}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Mascotas</p>
              <p className="text-2xl font-bold text-gray-800">
                {usage.usage?.pets || 0} / {usage.limits?.pets === -1 ? '∞' : (usage.limits?.pets || 0)}
              </p>
            </div>
            <Database size={24} className="text-purple-600" />
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${usage.percentages?.pets || 0}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Facturas</p>
              <p className="text-2xl font-bold text-gray-800">
                {usage.usage?.invoices || 0} / {usage.limits?.invoices === -1 ? '∞' : (usage.limits?.invoices || 0)}
              </p>
            </div>
            <CreditCard size={24} className="text-orange-600" />
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${usage.percentages?.invoices || 0}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Planes Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{plan.name}</h3>
                <div className="text-2xl font-bold text-gray-800 mt-2">
                  {formatCurrency(plan.price)}
                  <span className="text-sm font-normal text-gray-500">/mes</span>
                </div>
              </div>

              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>Usuarios: {plan.limits?.users === -1 ? 'Ilimitados' : plan.limits?.users || 0}</li>
                <li>Clientes: {plan.limits?.clients === -1 ? 'Ilimitados' : plan.limits?.clients || 0}</li>
                <li>Mascotas: {plan.limits?.pets === -1 ? 'Ilimitadas' : plan.limits?.pets || 0}</li>
                <li>Facturas: {plan.limits?.invoices === -1 ? 'Ilimitadas' : plan.limits?.invoices || 0}</li>
              </ul>

              {subscription?.plan?.id === plan.id ? (
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed"
                >
                  Plan Actual
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {plan.price === 0 ? 'Seleccionar' : 'Actualizar'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscription;
