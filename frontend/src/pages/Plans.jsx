import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const currencyFormatter = new Intl.NumberFormat('es-PY', {
  style: 'currency',
  currency: 'PYG',
  minimumFractionDigits: 0,
});

const defaultForm = {
  name: '',
  description: '',
  price: '',
};

const Plans = () => {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/plans');
      setPlans(res.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error al cargar planes');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.price) {
      toast.error('Completa nombre y precio del plan');
      return;
    }

    setSaving(true);
    try {
      await api.post('/plans', {
        name: form.name,
        description: form.description || null,
        price: Number(form.price),
      });
      toast.success('Plan creado');
      setForm(defaultForm);
      await loadPlans();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'No se pudo crear el plan');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (plan) => {
    setUpdating((prev) => ({ ...prev, [plan.id]: true }));
    try {
      await api.put(`/plans/${plan.id}`, { isActive: !plan.isActive });
      await loadPlans();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'No se pudo actualizar el plan');
    } finally {
      setUpdating((prev) => ({ ...prev, [plan.id]: false }));
    }
  };

  const handleDelete = async (plan) => {
    const confirmed = window.confirm('Seguro que deseas eliminar este plan?');
    if (!confirmed) return;

    setUpdating((prev) => ({ ...prev, [plan.id]: true }));
    try {
      await api.delete(`/plans/${plan.id}`);
      toast.success('Plan eliminado');
      await loadPlans();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'No se pudo eliminar el plan');
    } finally {
      setUpdating((prev) => ({ ...prev, [plan.id]: false }));
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold text-gray-800">Planes preventivos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Registra y administra los planes preventivos disponibles para los clientes.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Nombre del plan"
            value={form.name}
            onChange={handleChange('name')}
            required
          />
          <Input
            label="Precio (Guaranies)"
            type="number"
            min="0"
            value={form.price}
            onChange={handleChange('price')}
            required
          />
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
            <textarea
              value={form.description}
              onChange={handleChange('description')}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Detalle de lo que incluye el plan"
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Crear plan'}
            </Button>
          </div>
        </form>
      </section>

      <section className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Precio</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {plans.map((plan) => (
              <tr key={plan.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700">
                  <p className="font-semibold">{plan.name}</p>
                  {plan.description ? (
                    <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {currencyFormatter.format(plan.price)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {plan.isActive ? 'Activo' : 'Inactivo'}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleToggleActive(plan)}
                      disabled={updating[plan.id]}
                    >
                      {plan.isActive ? 'Desactivar' : 'Activar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(plan)}
                      disabled={updating[plan.id]}
                    >
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {plans.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">Aun no has registrado planes.</p>
        ) : null}
      </section>
    </div>
  );
};

export default Plans;

