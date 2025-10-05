import { useState, useEffect } from 'react';
import Loader from '../components/common/Loader';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { toInt, toFloat, confirmAction } from '../utils/helpers';
import { Search } from 'lucide-react';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    minStock: '',
    price: '',
    supplier: '',
    expiryDate: ''
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const res = await api.get('/inventory');
      setItems(res.data || []);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al cargar inventario';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        name: item.name || '',
        category: item.category || '',
        quantity: String(item.quantity ?? ''),
        minStock: String(item.minStock ?? ''),
        price: String(item.price ?? ''),
        supplier: item.supplier || '',
        expiryDate: item.expiryDate || ''
      });
    } else {
      setSelectedItem(null);
      setFormData({ name: '', category: '', quantity: '', minStock: '', price: '', supplier: '', expiryDate: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setFormData({ name: '', category: '', quantity: '', minStock: '', price: '', supplier: '', expiryDate: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      category: formData.category || null,
      quantity: toInt(formData.quantity, 0),
      minStock: toInt(formData.minStock, 0),
      price: formData.price === '' ? null : toFloat(formData.price, 0),
      supplier: formData.supplier || null,
      expiryDate: formData.expiryDate || null
    };
    try {
      if (selectedItem) {
        await api.put(`/inventory/${selectedItem.id}`, payload);
        toast.success('Producto actualizado');
      } else {
        await api.post(`/inventory`, payload);
        toast.success('Producto creado');
      }
      await loadInventory();
      closeModal();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al guardar producto';
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!confirmAction('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/inventory/${id}`);
      toast.success('Producto eliminado');
      await loadInventory();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al eliminar producto';
      toast.error(msg);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Inventario</h1>
        <Button onClick={() => openModal()}>
          Nuevo producto
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre, categoría o proveedor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {(() => {
        const q = searchTerm.toLowerCase().trim();
        const filtered = !q
          ? items
          : items.filter((it) => {
              const name = (it.name || '').toLowerCase();
              const category = (it.category || '').toLowerCase();
              const supplier = (it.supplier || '').toLowerCase();
              return name.includes(q) || category.includes(q) || supplier.includes(q);
            });
        return filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-6 text-gray-600">
          No hay inventario para mostrar con el filtro actual.
        </div>
        ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Producto</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Categoría</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Stock</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Mínimo</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Vence</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((it) => (
                <tr key={it.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-700">{it.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{it.category || '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{it.quantity}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{it.minStock}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{it.expiryDate || '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => openModal(it)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
</svg>
</Button>
                      <Button variant="danger" onClick={() => handleDelete(it.id)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>
</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        );
      })()}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {selectedItem ? 'Editar producto' : 'Nuevo producto'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input label="Nombre" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <Input label="Categoría" name="category" value={formData.category} onChange={handleChange} />
              <Input label="Proveedor" name="supplier" value={formData.supplier} onChange={handleChange} />
              <Input label="Cantidad" type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />
              <Input label="Stock mínimo" type="number" name="minStock" value={formData.minStock} onChange={handleChange} required />
              <Input label="Precio" type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} />
              <Input label="Fecha de vencimiento" type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} />

              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;