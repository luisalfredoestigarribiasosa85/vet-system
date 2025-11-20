import api from './axios';

// Obtener vacunas de una mascota
export const getVaccinationsByPet = async (petId) => {
    const response = await api.get(`/vaccinations/pet/${petId}`);
    return response.data;
};

// Crear nueva vacuna
export const createVaccination = async (vaccinationData) => {
    const response = await api.post('/vaccinations', vaccinationData);
    return response.data;
};

// Actualizar vacuna
export const updateVaccination = async (id, vaccinationData) => {
    const response = await api.put(`/vaccinations/${id}`, vaccinationData);
    return response.data;
};

// Eliminar vacuna
export const deleteVaccination = async (id) => {
    const response = await api.delete(`/vaccinations/${id}`);
    return response.data;
};

// Obtener vacunas próximas a vencer (30 días)
export const getUpcomingVaccinations = async () => {
    const response = await api.get('/vaccinations/upcoming');
    return response.data;
};

// Obtener vacunas vencidas
export const getOverdueVaccinations = async () => {
    const response = await api.get('/vaccinations/overdue');
    return response.data;
};

// Descargar carnet de vacunación en PDF
export const downloadVaccinationCard = async (petId) => {
    const response = await api.get(`/vaccinations/pet/${petId}/pdf`, {
        responseType: 'blob', // Importante para archivos binarios
    });

    // Crear URL del blob y descargar
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `carnet-vacunacion-${petId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

export default {
    getVaccinationsByPet,
    createVaccination,
    updateVaccination,
    deleteVaccination,
    getUpcomingVaccinations,
    getOverdueVaccinations,
    downloadVaccinationCard,
};
