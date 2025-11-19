const { Vaccination, Pet, User, Client } = require('../models');
const {
    calculateNextDoseDate,
    determineVaccinationStatus,
    validateApplicationDate,
    getDaysUntilNextDose,
} = require('../utils/vaccinationHelpers');

/**
 * Obtener todas las vacunas de una mascota
 */
const getVaccinationsByPet = async (req, res) => {
    try {
        const { petId } = req.params;

        const vaccinations = await Vaccination.findAll({
            where: { petId },
            include: [
                {
                    model: User,
                    as: 'veterinarian',
                    attributes: ['id', 'name', 'email'],
                },
            ],
            order: [['applicationDate', 'DESC']],
        });

        res.json(vaccinations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Crear nueva vacuna
 */
const createVaccination = async (req, res) => {
    try {
        const {
            petId,
            vaccineName,
            vaccineType,
            applicationDate,
            vetId,
            batchNumber,
            manufacturer,
            notes,
            doseNumber,
            weight,
        } = req.body;

        // Validar que la mascota existe
        const pet = await Pet.findByPk(petId);
        if (!pet) {
            return res.status(404).json({ message: 'Mascota no encontrada' });
        }

        // Validar fecha de aplicación
        if (!validateApplicationDate(applicationDate)) {
            return res.status(400).json({
                message: 'La fecha de aplicación no puede ser futura'
            });
        }

        // Calcular próxima dosis
        const nextDoseDate = calculateNextDoseDate(
            vaccineName,
            doseNumber || 1,
            new Date(applicationDate)
        );

        // Determinar estado
        const status = determineVaccinationStatus(nextDoseDate);

        const vaccination = await Vaccination.create({
            petId,
            vaccineName,
            vaccineType: vaccineType || 'obligatoria',
            applicationDate,
            nextDoseDate,
            vetId: vetId || req.user.id,
            batchNumber,
            manufacturer,
            notes,
            status,
            doseNumber: doseNumber || 1,
            weight,
        });

        // Obtener vacuna con relaciones
        const result = await Vaccination.findByPk(vaccination.id, {
            include: [
                {
                    model: User,
                    as: 'veterinarian',
                    attributes: ['id', 'name', 'email'],
                },
            ],
        });

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Actualizar vacuna
 */
const updateVaccination = async (req, res) => {
    try {
        const { id } = req.params;
        const vaccination = await Vaccination.findByPk(id);

        if (!vaccination) {
            return res.status(404).json({ message: 'Vacuna no encontrada' });
        }

        const {
            vaccineName,
            vaccineType,
            applicationDate,
            vetId,
            batchNumber,
            manufacturer,
            notes,
            doseNumber,
            weight,
        } = req.body;

        // Si se actualiza la fecha o el nombre, recalcular próxima dosis
        let nextDoseDate = vaccination.nextDoseDate;
        if (vaccineName || applicationDate || doseNumber) {
            nextDoseDate = calculateNextDoseDate(
                vaccineName || vaccination.vaccineName,
                doseNumber || vaccination.doseNumber,
                new Date(applicationDate || vaccination.applicationDate)
            );
        }

        const status = determineVaccinationStatus(nextDoseDate);

        await vaccination.update({
            vaccineName: vaccineName || vaccination.vaccineName,
            vaccineType: vaccineType || vaccination.vaccineType,
            applicationDate: applicationDate || vaccination.applicationDate,
            nextDoseDate,
            vetId: vetId || vaccination.vetId,
            batchNumber: batchNumber || vaccination.batchNumber,
            manufacturer: manufacturer || vaccination.manufacturer,
            notes: notes !== undefined ? notes : vaccination.notes,
            status,
            doseNumber: doseNumber || vaccination.doseNumber,
            weight: weight || vaccination.weight,
        });

        const result = await Vaccination.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'veterinarian',
                    attributes: ['id', 'name', 'email'],
                },
            ],
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Eliminar vacuna
 */
const deleteVaccination = async (req, res) => {
    try {
        const { id } = req.params;
        const vaccination = await Vaccination.findByPk(id);

        if (!vaccination) {
            return res.status(404).json({ message: 'Vacuna no encontrada' });
        }

        await vaccination.destroy();
        res.json({ message: 'Vacuna eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtener vacunas próximas a vencer (próximos 30 días)
 */
const getUpcomingVaccinations = async (req, res) => {
    try {
        const { Op } = require('sequelize');
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        const vaccinations = await Vaccination.findAll({
            where: {
                nextDoseDate: {
                    [Op.between]: [today, thirtyDaysFromNow],
                },
                status: {
                    [Op.in]: ['próxima', 'aplicada'],
                },
            },
            include: [
                {
                    model: Pet,
                    as: 'pet',
                    include: [
                        {
                            model: Client,
                            as: 'owner',
                            attributes: ['id', 'name', 'phone', 'email'],
                        },
                    ],
                },
                {
                    model: User,
                    as: 'veterinarian',
                    attributes: ['id', 'name'],
                },
            ],
            order: [['nextDoseDate', 'ASC']],
        });

        // Agregar días hasta próxima dosis
        const result = vaccinations.map(v => ({
            ...v.toJSON(),
            daysUntilNextDose: getDaysUntilNextDose(v.nextDoseDate),
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtener vacunas vencidas
 */
const getOverdueVaccinations = async (req, res) => {
    try {
        const { Op } = require('sequelize');
        const today = new Date();

        const vaccinations = await Vaccination.findAll({
            where: {
                nextDoseDate: {
                    [Op.lt]: today,
                },
                status: 'vencida',
            },
            include: [
                {
                    model: Pet,
                    as: 'pet',
                    include: [
                        {
                            model: Client,
                            as: 'owner',
                            attributes: ['id', 'name', 'phone', 'email'],
                        },
                    ],
                },
                {
                    model: User,
                    as: 'veterinarian',
                    attributes: ['id', 'name'],
                },
            ],
            order: [['nextDoseDate', 'ASC']],
        });

        res.json(vaccinations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getVaccinationsByPet,
    createVaccination,
    updateVaccination,
    deleteVaccination,
    getUpcomingVaccinations,
    getOverdueVaccinations,
};
