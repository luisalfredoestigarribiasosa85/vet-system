import { useState } from 'react';
import PropTypes from 'prop-types';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './VaccinationCalendar.css';

// Localizador de fechas con date-fns (locale español)
const locales = { es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const VaccinationCalendar = ({ vaccinations, onSelectEvent }) => {
    const [view, setView] = useState('month');
    const [date, setDate] = useState(new Date());

    // Convertir vacunas a eventos del calendario
    const events = vaccinations.flatMap(vaccination => {
        const events = [];

        // Evento para fecha de aplicación
        if (vaccination.applicationDate) {
            events.push({
                id: `${vaccination.id}-applied`,
                title: `✓ ${vaccination.vaccineName}`,
                start: new Date(vaccination.applicationDate),
                end: new Date(vaccination.applicationDate),
                resource: {
                    ...vaccination,
                    eventType: 'applied',
                },
            });
        }

        // Evento para próxima dosis
        if (vaccination.nextDoseDate) {
            const status = vaccination.status === 'vencida' ? 'overdue' : 'upcoming';
            const icon = vaccination.status === 'vencida' ? '⚠️' : '📅';

            events.push({
                id: `${vaccination.id}-next`,
                title: `${icon} ${vaccination.vaccineName}`,
                start: new Date(vaccination.nextDoseDate),
                end: new Date(vaccination.nextDoseDate),
                resource: {
                    ...vaccination,
                    eventType: status,
                },
            });
        }

        return events;
    });

    // Función para dar estilo a los eventos según su tipo
    const eventStyleGetter = (event) => {
        const { eventType } = event.resource;

        let backgroundColor = '#3498db';
        let borderColor = '#2980b9';

        switch (eventType) {
            case 'applied':
                backgroundColor = '#27ae60';
                borderColor = '#229954';
                break;
            case 'upcoming':
                backgroundColor = '#f39c12';
                borderColor = '#d68910';
                break;
            case 'overdue':
                backgroundColor = '#e74c3c';
                borderColor = '#c0392b';
                break;
            default:
                break;
        }

        return {
            style: {
                backgroundColor,
                borderColor,
                borderWidth: '2px',
                borderStyle: 'solid',
                color: 'white',
                borderRadius: '4px',
                padding: '2px 5px',
                fontSize: '0.85rem',
                fontWeight: '500',
            },
        };
    };

    const handleSelectEvent = (event) => {
        if (onSelectEvent) {
            onSelectEvent(event.resource);
        }
    };

    const messages = {
        allDay: 'Todo el día',
        previous: '◀',
        next: '▶',
        today: 'Hoy',
        month: 'Mes',
        week: 'Semana',
        day: 'Día',
        agenda: 'Agenda',
        date: 'Fecha',
        time: 'Hora',
        event: 'Evento',
        noEventsInRange: 'No hay vacunas en este rango de fechas',
        showMore: (total) => `+ Ver más (${total})`,
    };

    return (
        <div className="vaccination-calendar-container">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={handleSelectEvent}
                messages={messages}
                popup
                views={['month', 'week', 'agenda']}
                defaultView="month"
            />

            <div className="calendar-legend">
                <h4>Leyenda:</h4>
                <div className="legend-items">
                    <div className="legend-item">
                        <span className="legend-color applied"></span>
                        <span>Aplicada</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color upcoming"></span>
                        <span>Próxima</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color overdue"></span>
                        <span>Vencida</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

VaccinationCalendar.propTypes = {
    vaccinations: PropTypes.array.isRequired,
    onSelectEvent: PropTypes.func,
};

export default VaccinationCalendar;
