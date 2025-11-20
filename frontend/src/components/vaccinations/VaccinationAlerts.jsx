import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUpcomingVaccinations, getOverdueVaccinations } from '../../api/vaccinationApi';
import './VaccinationAlerts.css';

const VaccinationAlerts = () => {
    const [upcoming, setUpcoming] = useState([]);
    const [overdue, setOverdue] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAlerts();
    }, []);

    const loadAlerts = async () => {
        try {
            const [upcomingData, overdueData] = await Promise.all([
                getUpcomingVaccinations(),
                getOverdueVaccinations(),
            ]);
            setUpcoming(upcomingData);
            setOverdue(overdueData);
        } catch (error) {
            console.error('Error al cargar alertas:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="vaccination-alerts loading">Cargando alertas...</div>;
    }

    if (upcoming.length === 0 && overdue.length === 0) {
        return null;
    }

    return (
        <div className="vaccination-alerts">
            {overdue.length > 0 && (
                <div className="alert alert-danger">
                    <div className="alert-header">
                        <span className="alert-icon">⚠️</span>
                        <h4>Vacunas Vencidas ({overdue.length})</h4>
                    </div>
                    <ul className="alert-list">
                        {overdue.slice(0, 5).map(vaccination => (
                            <li key={vaccination.id}>
                                <Link to={`/vaccinations/${vaccination.pet.id}`}>
                                    <strong>{vaccination.pet.name}</strong> - {vaccination.vaccineName}
                                    <span className="alert-date">
                                        Vencida desde {new Date(vaccination.nextDoseDate).toLocaleDateString('es-PY')}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                    {overdue.length > 5 && (
                        <Link to="/vaccinations" className="alert-link">
                            Ver todas las vacunas vencidas ({overdue.length})
                        </Link>
                    )}
                </div>
            )}

            {upcoming.length > 0 && (
                <div className="alert alert-warning">
                    <div className="alert-header">
                        <span className="alert-icon">🔔</span>
                        <h4>Vacunas Próximas ({upcoming.length})</h4>
                    </div>
                    <ul className="alert-list">
                        {upcoming.slice(0, 5).map(vaccination => {
                            const daysUntil = Math.ceil(
                                (new Date(vaccination.nextDoseDate) - new Date()) / (1000 * 60 * 60 * 24)
                            );
                            return (
                                <li key={vaccination.id}>
                                    <Link to={`/vaccinations/${vaccination.pet.id}`}>
                                        <strong>{vaccination.pet.name}</strong> - {vaccination.vaccineName}
                                        <span className="alert-date">
                                            En {daysUntil} {daysUntil === 1 ? 'día' : 'días'}
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                    {upcoming.length > 5 && (
                        <Link to="/vaccinations" className="alert-link">
                            Ver todas las vacunas próximas ({upcoming.length})
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};

export default VaccinationAlerts;
