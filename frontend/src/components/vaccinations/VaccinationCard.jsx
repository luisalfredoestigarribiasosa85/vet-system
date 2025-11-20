import PropTypes from 'prop-types';
import './VaccinationCard.css';

const VaccinationCard = ({ vaccination, onEdit, onDelete }) => {
    const getStatusBadge = (status) => {
        const badges = {
            aplicada: { class: 'status-applied', text: 'Aplicada' },
            próxima: { class: 'status-upcoming', text: 'Próxima' },
            vencida: { class: 'status-overdue', text: 'Vencida' },
        };
        return badges[status] || badges.aplicada;
    };

    const getTypeBadge = (type) => {
        const badges = {
            obligatoria: { class: 'type-required', text: 'Obligatoria' },
            opcional: { class: 'type-optional', text: 'Opcional' },
            refuerzo: { class: 'type-booster', text: 'Refuerzo' },
        };
        return badges[type] || badges.obligatoria;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PY', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getDaysUntilNext = () => {
        if (!vaccination.nextDoseDate) return null;
        const today = new Date();
        const nextDate = new Date(vaccination.nextDoseDate);
        const diffTime = nextDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysUntilNext = getDaysUntilNext();
    const statusBadge = getStatusBadge(vaccination.status);
    const typeBadge = getTypeBadge(vaccination.vaccineType);

    return (
        <div className={`vaccination-card ${vaccination.status === 'vencida' ? 'card-overdue' : ''}`}>
            <div className="card-header">
                <div className="vaccine-info">
                    <h3>💉 {vaccination.vaccineName}</h3>
                    <div className="badges">
                        <span className={`badge ${typeBadge.class}`}>{typeBadge.text}</span>
                        <span className={`badge ${statusBadge.class}`}>{statusBadge.text}</span>
                    </div>
                </div>
                <div className="card-actions">
                    <button
                        onClick={() => onEdit(vaccination)}
                        className="btn-icon"
                        title="Editar"
                    >
                        ✏️
                    </button>
                    <button
                        onClick={() => onDelete(vaccination.id)}
                        className="btn-icon btn-danger"
                        title="Eliminar"
                    >
                        🗑️
                    </button>
                </div>
            </div>

            <div className="card-body">
                <div className="info-row">
                    <span className="label">Fecha de Aplicación:</span>
                    <span className="value">{formatDate(vaccination.applicationDate)}</span>
                </div>

                {vaccination.nextDoseDate && (
                    <div className="info-row">
                        <span className="label">Próxima Dosis:</span>
                        <span className={`value ${vaccination.status === 'vencida' ? 'text-danger' : ''}`}>
                            {formatDate(vaccination.nextDoseDate)}
                            {daysUntilNext !== null && (
                                <span className="days-info">
                                    {daysUntilNext < 0
                                        ? ` (Vencida hace ${Math.abs(daysUntilNext)} días)`
                                        : daysUntilNext === 0
                                            ? ' (Hoy)'
                                            : ` (En ${daysUntilNext} días)`
                                    }
                                </span>
                            )}
                        </span>
                    </div>
                )}

                <div className="info-row">
                    <span className="label">Dosis N°:</span>
                    <span className="value">{vaccination.doseNumber}</span>
                </div>

                {vaccination.veterinarian && (
                    <div className="info-row">
                        <span className="label">Veterinario:</span>
                        <span className="value">{vaccination.veterinarian.name}</span>
                    </div>
                )}

                {vaccination.batchNumber && (
                    <div className="info-row">
                        <span className="label">Lote:</span>
                        <span className="value">{vaccination.batchNumber}</span>
                    </div>
                )}

                {vaccination.manufacturer && (
                    <div className="info-row">
                        <span className="label">Fabricante:</span>
                        <span className="value">{vaccination.manufacturer}</span>
                    </div>
                )}

                {vaccination.weight && (
                    <div className="info-row">
                        <span className="label">Peso:</span>
                        <span className="value">{vaccination.weight} kg</span>
                    </div>
                )}

                {vaccination.notes && (
                    <div className="info-row notes">
                        <span className="label">Notas:</span>
                        <span className="value">{vaccination.notes}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

VaccinationCard.propTypes = {
    vaccination: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default VaccinationCard;
