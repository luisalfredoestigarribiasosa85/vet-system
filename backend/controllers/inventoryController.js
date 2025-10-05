const Inventory = require('../models/Inventory');

// @desc    Obtener todos los inventarios
// @route   GET /api/inventories
// @access  Private
exports.getInventories = async (req, res) => {
  try {
    const inventories = await Inventory.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });
    res.json(inventories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los inventarios' });
  }
};

// @desc    Obtener un inventario por ID
// @route   GET /api/inventories/:id
// @access  Private
exports.getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findByPk(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventario no encontrado' });
    }
    res.json(inventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el inventario' });
  }
};

// @desc    Crear un nuevo inventario
// @route   POST /api/inventories
// @access  Private
exports.createInventory = async (req, res) => {
  try {
    const inventory = await Inventory.create(req.body);
    res.status(201).json(inventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el inventario' });
  }
};

// @desc    Actualizar un inventario
// @route   PUT /api/inventories/:id
// @access  Private
exports.updateInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByPk(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventario no encontrado' });
    }
    await inventory.update(req.body);
    res.json(inventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el inventario' });
  }
};

// @desc    Eliminar un inventario
// @route   DELETE /api/inventories/:id
// @access  Private
exports.deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByPk(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventario no encontrado' });
    }
    await inventory.destroy();
    res.json({ message: 'Inventario eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el inventario' });
  }
};
