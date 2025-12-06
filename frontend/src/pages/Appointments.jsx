import { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';

// Hook para detectar tamaño de pantalla
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

const DEFAULT_FORM = {
  petId: '',
  vetId: '',
  date: '',
  time: '',
  durationMinutes: 30,
  reason: '',
  type: '',
  notes: '',
};

const DURATION_OPTIONS = [15, 30, 45, 60];

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pets, setPets] = useState([]);
  const [veterinarians, setVeterinarians] = useState([]);

  const [isModalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [availability, setAvailability] = useState([]);
  const [availabilityMeta, setAvailabilityMeta] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Detectar si es pantalla grande (md breakpoint de Tailwind = 768px)
  const isDesktop = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    loadInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    if (form.date && form.vetId) {
      fetchAvailability();
    } else {
      setAvailability([]);
      setAvailabilityMeta(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.date, form.vetId, form.durationMinutes, isModalOpen]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadAppointments(), loadPets(), loadVeterinarians()]);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data || []);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al cargar citas';
      toast.error(msg);
    }
  };

  const loadPets = async () => {
    try {
      const res = await api.get('/pets');
      setPets(res.data || []);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al cargar mascotas';
      toast.error(msg);
    }
  };

  const loadVeterinarians = async () => {
    try {
      const res = await api.get('/appointments/veterinarians');
      setVeterinarians(res.data || []);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al cargar veterinarios';
      toast.error(msg);
    }
  };

  const openCreateModal = () => {
    setEditing(null);
    setForm(DEFAULT_FORM);
    setAvailability([]);
    setAvailabilityMeta(null);
    setModalOpen(true);
  };

  const openEditModal = (appointment) => {
    setEditing(appointment);
    setForm({
      petId: String(appointment.petId),
      vetId: String(appointment.vetId),
      date: appointment.date,
      time: appointment.time?.slice(0, 5) || '',
      durationMinutes: appointment.durationMinutes || 30,
      reason: appointment.reason || '',
      type: appointment.type || '',
      notes: appointment.notes || '',
    });
    setAvailability([]);
    setAvailabilityMeta(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
    setEditing(null);
    setForm(DEFAULT_FORM);
    setAvailability([]);
    setAvailabilityMeta(null);
  };

  const handleFormChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: field === 'durationMinutes' ? Number(value) : value,
      ...(field === 'vetId' || field === 'date' ? { time: '' } : {}),
    }));
  };

  const fetchAvailability = async () => {
    if (!form.date || !form.vetId) {
      return;
    }

    setAvailabilityLoading(true);
    try {
      const res = await api.get('/appointments/availability', {
        params: {
          vetId: form.vetId,
          date: form.date,
          durationMinutes: form.durationMinutes,
        },
      });

      let slots = res.data?.slots ? [...res.data.slots] : [];

      if (editing && editing.vetId === Number(form.vetId) && editing.date === form.date) {
        const currentStart = editing.time?.slice(0, 5);
        const currentEnd = editing.endTime?.slice(0, 5);
        if (currentStart && currentEnd) {
          const idx = slots.findIndex((slot) => slot.start === currentStart && slot.end === currentEnd);
          if (idx >= 0) {
            slots[idx] = { ...slots[idx], available: true };
          } else {
            slots.unshift({ start: currentStart, end: currentEnd, available: true });
          }
        }
      }

      setAvailability(slots);
      setAvailabilityMeta(res.data || null);

      if (!editing && slots.length) {
        const defaultSlot = slots.find((slot) => slot.available);
        setForm((prev) => ({
          ...prev,
          time: defaultSlot ? defaultSlot.start : prev.time,
        }));
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al consultar disponibilidad';
      toast.error(msg);
      setAvailability([]);
      setAvailabilityMeta(null);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleSlotSelect = (slot) => {
    if (!slot.available) return;
    setForm((prev) => ({ ...prev, time: slot.start }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.petId || !form.vetId || !form.date || !form.time || !form.reason) {
      toast.error('Completa los campos obligatorios');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        petId: Number(form.petId),
        vetId: Number(form.vetId),
        date: form.date,
        time: form.time,
        durationMinutes: Number(form.durationMinutes) || 30,
        reason: form.reason,
        type: form.type || null,
        notes: form.notes || null,
      };

      if (editing) {
        await api.put(`/appointments/${editing.id}`, payload);
        toast.success('Cita actualizada');
      } else {
        await api.post('/appointments', payload);
        toast.success('Cita creada');
      }

      closeModal();
      await loadAppointments();
    } catch (error) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.message || 'No se pudo guardar la cita';
      if (status === 409) {
        toast.error(msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAppointment = async (appointment) => {
    const confirmed = window.confirm('Seguro que deseas cancelar esta cita?');
    if (!confirmed) return;

    try {
      await api.delete(`/appointments/${appointment.id}`);
      toast.success('Cita cancelada');
      await loadAppointments();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'No se pudo cancelar la cita');
    }
  };

  const availabilitySlots = useMemo(() => availability || [], [availability]);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Citas</h1>
          <p className="text-xs sm:text-sm text-gray-500">Gestiona la agenda diaria, verifica disponibilidad y crea nuevas citas.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={async () => {
              setRefreshing(true);
              await loadAppointments();
              setRefreshing(false);
            }}
            disabled={refreshing}
            className="w-full sm:w-auto"
          >
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
          <Button icon={CalendarPlus} onClick={openCreateModal} className="w-full sm:w-auto">
            Nueva cita
          </Button>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 text-gray-600 text-center">
          No hay citas para mostrar aun.
        </div>
      ) : isDesktop ? (
        /* Vista de tabla para desktop */
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Fecha</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Inicio</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Fin</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Duracion</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Mascota</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Dueno</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Veterinario</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Estado</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.map((appointment) => {
                  const canModify = appointment.status === 'programada';
                  return (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-700">{appointment.date}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{appointment.time?.slice(0, 5)}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{appointment.endTime?.slice(0, 5) || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{appointment.durationMinutes || 30} min</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{appointment.pet?.name || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{appointment.pet?.owner?.name || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{appointment.veterinarian?.name || '-'}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 capitalize">{appointment.status || 'programada'}</span>
                      </td>
                      <td className="px-4 py-2 text-sm text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Pencil}
                            onClick={() => openEditModal(appointment)}
                            disabled={!canModify}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            icon={Trash2}
                            onClick={() => handleCancelAppointment(appointment)}
                            disabled={!canModify}
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
        </div>
      ) : (
        /* Vista de tarjetas para móvil */
        <div className="space-y-4">
          {appointments.map((appointment) => {
            const canModify = appointment.status === 'programada';
            return (
              <div key={appointment.id} className="bg-white rounded-xl shadow p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 capitalize font-medium">
                        {appointment.status || 'programada'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 w-24 flex-shrink-0">Fecha:</span>
                        <span className="text-sm text-gray-700 font-medium">{appointment.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 w-24 flex-shrink-0">Horario:</span>
                        <span className="text-sm text-gray-700 font-medium">
                          {appointment.time?.slice(0, 5)} - {appointment.endTime?.slice(0, 5) || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 w-24 flex-shrink-0">Duración:</span>
                        <span className="text-sm text-gray-700">{appointment.durationMinutes || 30} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 w-24 flex-shrink-0">Mascota:</span>
                        <span className="text-sm text-gray-700">{appointment.pet?.name || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 w-24 flex-shrink-0">Dueño:</span>
                        <span className="text-sm text-gray-700">{appointment.pet?.owner?.name || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 w-24 flex-shrink-0">Veterinario:</span>
                        <span className="text-sm text-gray-700">{appointment.veterinarian?.name || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Pencil}
                    onClick={() => openEditModal(appointment)}
                    disabled={!canModify}
                    className="flex-1"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleCancelAppointment(appointment)}
                    disabled={!canModify}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editing ? 'Editar cita' : 'Programar nueva cita'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mascota *</label>
              <select
                value={form.petId}
                onChange={handleFormChange('petId')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecciona una mascota</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} ({pet.species})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Veterinario *</label>
              <select
                value={form.vetId}
                onChange={handleFormChange('vetId')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecciona un profesional</option>
                {veterinarians.map((vet) => (
                  <option key={vet.id} value={vet.id}>
                    {vet.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Fecha *"
              type="date"
              value={form.date}
              onChange={handleFormChange('date')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duracion</label>
              <select
                value={form.durationMinutes}
                onChange={handleFormChange('durationMinutes')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {DURATION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option} minutos
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Motivo *"
              placeholder="Motivo de la consulta"
              value={form.reason}
              onChange={handleFormChange('reason')}
            />

            <Input
              label="Tipo"
              placeholder="Consulta, vacunacion, control, etc"
              value={form.type}
              onChange={handleFormChange('type')}
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Disponibilidad *</label>
            <div className="border border-gray-200 rounded-lg p-3 min-h-[96px]">
              {availabilityLoading ? (
                <div className="flex items-center justify-center py-6 text-sm text-gray-500">
                  Cargando disponibilidad...
                </div>
              ) : availabilitySlots.length === 0 ? (
                <div className="py-6 text-sm text-gray-500">
                  Selecciona veterinario, fecha y duracion para ver horarios disponibles.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {availabilitySlots.map((slot) => {
                    const isSelected = form.time === slot.start;
                    return (
                      <button
                        key={`${slot.start}-${slot.end}`}
                        type="button"
                        onClick={() => handleSlotSelect(slot)}
                        disabled={!slot.available}
                        className={`px-3 py-2 text-sm rounded-lg border transition ${
                          slot.available
                            ? isSelected
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-gray-300 text-gray-700 hover:border-blue-500'
                            : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                        }`}
                      >
                        {slot.start} - {slot.end}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {availabilityMeta?.appointments?.length ? (
              <div className="mt-3 text-xs text-gray-500">
                {availabilityMeta.appointments.length} citas ya programadas en la fecha seleccionada.
              </div>
            ) : null}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              value={form.notes}
              onChange={handleFormChange('notes')}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Indicaciones adicionales, sintomas reportados, etc"
            />
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={submitting} className="w-full sm:w-auto">
              Cerrar
            </Button>
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              {submitting ? 'Guardando...' : editing ? 'Actualizar cita' : 'Guardar cita'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Appointments;
