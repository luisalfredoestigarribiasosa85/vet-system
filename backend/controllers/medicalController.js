const Medical = require('../models/Medical');

// @desc    Obtener todo el historial medico
// @route   GET /api/medical
// @access  Private
exports.getMedical = async (req, res) => {
  try {
    const medicamentos = await Medical.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });
    res.json(medicamentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los medicamentos' });
  }
};

// @desc    Obtener un historial medico por ID
// @route   GET /api/medical/:id
// @access  Private
exports.getMedicalById = async (req, res) => {
  try {
    const medical = await Medical.findByPk(req.params.id);
    if (!medical) {
      return res.status(404).json({ message: 'Historial medico no encontrado' });
    }
    res.json(medical);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el medicamento' });
  }
};

// @desc    Crear un nuevo medicamento
// @route   POST /api/medical
// @access  Private
exports.createMedical = async (req, res) => {
  try {
    const medical = await Medical.create(req.body);
    res.status(201).json(medical);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el historial medico' });
  }
};

// @desc    Actualizar un medicamento
// @route   PUT /api/medical/:id
// @access  Private
exports.updateMedical = async (req, res) => {
  try {
    const medical = await Medical.findByPk(req.params.id);
    if (!medical) {
      return res.status(404).json({ message: 'Historial medico no encontrado' });
    }
    await medical.update(req.body);
    res.json(medical);
  } catch (error) { 
    console.error(error); 
    res.status(500).json({ message: 'Error al actualizar el historial medico' });
  }
};

// @desc    Eliminar un medicamento
// @route   DELETE /api/medical/:id
// @access  Private
exports.deleteMedical = async (req, res) => {
  try {
    const medical = await Medical.findByPk(req.params.id);
    if (!medical) {
      return res.status(404).json({ message: 'Historial medico no encontrado' });
    }
    await medical.destroy();
    res.json({ message: 'Historial medico eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el historial medico' });
  }
};

// @desc    Eliminar un medicamento (soft delete)
// @route   DELETE /api/medical/:id
// @access  Private
exports.deleteMedicalSoft = async (req, res) => {
  try {
    const medical = await Medical.findByPk(req.params.id);
    if (!medical) {
      return res.status(404).json({ message: 'Historial medico no encontrado' });
    }
    await medical.update({ isActive: false });
    res.json({ message: 'Historial medico eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el historial medico' });
  }
};
