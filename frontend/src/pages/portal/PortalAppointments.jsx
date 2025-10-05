import { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import portalApi from '../../api/portalApi';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import usePortalAuth from '../../hooks/usePortalAuth';

const DEFAULT_FORM = {
  petId: '',
  vetId: '',
  date: '',
  time: '',
  durationMinutes: 30,
  reason: '',
  notes: '',
  type: '',
};

const DURATION_OPTIONS = [15, 30, 45, 60];

const PortalAppointments = () => {
  const { profile, refreshProfile } = usePortalAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState([]);
  const [veterinarians, setVeterinarians] = useState([]);

  const [isModalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [availability, setAvailability] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (profile?.pets) {
      setPets(profile.pets);
    }
  }, [profile]);

  useEffect(() => {
    if (!isModalOpen) return;
    if (form.date && form.vetId) {
      fetchAvailability();
    } else {
      setAvailability([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.date, form.vetId, form.durationMinutes, isModalOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadAppointments(), loadPets(), loadVeterinarians()]);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const res = await portalApi.get('/portal/appointments');
      setAppointments(res.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error al cargar citas');
    }
  };

  const loadPets = async () => {
    try {
      const res = await portalApi.get('/portal/pets');
      setPets(res.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error al cargar mascotas');
    }
  };

  const loadVeterinarians = async () => {
    try {
      const res = await portalApi.get('/appointments/veterinarians');
      setVeterinarians(res.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error al cargar veterinarios');
    }
  };

  const openCreateModal = () => {
    setEditing(null);
    setForm(DEFAULT_FORM);
    setAvailability([]);
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
      notes: appointment.notes || '',
      type: appointment.type || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
    setEditing(null);
    setForm(DEFAULT_FORM);
    setAvailability([]);
  };

  const handleFormChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: field === 'durationMinutes' ? Number(value) : value,
      ...(field === 'vetId' || field === 'date' ? { time: editing ? prev.time : '' } : {}),
    }));
  };

  const fetchAvailability = async () => {
    if (!form.date || !form.vetId) return;

    setAvailabilityLoading(true);
    try {
      const res = await portalApi.get('/appointments/availability', {
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

      if (!editing && slots.length) {
        const defaultSlot = slots.find((slot) => slot.available);
        setForm((prev) => ({
          ...prev,
          time: defaultSlot ? defaultSlot.start : prev.time,
        }));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'No se pudo cargar la disponibilidad');
      setAvailability([]);
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
        await portalApi.put(`/portal/appointments/${editing.id}`, payload);
        toast.success('Cita actualizada correctamente');
      } else {
        await portalApi.post('/portal/appointments', payload);
        toast.success('Cita solicitada correctamente');
      }

      closeModal();
      await Promise.all([loadAppointments(), refreshProfile()]);
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || 'No se pudo guardar la cita';
      if (status === 409) {
        toast.error(message);
      } else {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAppointment = async (appointment) => {
    const confirmed = window.confirm('Seguro que deseas cancelar esta cita?');
    if (!confirmed) return;

    try {
      await portalApi.delete(`/portal/appointments/${appointment.id}`);
      toast.success('Cita cancelada');
      await Promise.all([loadAppointments(), refreshProfile()]);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'No se pudo cancelar la cita');
    }
  };

  const availabilitySlots = useMemo(() => availability || [], [availability]);

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Mis citas</h2>
        <Button icon={CalendarPlus} onClick={openCreateModal}>
          Nueva cita
        </Button>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-6 text-slate-500">
          Aun no tienes citas programadas.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Hora</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Mascota</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Veterinario</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {appointments.map((appointment) => {
                const canModify = appointment.status === 'programada';
                return (
                  <tr key={appointment.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700">{appointment.date}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{appointment.time?.slice(0, 5)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{appointment.pet?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{appointment.veterinarian?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 capitalize">
                        {appointment.status || 'programada'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
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
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editing ? 'Editar cita' : 'Solicitar nueva cita'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Mascota *</label>
              <select
                value={form.petId}
                onChange={handleFormChange('petId')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-slate-600 mb-1">Veterinario *</label>
              <select
                value={form.vetId}
                onChange={handleFormChange('vetId')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-slate-600 mb-1">Duracion</label>
              <select
                value={form.durationMinutes}
                onChange={handleFormChange('durationMinutes')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Disponibilidad *</label>
            <div className="border border-slate-200 rounded-lg p-3 min-h-[96px]">
              {availabilityLoading ? (
                <div className="flex items-center justify-center py-6 text-sm text-slate-500">
                  Cargando disponibilidad...
                </div>
              ) : availabilitySlots.length === 0 ? (
                <div className="py-6 text-sm text-slate-500">
                  Selecciona veterinario, fecha y duracion para ver horarios.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                              : 'border-slate-300 text-slate-700 hover:border-blue-500'
                            : 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed'
                        }`}
                      >
                        {slot.start} - {slot.end}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Notas</label>
            <textarea
              value={form.notes}
              onChange={handleFormChange('notes')}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Comentarios adicionales"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={submitting}>
              Cerrar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Guardando...' : editing ? 'Actualizar cita' : 'Confirmar cita'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PortalAppointments;
