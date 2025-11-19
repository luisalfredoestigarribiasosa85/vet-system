const { PlanPurchase, Plan, Client, Pet } = require('../models');

const purchaseIncludes = [
  { model: Plan, as: 'plan' },
  {
    model: Client,
    as: 'client',
    include: [{ model: Pet, as: 'pets', attributes: ['id', 'name'], required: false }],
  },
];

exports.getPlanPurchases = async (req, res) => {
  try {
    const purchases = await PlanPurchase.findAll({
      include: purchaseIncludes,
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
    const purchase = await PlanPurchase.findByPk(req.params.id, { include: purchaseIncludes });
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
