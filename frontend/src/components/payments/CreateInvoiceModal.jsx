import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CreateInvoiceModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState([]);
    const [pets, setPets] = useState([]);
    const [services, setServices] = useState([]);

    // Calcular fecha por defecto (30 días después de hoy)
    const getDefaultDueDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    };

    const [formData, setFormData] = useState({
        clientId: '',
        petId: '',
        items: [],
        discount: 0,
        tax: 0,
        notes: '',
        dueDate: getDefaultDueDate()
    });

    const [selectedService, setSelectedService] = useState('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
        }
    }, [isOpen]);

    useEffect(() => {
        if (formData.clientId) {
            loadClientPets(formData.clientId);
        }
    }, [formData.clientId]);

    const loadInitialData = async () => {
        try {
            console.log('Cargando datos iniciales...');
            const [clientsRes, servicesRes] = await Promise.all([
                api.get('/clients'),
                api.get('/services?isActive=true')
            ]);
            console.log('Clientes recibidos:', clientsRes.data);
            console.log('Servicios recibidos:', servicesRes.data);
            setClients(clientsRes.data);
            setServices(servicesRes.data);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            console.error('Detalles del error:', error.response);
            toast.error('Error al cargar datos iniciales');
        }
    };

    const loadClientPets = async (clientId) => {
        try {
            const res = await api.get(`/clients/${clientId}`);
            setPets(res.data.pets || []);
        } catch (error) {
            console.error('Error al cargar mascotas:', error);
            setPets([]);
        }
    };

    const addItem = () => {
        if (!selectedService || quantity <= 0) {
            toast.error('Selecciona un servicio y cantidad válida');
            return;
        }

        const service = services.find(s => s.id === parseInt(selectedService));
        if (!service) return;

        const newItem = {
            serviceId: service.id,
            name: service.name,
            quantity: quantity,
            price: parseFloat(service.price),
            subtotal: parseFloat(service.price) * quantity
        };

        setFormData(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));

        setSelectedService('');
        setQuantity(1);
    };

    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const calculateTotals = () => {
        const subtotal = formData.items.reduce((sum, item) => sum + item.subtotal, 0);
        const discount = parseFloat(formData.discount) || 0;
        const tax = parseFloat(formData.tax) || 0;
        const total = subtotal - discount + tax;
        return { subtotal, discount, tax, total };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.clientId) {
            toast.error('Selecciona un cliente');
            return;
        }

        if (formData.items.length === 0) {
            toast.error('Agrega al menos un servicio');
            return;
        }

        setLoading(true);
        try {
            await api.post('/invoices', formData);
            toast.success('Factura creada exitosamente');
            onSuccess();
            handleClose();
        } catch (error) {
            console.error('Error al crear factura:', error);
            toast.error(error?.response?.data?.message || 'Error al crear factura');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            clientId: '',
            petId: '',
            items: [],
            discount: 0,
            tax: 0,
            notes: '',
            dueDate: getDefaultDueDate()
        });
        setSelectedService('');
        setQuantity(1);
        setPets([]);
        onClose();
    };

    const formatCurrency = (amount) => {
        return `Gs. ${parseInt(amount || 0).toLocaleString('es-PY')}`;
    };

    const totals = calculateTotals();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Nueva Factura</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Cliente y Mascota */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cliente *
                            </label>
                            <select
                                value={formData.clientId}
                                onChange={(e) => setFormData({ ...formData, clientId: e.target.value, petId: '' })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Seleccionar cliente</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mascota (Opcional)
                            </label>
                            <select
                                value={formData.petId}
                                onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={!formData.clientId || pets.length === 0}
                            >
                                <option value="">Sin mascota específica</option>
                                {pets.map(pet => (
                                    <option key={pet.id} value={pet.id}>
                                        {pet.name} ({pet.species})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Agregar Servicios */}
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Servicios</h3>

                        {services.length === 0 ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-yellow-800">
                                    <strong>No hay servicios disponibles.</strong>
                                    <br />
                                    Ejecuta el script de migración en el backend:
                                    <br />
                                    <code className="bg-yellow-100 px-2 py-1 rounded mt-2 inline-block">
                                        node scripts/migrate-payments.js
                                    </code>
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="md:col-span-2">
                                    <select
                                        value={selectedService}
                                        onChange={(e) => setSelectedService(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Seleccionar servicio</option>
                                        {services.map(service => (
                                            <option key={service.id} value={service.id}>
                                                {service.name} - {formatCurrency(service.price)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                        className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Cant."
                                    />
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                    >
                                        <Plus size={20} />
                                        Agregar
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Lista de Items */}
                        {formData.items.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Servicio</th>
                                            <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700">Cant.</th>
                                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">Precio</th>
                                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">Subtotal</th>
                                            <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {formData.items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-2 text-sm text-gray-700">{item.name}</td>
                                                <td className="px-4 py-2 text-sm text-center text-gray-700">{item.quantity}</td>
                                                <td className="px-4 py-2 text-sm text-right text-gray-700">{formatCurrency(item.price)}</td>
                                                <td className="px-4 py-2 text-sm text-right font-medium text-gray-900">{formatCurrency(item.subtotal)}</td>
                                                <td className="px-4 py-2 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Descuento, IVA y Notas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descuento (Gs.)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.discount}
                                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                IVA (Gs.)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.tax}
                                onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha de Vencimiento
                            </label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Por defecto: 30 días después de la fecha de emisión
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notas
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Notas adicionales..."
                        />
                    </div>

                    {/* Totales */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                        </div>
                        {totals.discount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Descuento:</span>
                                <span className="font-medium text-red-600">-{formatCurrency(totals.discount)}</span>
                            </div>
                        )}
                        {totals.tax > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">IVA:</span>
                                <span className="font-medium">{formatCurrency(totals.tax)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                            <span>Total:</span>
                            <span className="text-blue-600">{formatCurrency(totals.total)}</span>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || formData.items.length === 0}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creando...' : 'Crear Factura'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateInvoiceModal;
