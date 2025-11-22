import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import portalApi from '../../api/portalApi';
import Loader from '../../components/common/Loader';

const PortalInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        try {
            setLoading(true);
            const res = await portalApi.get('/portal/invoices');
            setInvoices(res.data);
        } catch (error) {
            console.error('Error al cargar facturas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async (invoiceId) => {
        try {
            const response = await portalApi.get(`/portal/invoices/${invoiceId}/pdf`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `factura-${invoiceId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al descargar PDF:', error);
            alert('Error al descargar la factura');
        }
    };

    if (loading) {
        return <Loader fullScreen />;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-2xl font-bold text-slate-800">Mis Facturas</h2>
                <p className="text-sm text-slate-500 mt-1">Historial de pagos y servicios</p>
            </div>

            {invoices.length === 0 ? (
                <div className="bg-white rounded-2xl shadow p-6">
                    <p className="text-sm text-slate-500">No tienes facturas registradas.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {invoices.map((invoice) => (
                        <div key={invoice.id} className="bg-white rounded-2xl shadow p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-semibold text-slate-800">
                                            Factura #{invoice.id}
                                        </h3>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${invoice.status === 'pagado'
                                                    ? 'bg-green-100 text-green-800'
                                                    : invoice.status === 'pendiente'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {invoice.status === 'pagado' ? 'Pagado' :
                                                invoice.status === 'pendiente' ? 'Pendiente' : 'Cancelado'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {new Date(invoice.date).toLocaleDateString('es-PY')} • {invoice.pet?.name}
                                    </p>
                                    <p className="text-2xl font-bold text-slate-800 mt-2">
                                        ₲ {parseFloat(invoice.total).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Pago: {invoice.payment === 'efectivo' ? 'Efectivo' :
                                            invoice.payment === 'tarjeta' ? 'Tarjeta' : 'Transferencia'}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDownloadPDF(invoice.id)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium shadow hover:bg-blue-700 transition"
                                    >
                                        📄 Descargar PDF
                                    </button>
                                </div>
                            </div>

                            {invoice.items && invoice.items.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Detalles:</h4>
                                    <div className="space-y-1">
                                        {invoice.items.map((item, index) => (
                                            <div key={index} className="flex justify-between text-sm">
                                                <span className="text-slate-600">
                                                    {item.quantity || 1}x {item.name}
                                                </span>
                                                <span className="text-slate-800 font-medium">
                                                    ₲ {parseFloat(item.price).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PortalInvoices;
