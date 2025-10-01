import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { matchSearch, confirmAction } from '../utils/helpers';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch {
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedClient) {
        await api.put(`/clients/${selectedClient.id}`, formData);
        toast.success('Cliente actualizado');
      } else {
        await api.post('/clients', formData);
        toast.success('Cliente creado');
      }
      loadClients();
      closeModal();
    } catch {
      toast.error('Error al guardar cliente');
    }
  };

  const handleDelete = async (id) => {
    if (confirmAction('¿Eliminar este cliente?')) {
      try {
        await api.delete(`/clients/${id}`);
        toast.success('Cliente eliminado');
        loadClients();
      } catch {
        toast.error('Error al eliminar cliente');
      }
    }
  };

  const openModal = (client = null) => {
    if (client) {
      setSelectedClient(client);
      setFormData({
        name: client.name,
        phone: client.phone,
        email: client.email,
        address: client.address
      });
    } else {
      setSelectedClient(null);
      setFormData({ name: '', phone: '', email: '', address: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClient(null);
    setFormData({ name: '', phone: '', email: '', address: '' });
  };

  const filteredClients = clients.filter(client =>
    matchSearch(client, searchTerm, ['name', 'email'])
  );

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
        <Button icon={Plus} onClick={() => openModal()}>
          Nuevo Cliente
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => (
          <div key={client.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-800">{client.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => openModal(client)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-center">
                <Phone size={16} className="mr-2" /> {client.phone}
              </p>
              <p className="flex items-center">
                <Mail size={16} className="mr-2" /> {client.email}
              </p>
              <p className="flex items-center">
                <MapPin size={16} className="mr-2" /> {client.address}
              </p>
              {client.pets && client.pets.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="font-semibold text-gray-700">
                    Mascotas: {client.pets.length}
                  </p>
                  {client.pets.map(pet => (
                    <span
                      key={pet.id}
                      className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mt-1"
                    >
                      {pet.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={selectedClient ? 'Editar Cliente' : 'Nuevo Cliente'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Nombre completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Teléfono"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Dirección"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={closeModal} type="button">
              Cancelar
            </Button>
            <Button type="submit">
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Clients;