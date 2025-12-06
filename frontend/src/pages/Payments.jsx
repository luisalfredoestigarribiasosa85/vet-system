import { useState, useEffect } from 'react';
import {
  DollarSign,
  FileText,
  TrendingUp,
  CreditCard,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';
import CreateInvoiceModal from '../components/payments/CreateInvoiceModal';
import RegisterPaymentModal from '../components/payments/RegisterPaymentModal';

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#65a30d'];

const STATUS_CONFIG = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  pagado: { label: 'Pagado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  parcial: { label: 'Parcial', color: 'bg-blue-100 text-blue-800', icon: TrendingUp },
  vencido: { label: 'Vencido', color: 'bg-red-100 text-red-800', icon: XCircle },
  cancelado: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800', icon: XCircle }
};

const PAYMENT_METHODS = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  qr: 'QR (Giro/Zimple)',
  billetera_digital: 'Billetera Digital'
};

const Payments = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, invoicesRes] = await Promise.all([
        api.get('/invoices/stats/dashboard'),
        api.get('/invoices')
      ]);
      setStats(statsRes.data);
      setInvoices(invoicesRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar datos de pagos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = invoices;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(inv =>
        inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.pet?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInvoices(filtered);
  }, [searchTerm, statusFilter, invoices]);

  const formatCurrency = (amount) => {
    return `Gs. ${parseInt(amount || 0).toLocaleString('es-PY')}`;
  };

  const processPaymentMethodsData = (paymentsByMethod) => {
    if (!paymentsByMethod || !Array.isArray(paymentsByMethod)) return [];

    return paymentsByMethod
      .map(item => ({
        ...item,
        total: parseFloat(item.total) || 0,
        paymentMethod: item.paymentMethod || item.payment_method
      }))
      .filter(item => item.total > 0);
  };

  const handleDownloadPDF = (invoiceId) => {
    try {
      const token = localStorage.getItem('token');
      let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // Limpiar baseUrl para evitar duplicados
      if (baseUrl.endsWith('/api')) {
        baseUrl = baseUrl.slice(0, -4);
      }
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }

      const url = `${baseUrl}/api/invoices/${invoiceId}/pdf?token=${token}`;

      // Usar iframe oculto para descargar sin abrir nueva pestaña
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);

      // Limpiar iframe después de un tiempo prudente
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 5000);

      toast.success('Descargando factura...');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al abrir factura');
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Pagos</h1>
          <p className="text-gray-600 mt-1">Facturación y control de pagos</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Nueva Factura
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Facturado</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(stats?.totalInvoices)}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <FileText size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Cobrado</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(stats?.totalPaid)}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <DollarSign size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Pendiente</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(stats?.totalPending)}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <Clock size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Facturas</p>
              <p className="text-3xl font-bold mt-2">{invoices.length}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <TrendingUp size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Métodos de Pago</h2>
          {(() => {
            const processedData = processPaymentMethodsData(stats?.paymentsByMethod);
            const totalAmount = processedData.reduce((sum, item) => sum + item.total, 0);

            if (processedData.length === 0) {
              return (
                <div className="flex items-center justify-center h-40 text-gray-500">
                  <div className="text-center">
                    <p>No hay datos de pagos para mostrar</p>
                    <p className="text-sm mt-1">Registra pagos para ver estadísticas</p>
                  </div>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {processedData.map((item, index) => {
                  const percentage = totalAmount > 0 ? ((item.total / totalAmount) * 100) : 0;
                  return (
                    <div key={item.paymentMethod} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">
                          {PAYMENT_METHODS[item.paymentMethod] || item.paymentMethod}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          {formatCurrency(item.total)} ({percentage.toFixed(1)}%)
                        </span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Estado de Facturas</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats?.invoicesByStatus || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="total" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por factura, cliente o mascota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
              <option value="parcial">Parcial</option>
              <option value="vencido">Vencido</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Factura</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Mascota</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Pagado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No se encontraron facturas
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => {
                  const statusConfig = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.pendiente;
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(invoice.issueDate).toLocaleDateString('es-PY')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {invoice.client?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {invoice.pet?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.total)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatCurrency(invoice.amountPaid)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon size={14} />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownloadPDF(invoice.id)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Descargar PDF"
                          >
                            <Download size={18} />
                          </button>
                          {invoice.status !== 'pagado' && invoice.status !== 'cancelado' && (
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setShowPaymentModal(true);
                              }}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition"
                            >
                              Registrar Pago
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CreateInvoiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadData}
      />

      <RegisterPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        invoice={selectedInvoice}
        onSuccess={loadData}
      />
    </div>
  );
};

export default Payments;
