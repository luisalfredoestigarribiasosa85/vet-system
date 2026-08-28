import { useState } from 'react';
import Modal from '../common/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';

/**
 * Modal para registrar una nueva consulta (registro médico) de una mascota.
 * POST /api/medical/records — el vetId y la organización se resuelven en el backend.
 */
const NewConsultationModal = ({ isOpen, onClose, petId, petName, onSaved }) => {
  const [formData, setFormData] = useState({
    diagnosis: '',
    treatment: '',
    weight: '',
    temperature: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.diagnosis.trim()) {
      toast.error('El diagnóstico es obligatorio');
      return;
    }

    setSaving(true);
    try {
      // Solo enviar los campos opcionales si tienen valor (evita strings vacíos en columnas numéricas)
      const payload = {
        petId: Number(petId),
        diagnosis: formData.diagnosis.trim(),
        treatment: formData.treatment.trim() || undefined,
        weight: formData.weight !== '' ? Number(formData.weight) : undefined,
        temperature: formData.temperature !== '' ? Number(formData.temperature) : undefined,
        notes: formData.notes.trim() || undefined
      };

      await api.post('/medical/records', payload);
      toast.success('Consulta registrada correctamente');
      setFormData({ diagnosis: '', treatment: '', weight: '', temperature: '', notes: '' });
      onSaved?.();
      onClose?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error al registrar la consulta');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Nueva Consulta${petName ? ` — ${petName}` : ''}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Diagnóstico <span className="text-red-500">*</span>
          </label>
          <textarea
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            required
            rows={2}
            placeholder="Ej: Otitis externa leve"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tratamiento</label>
          <textarea
            name="treatment"
            value={formData.treatment}
            onChange={handleChange}
            rows={2}
            placeholder="Ej: Gotas óticas antibióticas por 7 días"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              step="0.1"
              min="0"
              placeholder="Ej: 12.5"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temperatura (°C)</label>
            <input
              type="number"
              name="temperature"
              value={formData.temperature}
              onChange={handleChange}
              step="0.1"
              min="0"
              placeholder="Ej: 38.5"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Notas adicionales de la consulta"
            className={inputClass}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition"
          >
            {saving ? 'Guardando...' : 'Registrar Consulta'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NewConsultationModal;