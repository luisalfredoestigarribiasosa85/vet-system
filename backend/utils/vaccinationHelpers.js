/**
 * Helpers para gestión de vacunas
 */

// Calendario de vacunación recomendado por tipo de vacuna (en días)
const VACCINATION_SCHEDULE = {
    'Antirrábica': {
        firstDose: 90, // 3 meses
        secondDose: 365, // 1 año después
        booster: 365, // Anual
    },
    'Parvovirus': {
        firstDose: 45, // 6-8 semanas
        secondDose: 21, // 3 semanas después
        thirdDose: 21, // 3 semanas después
        booster: 365, // Anual
    },
    'Moquillo': {
        firstDose: 45,
        secondDose: 21,
        thirdDose: 21,
        booster: 365,
    },
    'Hepatitis': {
        firstDose: 45,
        secondDose: 21,
        booster: 365,
    },
    'Leptospirosis': {
        firstDose: 60,
        secondDose: 21,
        booster: 365,
    },
    'Tos de las Perreras': {
        firstDose: 60,
        booster: 365,
    },
    'Triple Felina': {
        firstDose: 60,
        secondDose: 21,
        booster: 365,
    },
    'Leucemia Felina': {
        firstDose: 60,
        secondDose: 21,
        booster: 365,
    },
};

/**
 * Calcular próxima dosis basado en el tipo de vacuna y número de dosis
 * @param {string} vaccineName - Nombre de la vacuna
 * @param {number} doseNumber - Número de dosis actual
 * @param {Date} applicationDate - Fecha de aplicación
 * @returns {Date|null} - Fecha de próxima dosis o null si no hay más dosis
 */
function calculateNextDoseDate(vaccineName, doseNumber, applicationDate) {
    const schedule = VACCINATION_SCHEDULE[vaccineName];

    if (!schedule) {
        // Si no está en el calendario, asumir refuerzo anual
        const nextDate = new Date(applicationDate);
        nextDate.setDate(nextDate.getDate() + 365);
        return nextDate;
    }

    const date = new Date(applicationDate);

    switch (doseNumber) {
        case 1:
            if (schedule.secondDose) {
                date.setDate(date.getDate() + schedule.secondDose);
                return date;
            } else if (schedule.booster) {
                date.setDate(date.getDate() + schedule.booster);
                return date;
            }
            return null;

        case 2:
            if (schedule.thirdDose) {
                date.setDate(date.getDate() + schedule.thirdDose);
                return date;
            } else if (schedule.booster) {
                date.setDate(date.getDate() + schedule.booster);
                return date;
            }
            return null;

        case 3:
            if (schedule.booster) {
                date.setDate(date.getDate() + schedule.booster);
                return date;
            }
            return null;

        default:
            // Para refuerzos (dosis 4+), siempre anual
            if (schedule.booster) {
                date.setDate(date.getDate() + schedule.booster);
                return date;
            }
            return null;
    }
}

/**
 * Determinar el estado de una vacuna basado en la fecha de próxima dosis
 * @param {Date|null} nextDoseDate - Fecha de próxima dosis
 * @returns {string} - Estado: 'aplicada', 'próxima', 'vencida'
 */
function determineVaccinationStatus(nextDoseDate) {
    if (!nextDoseDate) {
        return 'aplicada';
    }

    const today = new Date();
    const next = new Date(nextDoseDate);
    const diffDays = Math.ceil((next - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return 'vencida';
    } else if (diffDays <= 30) {
        return 'próxima';
    } else {
        return 'aplicada';
    }
}

/**
 * Obtener calendario de vacunación recomendado para una mascota
 * @param {string} species - Especie (Perro, Gato)
 * @param {number} ageInDays - Edad en días
 * @returns {Array} - Lista de vacunas recomendadas
 */
function getRecommendedVaccinations(species, ageInDays) {
    const recommendations = [];

    if (species === 'Perro') {
        if (ageInDays >= 45) {
            recommendations.push({ name: 'Parvovirus', priority: 'alta', age: '6-8 semanas' });
            recommendations.push({ name: 'Moquillo', priority: 'alta', age: '6-8 semanas' });
            recommendations.push({ name: 'Hepatitis', priority: 'alta', age: '6-8 semanas' });
        }
        if (ageInDays >= 60) {
            recommendations.push({ name: 'Leptospirosis', priority: 'media', age: '8-10 semanas' });
            recommendations.push({ name: 'Tos de las Perreras', priority: 'media', age: '8-10 semanas' });
        }
        if (ageInDays >= 90) {
            recommendations.push({ name: 'Antirrábica', priority: 'alta', age: '3 meses' });
        }
    } else if (species === 'Gato') {
        if (ageInDays >= 60) {
            recommendations.push({ name: 'Triple Felina', priority: 'alta', age: '8-10 semanas' });
            recommendations.push({ name: 'Leucemia Felina', priority: 'media', age: '8-10 semanas' });
        }
        if (ageInDays >= 90) {
            recommendations.push({ name: 'Antirrábica', priority: 'alta', age: '3 meses' });
        }
    }

    return recommendations;
}

/**
 * Validar que la fecha de aplicación no sea futura
 * @param {Date} applicationDate - Fecha de aplicación
 * @returns {boolean} - true si es válida
 */
function validateApplicationDate(applicationDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appDate = new Date(applicationDate);
    appDate.setHours(0, 0, 0, 0);

    return appDate <= today;
}

/**
 * Obtener días hasta la próxima dosis
 * @param {Date} nextDoseDate - Fecha de próxima dosis
 * @returns {number} - Días hasta la próxima dosis (negativo si vencida)
 */
function getDaysUntilNextDose(nextDoseDate) {
    if (!nextDoseDate) return null;

    const today = new Date();
    const next = new Date(nextDoseDate);
    return Math.ceil((next - today) / (1000 * 60 * 60 * 24));
}

module.exports = {
    VACCINATION_SCHEDULE,
    calculateNextDoseDate,
    determineVaccinationStatus,
    getRecommendedVaccinations,
    validateApplicationDate,
    getDaysUntilNextDose,
};
