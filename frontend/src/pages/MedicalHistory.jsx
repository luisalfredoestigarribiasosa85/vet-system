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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-5 sm:mb-6">
          <Link to="/pets" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs sm:text-sm mb-3 font-medium transition">
            <span>←</span>
            <span>Volver a Mascotas</span>
          </Link>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Historial Médico
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base text-gray-600">
              <span className="font-semibold text-gray-800">{pet?.name}</span>
              {pet && (
                <>
                  <span className="text-gray-400">•</span>
                  <span>{pet.species}</span>
                  {pet.breed && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span>{pet.breed}</span>
                    </>
                  )}
                  <span className="text-gray-400">•</span>
                  <span>{pet.age} {pet.age === 1 ? 'año' : 'años'}</span>
                </>
              )}
            </div>
          </div>
        </div>

      {/* Alerta de alergias graves */}
      {allergies.some(a => a.severity === 'grave') && (
        <div className="mb-4 sm:mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl flex-shrink-0">🚨</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-red-800 text-base sm:text-lg">¡ALERTA! Alergias Graves</h3>
              <p className="text-red-700 text-xs sm:text-sm mt-1">
                Esta mascota tiene alergias graves registradas. Revisar antes de cualquier tratamiento.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {allergies.filter(a => a.severity === 'grave').map((allergy, i) => (
                  <span key={i} className="px-2 sm:px-3 py-1 bg-red-200 text-red-900 rounded-full text-xs sm:text-sm font-medium">
                    {allergy.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs - Mobile: Grid, Desktop: Horizontal */}
      <div className="mb-4 sm:mb-6">
        {/* Mobile: Grid layout */}
        <div className="grid grid-cols-2 gap-2 sm:hidden">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'timeline'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="text-lg mb-1">🩺</div>
            <div className="text-xs font-semibold">Historial</div>
          </button>
          <button
            onClick={() => setActiveTab('weight')}
            className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'weight'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="text-lg mb-1">📊</div>
            <div className="text-xs font-semibold">Peso</div>
          </button>
          <button
            onClick={() => setActiveTab('allergies')}
            className={`px-4 py-3 rounded-lg font-medium text-sm transition-all relative ${
              activeTab === 'allergies'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="text-lg mb-1">⚠️</div>
            <div className="text-xs font-semibold">Alergias</div>
            {allergies.length > 0 && (
              <span className={`absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === 'allergies' ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-700'
              }`}>
                {allergies.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('surgeries')}
            className={`px-4 py-3 rounded-lg font-medium text-sm transition-all relative ${
              activeTab === 'surgeries'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="text-lg mb-1">🏥</div>
            <div className="text-xs font-semibold">Cirugías</div>
            {surgeries.length > 0 && (
              <span className={`absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === 'surgeries' ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-700'
              }`}>
                {surgeries.length}
              </span>
            )}
          </button>
        </div>

        {/* Desktop: Horizontal tabs */}
        <div className="hidden sm:block bg-white rounded-xl shadow">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition whitespace-nowrap ${
                  activeTab === 'timeline'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                🩺 Historial
              </button>
              <button
                onClick={() => setActiveTab('weight')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition whitespace-nowrap ${
                  activeTab === 'weight'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📊 Peso
              </button>
              <button
                onClick={() => setActiveTab('allergies')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition whitespace-nowrap ${
                  activeTab === 'allergies'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                ⚠️ Alergias {allergies.length > 0 && <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{allergies.length}</span>}
              </button>
              <button
                onClick={() => setActiveTab('surgeries')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition whitespace-nowrap ${
                  activeTab === 'surgeries'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                🏥 Cirugías {surgeries.length > 0 && <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{surgeries.length}</span>}
              </button>
            </div>
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
    </div>
  );
};

export default MedicalHistory;