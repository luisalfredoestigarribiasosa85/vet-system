import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, PawPrint, Calendar, Scale, User } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { matchSearch, toInt, toFloat, confirmAction } from '../utils/helpers';
const Pets = () => {
  const [pets, setPets] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    species: '',
    breed: '',
    age: '',
    weight: '',
    gender: '',
    medicalHistory: '',
    allergies: ''
  });
  const [newReminder, setNewReminder] = useState({ type: '', date: '' });

  const handleReminderChange = (e) => {
    const { name, value } = e.target;
    setNewReminder(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [petsRes, clientsRes] = await Promise.all([
        api.get('/pets'),
        api.get('/clients')
      ]);
      setPets(petsRes.data);
      setClients(clientsRes.data);
    } catch {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        clientId: toInt(formData.clientId),
        age: toInt(formData.age) || null,
        weight: toFloat(formData.weight) || null,
        gender: formData.gender ? formData.gender.toLowerCase() : null
      };

      if (selectedPet) {
        await api.put(`/pets/${selectedPet.id}`, dataToSend);
        toast.success('Mascota actualizada');
      } else {
        await api.post('/pets', dataToSend);
        toast.success('Mascota creada');
      }
      loadData();
      setShowModal(false);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al guardar mascota';
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (confirmAction('¿Eliminar esta mascota?')) {
      try {
        await api.delete(`/pets/${id}`);
        toast.success('Mascota eliminada');
        loadData();
      } catch (err) {
        const msg = err?.response?.data?.message || 'Error al eliminar mascota';
        toast.error(msg);
      }
    }
  };

  const openModal = (pet = null) => {
    if (pet) {
      setSelectedPet(pet);
      setFormData({
        clientId: pet.clientId,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age: pet.age,
        weight: pet.weight || '',
        gender: pet.gender || '',
        medicalHistory: pet.medicalHistory || '',
        allergies: pet.allergies || ''
      });
    } else {
      setSelectedPet(null);
      setFormData({
        clientId: '',
        name: '',
        species: '',
        breed: '',
        age: '',
        weight: '',
        gender: '',
        medicalHistory: '',
        allergies: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPet(null);
    setFormData({ clientId: '', name: '', species: '', breed: '', age: '', weight: '', gender: '', medicalHistory: '', allergies: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddReminder = async () => {
    if (!newReminder.type || !newReminder.date) {
      return toast.error('El tipo y la fecha del recordatorio son obligatorios.');
    }
    if (!selectedPet) return;

    try {
      const response = await api.post(`/pets/${selectedPet.id}/reminders`, newReminder);
      const updatedPet = response.data;

      // Update the selectedPet state to instantly show the new reminder
      setSelectedPet(updatedPet);

      // Update the main pets list
      setPets(prevPets => prevPets.map(p => p.id === updatedPet.id ? updatedPet : p));

      // Clear the form
      setNewReminder({ type: '', date: '' });
      toast.success('Recordatorio añadido');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al añadir recordatorio';
      toast.error(msg);
    }
  };

  const filteredPets = pets.filter(pet => matchSearch(pet, searchTerm, ['name', 'breed']));

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Mascotas</h1>
        <Button icon={Plus} variant="success" onClick={() => openModal()} className="w-full sm:w-auto">
          Nueva Mascota
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar mascota..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {filteredPets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map(pet => (
            <div key={pet.id} className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center min-w-0 flex-1">
                  <PawPrint className="text-green-600 mr-2 flex-shrink-0" size={24} />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">{pet.name}</h3>
                </div>
              </div>
              <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                <p><strong>Especie:</strong> {pet.species}</p>
                <p><strong>Raza:</strong> {pet.breed}</p>
                <p><strong>Edad:</strong> {pet.age} años</p>
                <p><strong>Dueño:</strong> {clients.find(c => c.id === pet.clientId)?.name || 'No asignado'}</p>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                <div className="flex gap-2 flex-1 sm:flex-initial">
                  <Button
                    variant="primary"
                    onClick={() => window.location.href = `/pets/${pet.id}/history`}
                    className="text-xs sm:text-sm flex-1 sm:flex-initial px-3 sm:px-4"
                  >
                    <span className="hidden sm:inline">📋 </span>
                    Historial
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => window.location.href = `/vaccinations/${pet.id}`}
                    className="text-xs sm:text-sm flex-1 sm:flex-initial px-3 sm:px-4"
                  >
                    <span className="hidden sm:inline">💉 </span>
                    Vacunas
                  </Button>
                </div>
                <div className="flex gap-2 justify-end sm:justify-start">
                  <Button variant="icon" onClick={() => openModal(pet)} className="p-2">
                    <Edit size={18} />
                  </Button>
                  <Button variant="icon" className="text-red-500 p-2" onClick={() => handleDelete(pet.id)}>
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-gray-50 rounded-lg">
          <PawPrint className="mx-auto text-gray-400" size={48} />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No se encontraron mascotas</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Intenta con otra búsqueda.' : '¡Agrega una nueva mascota para comenzar!'}
          </p>
        </div>
      )}

      <Modal isOpen={showModal} onClose={closeModal} title={selectedPet ? 'Editar Mascota' : 'Nueva Mascota'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">Dueño</label>
              <select name="clientId" id="clientId" value={formData.clientId} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500">
                <option value="">Seleccione un dueño</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="species" className="block text-sm font-medium text-gray-700">Especie</label>
              <input type="text" name="species" id="species" value={formData.species} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label htmlFor="breed" className="block text-sm font-medium text-gray-700">Raza</label>
              <input type="text" name="breed" id="breed" value={formData.breed} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">Edad (años)</label>
              <input type="number" name="age" id="age" value={formData.age} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Peso (kg)</label>
              <input type="number" step="0.1" name="weight" id="weight" value={formData.weight} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Género</label>
              <select name="gender" id="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500">
                <option value="">No especificado</option>
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700">Historial Médico</label>
            <textarea
              name="medicalHistory"
              id="medicalHistory"
              rows="3"
              value={formData.medicalHistory}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500"
            ></textarea>
          </div>
          <div>
            <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">Alergias</label>
            <textarea
              name="allergies"
              id="allergies"
              rows="2"
              value={formData.allergies}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500"
            ></textarea>
          </div>

          {/* Reminders Section */}
          {selectedPet && (
            <div>
              <h4 className="text-lg font-medium text-gray-800 mb-2">Recordatorios</h4>
              <div className="space-y-2 mb-4">
                {selectedPet.reminders && selectedPet.reminders.length > 0 ? (
                  <ul className="list-disc list-inside bg-gray-50 p-3 rounded-md">
                    {selectedPet.reminders.map((reminder, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {reminder.type} - {new Date(reminder.date).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No hay recordatorios programados.</p>
                )}
              </div>
              {/* Add Reminder Form */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  name="type"
                  placeholder="Tipo de recordatorio"
                  value={newReminder.type}
                  onChange={handleReminderChange}
                  className="flex-grow border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500"
                />
                <input
                  type="date"
                  name="date"
                  value={newReminder.date}
                  onChange={handleReminderChange}
                  className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-green-500 focus:border-green-500"
                />
                <Button type="button" variant="secondary" onClick={handleAddReminder}>Añadir</Button>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="success">
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Pets;