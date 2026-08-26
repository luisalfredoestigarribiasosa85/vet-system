const { PlanPurchase, Plan, Client, Pet } = require('../models');

// Aislamiento multi-tenant: PlanPurchase no tiene organizationId propio,
// se filtra a través del cliente asociado.
const getPurchaseIncludes = (organizationId) => [
  { model: Plan, as: 'plan' },
  {
    model: Client,
    as: 'client',
    ...(organizationId
      ? { where: { organizationId }, required: true }
      : {}),
    include: [{ model: Pet, as: 'pets', attributes: ['id', 'name'], required: false }],
  },
];

exports.getPlanPurchases = async (req, res) => {
  try {
    const organizationId = req.user?.organizationId ?? null;

    const purchases = await PlanPurchase.findAll({
      include: getPurchaseIncludes(organizationId),
      order: [['createdAt', 'DESC']],
    });
    res.json(purchases);
  } catch (error) {
    console.error('Error fetching plan purchases', error);
    res.status(500).json({ message: 'Error al obtener pagos de planes' });
  }
};

exports.updatePlanPurchaseStatus = async (req, res) => {
  try {
    const organizationId = req.user?.organizationId ?? null;

    const purchase = await PlanPurchase.findByPk(req.params.id, {
      include: getPurchaseIncludes(organizationId),
    });
    if (!purchase) {
      return res.status(404).json({ message: 'Compra no encontrada' });
    }

    const { status, paymentMethod, paymentReference, notes } = req.body;
    const updates = {};

    if (status) {
      updates.status = status;
      if (status === 'pagado' && !purchase.paidAt) {
        updates.paidAt = new Date();
      }
      if (status !== 'pagado') {
        updates.paidAt = null;
      }
    }

    if (paymentMethod) updates.paymentMethod = paymentMethod;
    if (paymentReference !== undefined) updates.paymentReference = paymentReference || null;
    if (notes !== undefined) updates.notes = notes || null;

    await purchase.update(updates);

    res.json(purchase);
  } catch (error) {
    console.error('Error updating plan purchase', error);
    res.status(500).json({ message: 'Error al actualizar estado de pago' });
  }
};
