const { Organization, User, Subscription, Plan } = require('../models');
const { Op } = require('sequelize');

/**
 * Crear una nueva organización
 */
exports.createOrganization = async (req, res) => {
    try {
        const { name, subdomain, description, ...orgData } = req.body;
        const user = req.user;

        if (!name || !subdomain) {
            return res.status(400).json({
                message: 'Nombre y subdominio son requeridos'
            });
        }

        // Verificar que el subdominio esté disponible
        const existingOrg = await Organization.findOne({
            where: { subdomain: subdomain.toLowerCase() }
        });

        if (existingOrg) {
            return res.status(400).json({
                message: 'Subdominio no disponible'
            });
        }

        // Crear organización
        const organization = await Organization.create({
            name,
            subdomain: subdomain.toLowerCase(),
            description,
            ...orgData,
            createdBy: user.id,
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 días de prueba
        });

        // Actualizar usuario como propietario
        await user.update({
            organizationId: organization.id,
            organizationRole: 'owner',
            isOwner: true
        });

        // Crear suscripción de prueba (Free plan)
        const freePlan = await Plan.findOne({
            where: { name: 'Free' }
        });

        if (freePlan) {
            await Subscription.create({
                organizationId: organization.id,
                planId: freePlan.id,
                status: 'trialing',
                trialStart: new Date(),
                trialEnd: organization.trialEndsAt,
                usageMetrics: {
                    users: 1, // El propietario
                    clients: 0,
                    pets: 0,
                    appointments: 0,
                    invoices: 0,
                    storage: 0
                }
            });
        }

        res.status(201).json({
            message: 'Organización creada exitosamente',
            organization
        });

    } catch (error) {
        console.error('Error al crear organización:', error);
        res.status(500).json({ message: 'Error al crear organización' });
    }
};

/**
 * Obtener organizaciones (solo para super admin)
 */
exports.getOrganizations = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status } = req.query;

        const where = {};
        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { subdomain: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (status) {
            if (status === 'active') {
                where.isActive = true;
            } else if (status === 'inactive') {
                where.isActive = false;
            } else if (status === 'trial') {
                where.trialEndsAt = { [Op.gt]: new Date() };
            }
        }

        const organizations = await Organization.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['name', 'email']
                },
                {
                    model: Subscription,
                    as: 'subscription',
                    include: [{ model: Plan, as: 'plan' }]
                }
            ],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            organizations: organizations.rows,
            pagination: {
                total: organizations.count,
                page: parseInt(page),
                pages: Math.ceil(organizations.count / parseInt(limit)),
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener organizaciones:', error);
        res.status(500).json({ message: 'Error al obtener organizaciones' });
    }
};

/**
 * Obtener organización actual del usuario
 */
exports.getCurrentOrganization = async (req, res) => {
    try {
        const user = req.user;

        if (!user.organizationId) {
            return res.status(404).json({
                message: 'Usuario no pertenece a ninguna organización'
            });
        }

        const organization = await Organization.findByPk(user.organizationId, {
            include: [
                {
                    model: Subscription,
                    as: 'subscription',
                    include: [{ model: Plan, as: 'plan' }]
                },
                {
                    model: User,
                    as: 'users',
                    attributes: ['id', 'name', 'email', 'organizationRole', 'isActive']
                }
            ]
        });

        if (!organization) {
            return res.status(404).json({ message: 'Organización no encontrada' });
        }

        res.json(organization);

    } catch (error) {
        console.error('Error al obtener organización:', error);
        res.status(500).json({ message: 'Error al obtener organización' });
    }
};

/**
 * Actualizar organización
 */
exports.updateOrganization = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const updates = req.body;

        const organization = await Organization.findByPk(id);

        if (!organization) {
            return res.status(404).json({ message: 'Organización no encontrada' });
        }

        // Verificar permisos
        const canUpdate = user.role === 'super_admin' ||
            (user.organizationId === organization.id &&
                user.organizationRole === 'owner');

        if (!canUpdate) {
            return res.status(403).json({ message: 'No tienes permisos para actualizar esta organización' });
        }

        // Si se actualiza el subdominio, verificar disponibilidad
        if (updates.subdomain && updates.subdomain !== organization.subdomain) {
            const existing = await Organization.findOne({
                where: {
                    subdomain: updates.subdomain.toLowerCase(),
                    id: { [Op.ne]: id }
                }
            });

            if (existing) {
                return res.status(400).json({ message: 'Subdominio no disponible' });
            }
        }

        await organization.update(updates);

        res.json({
            message: 'Organización actualizada exitosamente',
            organization
        });

    } catch (error) {
        console.error('Error al actualizar organización:', error);
        res.status(500).json({ message: 'Error al actualizar organización' });
    }
};

/**
 * Invitar usuario a la organización
 */
exports.inviteUser = async (req, res) => {
    try {
        const { email, role = 'member' } = req.body;
        const organization = req.organization;

        if (!email) {
            return res.status(400).json({ message: 'Email es requerido' });
        }

        // Verificar que el usuario no exista ya en la organización
        const existingUser = await User.findOne({
            where: {
                email: email.toLowerCase(),
                organizationId: organization.id
            }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Usuario ya pertenece a la organización' });
        }

        // Crear usuario invitado
        const invitationToken = require('crypto').randomBytes(32).toString('hex');
        const invitationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

        const invitedUser = await User.create({
            email: email.toLowerCase(),
            username: email.toLowerCase(),
            name: email.split('@')[0], // Nombre temporal
            role: 'cliente', // Rol base, se actualizará al aceptar invitación
            organizationId: organization.id,
            organizationRole: role,
            invitedBy: req.user.id,
            invitationToken,
            invitationExpires,
            isActive: false // Se activa al aceptar invitación
        });

        // TODO: Enviar email de invitación
        console.log(`Invitación enviada a ${email} con token ${invitationToken}`);

        res.json({
            message: 'Invitación enviada exitosamente',
            user: invitedUser
        });

    } catch (error) {
        console.error('Error al invitar usuario:', error);
        res.status(500).json({ message: 'Error al invitar usuario' });
    }
};

/**
 * Obtener métricas de uso de la organización
 */
exports.getOrganizationUsage = async (req, res) => {
    try {
        const organization = req.organization;

        const subscription = await Subscription.findOne({
            where: { organizationId: organization.id },
            include: [{ model: Plan, as: 'plan' }]
        });

        if (!subscription) {
            return res.status(404).json({ message: 'Suscripción no encontrada' });
        }

        const usage = subscription.usageMetrics || {};
        const limits = subscription.plan.limits || {};

        // Calcular porcentajes de uso
        const usagePercentages = {};
        Object.keys(limits).forEach(key => {
            const limit = limits[key];
            const current = usage[key] || 0;
            usagePercentages[key] = limit === -1 ? 0 : Math.round((current / limit) * 100);
        });

        res.json({
            usage,
            limits,
            percentages: usagePercentages,
            plan: subscription.plan,
            subscription: {
                status: subscription.status,
                trialEnd: subscription.trialEnd,
                currentPeriodEnd: subscription.currentPeriodEnd
            }
        });

    } catch (error) {
        console.error('Error al obtener métricas de uso:', error);
        res.status(500).json({ message: 'Error al obtener métricas de uso' });
    }
};
