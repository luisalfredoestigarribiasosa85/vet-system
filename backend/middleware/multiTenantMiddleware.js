const { Organization, Subscription, Plan } = require('../models');

/**
 * Middleware para asegurar que el usuario pertenece a una organización activa
 */
const requireOrganization = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        // Super admin puede acceder a todo
        if (user.role === 'super_admin') {
            return next();
        }

        if (!user.organizationId) {
            return res.status(403).json({
                message: 'Usuario no pertenece a ninguna organización',
                code: 'NO_ORGANIZATION'
            });
        }

        // Verificar que la organización existe y está activa
        const organization = await Organization.findByPk(user.organizationId);
        if (!organization) {
            return res.status(404).json({ message: 'Organización no encontrada' });
        }

        if (!organization.isActive) {
            return res.status(403).json({
                message: 'Organización inactiva',
                code: 'ORGANIZATION_INACTIVE'
            });
        }

        // Agregar organización al request
        req.organization = organization;
        next();

    } catch (error) {
        console.error('Error en middleware requireOrganization:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

/**
 * Middleware para verificar límites del plan
 */
const checkPlanLimits = (resourceType) => {
    return async (req, res, next) => {
        try {
            const organization = req.organization;

            if (!organization) {
                return next();
            }

            // Obtener suscripción activa
            const subscription = await Subscription.findOne({
                where: {
                    organizationId: organization.id,
                    status: ['active', 'trialing']
                },
                include: [{ model: Plan, as: 'plan' }]
            });

            if (!subscription) {
                return res.status(403).json({
                    message: 'No hay suscripción activa',
                    code: 'NO_ACTIVE_SUBSCRIPTION'
                });
            }

            const plan = subscription.plan;
            const limits = plan.limits || {};
            const usage = subscription.usageMetrics || {};

            // Verificar límite
            const limit = limits[resourceType];
            const currentUsage = usage[resourceType] || 0;

            // -1 significa ilimitado
            if (limit !== -1 && currentUsage >= limit) {
                return res.status(403).json({
                    message: `Límite de ${resourceType} alcanzado (${limit})`,
                    code: 'LIMIT_EXCEEDED',
                    limit,
                    current: currentUsage
                });
            }

            // Agregar información del plan al request
            req.subscription = subscription;
            req.planLimits = limits;
            req.currentUsage = usage;

            next();

        } catch (error) {
            console.error('Error en middleware checkPlanLimits:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    };
};

/**
 * Middleware para actualizar métricas de uso
 */
const updateUsageMetrics = (resourceType, action = 'increment') => {
    return async (req, res, next) => {
        try {
            const organization = req.organization;

            if (!organization) {
                return next();
            }

            // Solo actualizar si hay suscripción
            if (req.subscription) {
                const usage = { ...req.currentUsage };
                const increment = action === 'increment' ? 1 : -1;

                usage[resourceType] = Math.max(0, (usage[resourceType] || 0) + increment);

                await req.subscription.update({
                    usageMetrics: usage
                });
            }

            next();

        } catch (error) {
            console.error('Error en middleware updateUsageMetrics:', error);
            // No bloquear la operación por error en métricas
            next();
        }
    };
};

/**
 * Middleware para filtrar queries por organización
 */
const scopeToOrganization = (modelName, options = {}) => {
    return (req, res, next) => {
        const organization = req.organization;

        if (!organization) {
            return next();
        }

        // Agregar filtro de organización a la query
        if (options.queryType === 'create') {
            // Para operaciones CREATE, agregar organizationId automáticamente
            req.body.organizationId = organization.id;
        } else if (options.queryType === 'find') {
            // Para operaciones FIND, filtrar por organización
            if (!req.query.where) req.query.where = {};
            req.query.where.organizationId = organization.id;
        }

        next();
    };
};

module.exports = {
    requireOrganization,
    checkPlanLimits,
    updateUsageMetrics,
    scopeToOrganization
};
