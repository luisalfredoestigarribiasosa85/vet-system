import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/common/Loader';
import WeightChart from '../components/medical/WeightChart';
import MedicalTimeline from '../components/medical/MedicalTimeline';
import AllergiesSection from '../components/medical/AllergiesSection';
import SurgeriesSection from '../components/medical/SurgeriesSection';

const MedicalHistory = () => {
  const { petId } = useParams();
  const [records, setRecords] = useState([]);
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline'); // timeline, weight, allergies, surgeries

  useEffect(() => {
    fetchHistory();
  }, [petId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      // Obtener info de la mascota
      const petRes = await api.get(`/pets/${petId}`);
      setPet(petRes.data);

      // Obtener historial médico
      const historyRes = await api.get(`/medical/pets/${petId}/records`);
      setRecords(historyRes.data);

      setError(null);
    } catch (err) {
      setError('Error al cargar el historial médico. ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Extraer todas las alergias de todos los registros
  const getAllAllergies = () => {
    const allergiesMap = new Map();
    records.forEach(record => {
      if (record.allergies && Array.isArray(record.allergies)) {
        record.allergies.forEach(allergy => {
          if (!allergiesMap.has(allergy.name)) {
            allergiesMap.set(allergy.name, allergy);
          }
        });
      }
    });
    return Array.from(allergiesMap.values());
  };

  // Extraer todas las cirugías de todos los registros
  const getAllSurgeries = () => {
    const surgeries = [];
    records.forEach(record => {
      if (record.surgeries && Array.isArray(record.surgeries)) {
        surgeries.push(...record.surgeries);
      }
    });
    return surgeries.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
        <Link to="/pets" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Volver a Mascotas
        </Link>
      </div>
    );
  }

  const allergies = getAllAllergies();
  const surgeries = getAllSurgeries();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/pets" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
          ← Volver a Mascotas
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">
          Historial Médico de {pet?.name}
        </h1>
        {pet && (
          <p className="text-gray-600 mt-1">
            {pet.species} • {pet.breed} • {pet.age} {pet.age === 1 ? 'año' : 'años'}
          </p>
        )}
      </div>

      {/* Alerta de alergias graves */}
      {allergies.some(a => a.severity === 'grave') && (
        <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <h3 className="font-bold text-red-800 text-lg">¡ALERTA! Alergias Graves</h3>
              <p className="text-red-700 text-sm mt-1">
                Esta mascota tiene alergias graves registradas. Revisar antes de cualquier tratamiento.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {allergies.filter(a => a.severity === 'grave').map((allergy, i) => (
                  <span key={i} className="px-3 py-1 bg-red-200 text-red-900 rounded-full text-sm font-medium">
                    {allergy.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow mb-6">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition whitespace-nowrap ${activeTab === 'timeline'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              🩺 Historial
            </button>
            <button
              onClick={() => setActiveTab('weight')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition whitespace-nowrap ${activeTab === 'weight'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              📊 Peso
            </button>
            <button
              onClick={() => setActiveTab('allergies')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition whitespace-nowrap ${activeTab === 'allergies'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              ⚠️ Alergias ({allergies.length})
            </button>
            <button
              onClick={() => setActiveTab('surgeries')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition whitespace-nowrap ${activeTab === 'surgeries'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              🏥 Cirugías ({surgeries.length})
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'timeline' && <MedicalTimeline records={records} />}
        {activeTab === 'weight' && <WeightChart records={records} />}
        {activeTab === 'allergies' && <AllergiesSection allergies={allergies} />}
        {activeTab === 'surgeries' && <SurgeriesSection surgeries={surgeries} />}
      </div>
    </div>
  );
};

export default MedicalHistory;