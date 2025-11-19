const { Plan } = require('../models');

const sanitizePrice = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return NaN;
  }
  return parsed;
};

exports.getPlans = async (req, res) => {
  try {
    const plans = await Plan.findAll({ order: [['createdAt', 'ASC']] });
    res.json(plans);
  } catch (error) {
    console.error('Error fetching plans', error);
    res.status(500).json({ message: 'Error al obtener planes' });
  }
};

exports.createPlan = async (req, res) => {
  try {
    const { name, description, price, currency = 'PYG', vatPercentage = 10, isActive = true } = req.body;

    const numericPrice = sanitizePrice(price);
    if (!name || numericPrice === null || Number.isNaN(numericPrice)) {
      return res.status(400).json({ message: 'Nombre y precio valido son obligatorios' });
    }

    const plan = await Plan.create({
      name,
      description: description || null,
      price: numericPrice,
      currency,
      vatPercentage,
      isActive,
    });

    res.status(201).json(plan);
  } catch (error) {
    console.error('Error creating plan', error);
    res.status(500).json({ message: 'Error al crear plan' });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan no encontrado' });
    }

    const { name, description, price, currency, vatPercentage, isActive } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (currency !== undefined) updates.currency = currency;
    if (vatPercentage !== undefined) updates.vatPercentage = vatPercentage;
    if (isActive !== undefined) updates.isActive = isActive;

    if (price !== undefined) {
      const numericPrice = sanitizePrice(price);
      if (Number.isNaN(numericPrice)) {
        return res.status(400).json({ message: 'Precio invalido' });
      }
      updates.price = numericPrice;
    }

    await plan.update(updates);

    res.json(plan);
  } catch (error) {
    console.error('Error updating plan', error);
    res.status(500).json({ message: 'Error al actualizar plan' });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan no encontrado' });
    }

    await plan.destroy();
    res.json({ message: 'Plan eliminado' });
  } catch (error) {
    console.error('Error deleting plan', error);
    res.status(500).json({ message: 'Error al eliminar plan' });
  }
};
