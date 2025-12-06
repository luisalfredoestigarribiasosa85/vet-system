import { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    transferencia: 'Transferencia',
    qr: 'QR (Giro/Zimple)',
    billetera_digital: 'Billetera Digital'
};

const RegisterPaymentModal = ({ isOpen, onClose, invoice, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        paymentMethod: 'efectivo',
        reference: '',
        notes: ''
    });

    if (!isOpen || !invoice) return null;

    const remainingAmount = parseFloat(invoice.total) - parseFloat(invoice.amountPaid);

    const formatCurrency = (amount) => {
        return `Gs. ${parseInt(amount || 0).toLocaleString('es-PY')}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const amount = parseFloat(formData.amount);
        if (!amount || amount <= 0) {
            toast.error('Ingresa un monto válido');
            return;
        }

        if (amount > remainingAmount) {
            toast.error(`El monto no puede exceder ${formatCurrency(remainingAmount)}`);
            return;
        }

        setLoading(true);
        try {
            await api.post(`/invoices/${invoice.id}/payments`, {
                ...formData,
                amount
            });
            toast.success('Pago registrado exitosamente');
            onSuccess();
            handleClose();
        } catch (error) {
            console.error('Error al registrar pago:', error);
            toast.error(error?.response?.data?.message || 'Error al registrar pago');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            amount: '',
            paymentMethod: 'efectivo',
            reference: '',
            notes: ''
        });
        onClose();
    };

    const setFullAmount = () => {
        setFormData({ ...formData, amount: remainingAmount.toString() });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CreditCard className="text-green-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Registrar Pago</h2>
                            <p className="text-sm text-gray-600">Factura {invoice.invoiceNumber}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Información de la Factura */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Factura:</span>
                            <span className="font-medium">{formatCurrency(invoice.total)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Ya Pagado:</span>
                            <span className="font-medium text-green-600">{formatCurrency(invoice.amountPaid)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                            <span>Saldo Pendiente:</span>
                            <span className="text-orange-600">{formatCurrency(remainingAmount)}</span>
                        </div>
                    </div>

                    {/* Monto */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Monto a Pagar (Gs.) *
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min="1"
                                max={remainingAmount}
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Ingresa el monto"
                                required
                            />
                            <button
                                type="button"
                                onClick={setFullAmount}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                            >
                                Total
                            </button>
                        </div>
                    </div>

                    {/* Método de Pago */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Método de Pago *
                        </label>
                        <select
                            value={formData.paymentMethod}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                        >
                            {Object.entries(PAYMENT_METHODS).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Referencia */}
                    {['transferencia', 'qr', 'billetera_digital'].includes(formData.paymentMethod) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Número de Referencia
                            </label>
                            <input
                                type="text"
                                value={formData.reference}
                                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Ej: 123456789"
                            />
                        </div>
                    )}

                    {/* Notas */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notas (Opcional)
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Notas adicionales sobre el pago..."
                        />
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Registrando...' : 'Registrar Pago'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPaymentModal;
