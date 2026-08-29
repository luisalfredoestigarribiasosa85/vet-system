import { useEffect, useMemo, useState } from 'react';
import { Tag, Pencil, Power, Plus, Search, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

const CATEGORIES = [
  { value: 'consulta', label: 'Consulta', color: 'bg-blue-100 text-blue-800' },
  { value: 'vacuna', label: 'Vacuna', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'cirugia', label: 'Cirugía', color: 'bg-purple-100 text-purple-800' },
  { value: 'laboratorio', label: 'Laboratorio', color: 'bg-amber-100 text-amber-800' },
  { value: 'medicamento', label: 'Medicamento', color: 'bg-rose-100 text-rose-800' },
  { value: 'otro', label: 'Otro', color: 'bg-gray-100 text-gray-800' },
];

const categoryMeta = (value) => CATEGORIES.find((c) => c.value === value) || CATEGORIES[CATEGORIES.length - 1];

const formatGs = (value) => `Gs. ${Number(value || 0).toLocaleString('es-PY')}`;

const DEFAULT_FORM = {
  name: '',
  description: '',
  category: 'consulta',
  price: '',
  duration: '',
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [statusFilter, setStatusFilter] = useState('todos');

  const [isModalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      // Sin ?isActive: traemos activos e inactivos para poder reactivar desde la UI
      const res = await api.get('/services');
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((service) => {
      if (categoryFilter !== 'todas' && service.category !== categoryFilter) return false;
      if (statusFilter === 'activos' && !service.isActive) return false;
      if (statusFilter === 'inactivos' && service.isActive) return false;
      if (!q) return true;
      return (
        service.name?.toLowerCase().includes(q) ||
        service.description?.toLowerCase().includes(q)
      );
    });
  }, [services, search, categoryFilter, statusFilter]);

  const openCreateModal = () => {
    setEditing(null);
    setForm(DEFAULT_FORM);
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditing(service);
    setForm({
      name: service.name || '',
      description: service.description || '',
      category: service.category || 'consulta',
      price: service.price != null ? String(service.price) : '',
      duration: service.duration != null ? String(service.duration) : '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
    setForm(DEFAULT_FORM);
  };

  const handleFormChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const price = Number(form.price);

    if (!name) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (!form.price || Number.isNaN(price) || price <= 0) {
      toast.error('Ingresa un precio válido mayor a cero');
      return;
    }

    const payload = {
      name,
      description: form.description.trim() || undefined,
      category: form.category,
      price: Math.round(price),
      duration: form.duration !== '' && Number(form.duration) > 0 ? Number(form.duration) : undefined,
    };

    setSaving(true);
    try {
      if (editing) {
        await api.put(`/services/${editing.id}`, payload);
        toast.success('Servicio actualizado');
      } else {
        await api.post('/services', payload);
        toast.success('Servicio creado');
      }
      closeModal();
      await loadServices();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'No se pudo guardar el servicio');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (service) => {
    setTogglingId(service.id);
    try {
      await api.put(`/services/${service.id}`, { isActive: !service.isActive });
      toast.success(service.isActive ? 'Servicio desactivado' : 'Servicio activado');
      await loadServices();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'No se pudo cambiar el estado');
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Servicios</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Catalogo de servicios disponible para facturacion y turnos.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-full sm:w-auto"
          >
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
          <Button icon={Plus} onClick={openCreateModal} className="w-full sm:w-auto">
            Nuevo servicio
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o descripcion..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="todas">Todas las categorias</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="todos">Activos e inactivos</option>
          <option value="activos">Solo activos</option>
          <option value="inactivos">Solo inactivos</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Servicio</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Categoria</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Precio</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Duracion</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Estado</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-sm">
                    No hay servicios que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                filtered.map((service) => {
                  const cat = categoryMeta(service.category);
                  return (
                    <tr key={service.id} className={`hover:bg-gray-50 transition ${service.isActive ? '' : 'opacity-60'}`}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{service.name}</p>
                        {service.description && (
                          <p className="text-xs text-gray-500 mt-0.5 max-w-md">{service.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cat.color}`}>
                          {cat.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">{formatGs(service.price)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {service.duration ? `${service.duration} min` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {service.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(service)}
                            title="Editar"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleToggleActive(service)}
                            disabled={togglingId === service.id}
                            title={service.isActive ? 'Desactivar' : 'Activar'}
                            className={`p-2 rounded-lg transition disabled:opacity-50 ${
                              service.isActive
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                          >
                            <Power size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal crear/editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editing ? 'Editar servicio' : 'Nuevo servicio'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={handleFormChange('name')}
              required
              maxLength={100}
              placeholder="Ej: Consulta general"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
            <textarea
              value={form.description}
              onChange={handleFormChange('description')}
              rows={2}
              placeholder="Detalle del servicio incluido"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                value={form.category}
                onChange={handleFormChange('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio (Gs.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.price}
                onChange={handleFormChange('price')}
                required
                min="1"
                step="1"
                placeholder="Ej: 80000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duracion (min)</label>
              <input
                type="number"
                value={form.duration}
                onChange={handleFormChange('duration')}
                min="5"
                step="5"
                placeholder="Ej: 30"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={saving} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              {saving ? 'Guardando...' : editing ? 'Actualizar servicio' : 'Crear servicio'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Contador pie */}
      <p className="text-xs text-gray-400 text-center">
        <Tag size={12} className="inline mr-1" />
        {filtered.length} de {services.length} servicios mostrados
      </p>
    </div>
  );
};

export default Services;

