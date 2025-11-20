import { useState } from 'react';
import PropTypes from 'prop-types';
import './VaccinationForm.css';

const VaccinationForm = ({ petId, onSubmit, onCancel, initialData = null }) => {
    const [formData, setFormData] = useState({
        vaccineName: initialData?.vaccineName || '',
        vaccineType: initialData?.vaccineType || 'obligatoria',
        applicationDate: initialData?.applicationDate || '',
        batchNumber: initialData?.batchNumber || '',
        manufacturer: initialData?.manufacturer || '',
        notes: initialData?.notes || '',
        doseNumber: initialData?.doseNumber || 1,
        weight: initialData?.weight || '',
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await onSubmit({
                ...formData,
                petId,
                doseNumber: parseInt(formData.doseNumber),
                weight: formData.weight ? parseFloat(formData.weight) : null,
            });
        } catch (error) {
            console.error('Error al guardar vacuna:', error);
            alert('Error al guardar la vacuna');
        } finally {
            setLoading(false);
        }
    };

    const commonVaccines = [
        'Antirrábica',
        'Parvovirus',
        'Moquillo',
        'Hepatitis',
        'Leptospirosis',
        'Tos de las Perreras',
        'Triple Felina',
        'Leucemia Felina',
    ];

    return (
        <div className="vaccination-form-overlay">
            <div className="vaccination-form-container">
                <h2>{initialData ? 'Editar Vacuna' : 'Registrar Nueva Vacuna'}</h2>

                <form onSubmit={handleSubmit} className="vaccination-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="vaccineName">Nombre de la Vacuna *</label>
                            <input
                                type="text"
                                id="vaccineName"
                                name="vaccineName"
                                value={formData.vaccineName}
                                onChange={handleChange}
                                list="vaccine-suggestions"
                                required
                            />
                            <datalist id="vaccine-suggestions">
                                {commonVaccines.map(vaccine => (
                                    <option key={vaccine} value={vaccine} />
                                ))}
                            </datalist>
                        </div>

                        <div className="form-group">
                            <label htmlFor="vaccineType">Tipo *</label>
                            <select
                                id="vaccineType"
                                name="vaccineType"
                                value={formData.vaccineType}
                                onChange={handleChange}
                                required
                            >
                                <option value="obligatoria">Obligatoria</option>
                                <option value="opcional">Opcional</option>
                                <option value="refuerzo">Refuerzo</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="applicationDate">Fecha de Aplicación *</label>
                            <input
                                type="date"
                                id="applicationDate"
                                name="applicationDate"
                                value={formData.applicationDate}
                                onChange={handleChange}
                                max={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="doseNumber">Número de Dosis *</label>
                            <input
                                type="number"
                                id="doseNumber"
                                name="doseNumber"
                                value={formData.doseNumber}
                                onChange={handleChange}
                                min="1"
                                max="10"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="batchNumber">Número de Lote</label>
                            <input
                                type="text"
                                id="batchNumber"
                                name="batchNumber"
                                value={formData.batchNumber}
                                onChange={handleChange}
                                placeholder="Ej: LOT-2025-001"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="manufacturer">Fabricante</label>
                            <input
                                type="text"
                                id="manufacturer"
                                name="manufacturer"
                                value={formData.manufacturer}
                                onChange={handleChange}
                                placeholder="Ej: Laboratorio VetPharma"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="weight">Peso de la Mascota (kg)</label>
                        <input
                            type="number"
                            id="weight"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            step="0.1"
                            min="0"
                            placeholder="Ej: 25.5"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="notes">Notas</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Observaciones, reacciones adversas, etc."
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn-secondary"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Registrar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

VaccinationForm.propTypes = {
    petId: PropTypes.number.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    initialData: PropTypes.object,
};

export default VaccinationForm;
