import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getVaccinationsByPet,
    createVaccination,
    updateVaccination,
    deleteVaccination,
    downloadVaccinationCard,
} from '../api/vaccinationApi';
import VaccinationCard from '../components/vaccinations/VaccinationCard';
import VaccinationForm from '../components/vaccinations/VaccinationForm';
import VaccinationCalendar from '../components/vaccinations/VaccinationCalendar';
import './Vaccinations.css';

const Vaccinations = () => {
    const { petId } = useParams();
    const navigate = useNavigate();

    const [vaccinations, setVaccinations] = useState([]);
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingVaccination, setEditingVaccination] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' o 'calendar'
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        if (petId) {
            loadVaccinations();
        }
    }, [petId]);

    const loadVaccinations = async () => {
        try {
            setLoading(true);
            const data = await getVaccinationsByPet(petId);
            setVaccinations(data);

            // Obtener info de la mascota del primer registro
            if (data.length > 0 && data[0].pet) {
                setPet(data[0].pet);
            }
        } catch (error) {
            console.error('Error al cargar vacunas:', error);
            alert('Error al cargar las vacunas');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (vaccinationData) => {
        try {
            await createVaccination(vaccinationData);
            setShowForm(false);
            loadVaccinations();
        } catch (error) {
            console.error('Error al crear vacuna:', error);
            throw error;
        }
    };

    const handleUpdate = async (vaccinationData) => {
        try {
            await updateVaccination(editingVaccination.id, vaccinationData);
            setShowForm(false);
            setEditingVaccination(null);
            loadVaccinations();
        } catch (error) {
            console.error('Error al actualizar vacuna:', error);
            throw error;
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta vacuna?')) {
            return;
        }

        try {
            await deleteVaccination(id);
            loadVaccinations();
        } catch (error) {
            console.error('Error al eliminar vacuna:', error);
            alert('Error al eliminar la vacuna');
        }
    };

    const handleEdit = (vaccination) => {
        setEditingVaccination(vaccination);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingVaccination(null);
    };

    const handleDownloadPDF = async () => {
        try {
            await downloadVaccinationCard(petId);
        } catch (error) {
            console.error('Error al descargar PDF:', error);
            alert('Error al generar el carnet PDF');
        }
    };

    const handleSelectEvent = (vaccination) => {
        setSelectedEvent(vaccination);
        setEditingVaccination(vaccination);
        setShowForm(true);
    };

    const getVaccinationStats = () => {
        const total = vaccinations.length;
        const applied = vaccinations.filter(v => v.status === 'aplicada').length;
        const upcoming = vaccinations.filter(v => v.status === 'próxima').length;
        const overdue = vaccinations.filter(v => v.status === 'vencida').length;

        return { total, applied, upcoming, overdue };
    };

    const stats = getVaccinationStats();

    if (loading) {
        return (
            <div className="vaccinations-page">
                <div className="loading">Cargando vacunas...</div>
            </div>
        );
    }

    return (
        <div className="vaccinations-page">
            <div className="page-header">
                <button onClick={() => navigate('/pets')} className="btn-back">
                    ← Volver a Mascotas
                </button>
                <div className="header-content">
                    <h1>💉 Vacunas de {pet?.name || 'Mascota'}</h1>
                    {pet && (
                        <p className="pet-info">
                            {pet.species} • {pet.breed} • {pet.age} {pet.age === 1 ? 'año' : 'años'}
                        </p>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={handleDownloadPDF}
                        className="btn-secondary"
                        title="Descargar carnet de vacunación en PDF"
                    >
                        📄 Descargar PDF
                    </button>
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn-primary"
                    >
                        + Nueva Vacuna
                    </button>
                </div>
            </div>

            <div className="vaccination-stats">
                <div className="stat-card">
                    <span className="stat-number">{stats.total}</span>
                    <span className="stat-label">Total</span>
                </div>
                <div className="stat-card stat-applied">
                    <span className="stat-number">{stats.applied}</span>
                    <span className="stat-label">Aplicadas</span>
                </div>
                <div className="stat-card stat-upcoming">
                    <span className="stat-number">{stats.upcoming}</span>
                    <span className="stat-label">Próximas</span>
                </div>
                {stats.overdue > 0 && (
                    <div className="stat-card stat-overdue">
                        <span className="stat-number">{stats.overdue}</span>
                        <span className="stat-label">Vencidas</span>
                    </div>
                )}
            </div>

            {/* Toggle entre vista de lista y calendario */}
            <div className="view-toggle">
                <button
                    onClick={() => setViewMode('list')}
                    className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                >
                    📋 Lista
                </button>
                <button
                    onClick={() => setViewMode('calendar')}
                    className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                >
                    📅 Calendario
                </button>
            </div>

            {vaccinations.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">💉</div>
                    <h3>No hay vacunas registradas</h3>
                    <p>Comienza registrando la primera vacuna de {pet?.name}</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn-primary"
                    >
                        Registrar Primera Vacuna
                    </button>
                </div>
            ) : (
                <>
                    {viewMode === 'list' ? (
                        <div className="vaccinations-grid">
                            {vaccinations.map(vaccination => (
                                <VaccinationCard
                                    key={vaccination.id}
                                    vaccination={vaccination}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    ) : (
                        <VaccinationCalendar
                            vaccinations={vaccinations}
                            onSelectEvent={handleSelectEvent}
                        />
                    )}
                </>
            )}

            {showForm && (
                <VaccinationForm
                    petId={parseInt(petId)}
                    onSubmit={editingVaccination ? handleUpdate : handleCreate}
                    onCancel={handleCancelForm}
                    initialData={editingVaccination}
                />
            )}
        </div>
    );
};

export default Vaccinations;
