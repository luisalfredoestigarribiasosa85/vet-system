import { useState, useEffect } from 'react';
import { Eye, Download, Search, Filter } from 'lucide-react';
import Loader from '../components/common/Loader';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    let filtered = invoices;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(inv =>
        inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.client?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInvoices(filtered);
  }, [searchTerm, statusFilter, invoices]);

  const loadInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data || []);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al cargar facturas';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Gs. ${parseInt(amount || 0).toLocaleString('es-PY')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PY', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pagado: 'bg-green-100 text-green-800',
      pendiente: 'bg-yellow-100 text-yellow-800',
      parcial: 'bg-blue-100 text-blue-800',
      vencido: 'bg-red-100 text-red-800',
      cancelado: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[status] || statusColors.pendiente}`}>
        {status}
      </span>
    );
  };

  const handleDownloadPDF = (invoiceId) => {
    try {
      const token = localStorage.getItem('token');
      let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      if (baseUrl.endsWith('/api')) {
        baseUrl = baseUrl.slice(0, -4);
      }
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }

      const url = `${baseUrl}/api/invoices/${invoiceId}/pdf?token=${token}`;
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 5000);

      toast.success('Descargando factura...');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al descargar factura');
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Facturación</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de facturas y pagos</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800">
            {formatCurrency(invoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0))}
          </div>
          <div className="text-sm text-gray-500">Total facturado</div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por número, cliente o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por estado */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Todos los estados</option>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
              <option value="parcial">Parcial</option>
              <option value="vencido">Vencido</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Resumen de resultados */}
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {filteredInvoices.length} de {invoices.length} facturas
        </div>
      </div>

      {/* Tabla de facturas */}
      {filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-6 text-center text-gray-600">
          {invoices.length === 0 
            ? 'No hay facturas para mostrar aún.'
            : 'No se encontraron facturas con los filtros aplicados.'}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Emisión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
              </tr>
            </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{inv.invoiceNumber || `#${inv.id}`}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{inv.client?.name || '-'}</div>
                      {inv.client?.email && (
                        <div className="text-xs text-gray-500">{inv.client.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatDate(inv.issueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {inv.dueDate ? formatDate(inv.dueDate) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(inv.total)}
                      </div>
                      {inv.status === 'parcial' && inv.amountPaid > 0 && (
                        <div className="text-xs text-gray-500">
                          Pagado: {formatCurrency(inv.amountPaid)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDownloadPDF(inv.id)}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                          title="Descargar PDF"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;