import api from './axios';

// Obtener estadísticas de citas
export const getAppointmentStats = async () => {
    const response = await api.get('/stats/appointments');
    return response.data;
};

// Obtener estadísticas de ingresos
export const getRevenueStats = async () => {
    const response = await api.get('/stats/revenue');
    return response.data;
};

// Obtener estadísticas de vacunaciones
export const getVaccinationStats = async () => {
    const response = await api.get('/stats/vaccinations');
    return response.data;
};

// Obtener estadísticas de inventario
export const getInventoryStats = async () => {
    const response = await api.get('/stats/inventory');
    return response.data;
};

// Obtener resumen general
export const getOverviewStats = async () => {
    const response = await api.get('/stats/overview');
    return response.data;
};

export default {
    getAppointmentStats,
    getRevenueStats,
    getVaccinationStats,
    getInventoryStats,
    getOverviewStats,
};
