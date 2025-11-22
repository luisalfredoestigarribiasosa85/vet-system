import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import portalApi from '../../api/portalApi';
import Loader from '../../components/common/Loader';

const PortalPetDetails = () => {
  const { petId } = useParams();
  const [data, setData] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('records'); // 'records' or 'vaccinations'

  useEffect(() => {
    loadData();
  }, [petId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recordsRes, vaccinationsRes] = await Promise.all([
        portalApi.get(`/portal/pets/${petId}/records`),
        portalApi.get(`/portal/pets/${petId}/vaccinations`),
      ]);
      setData(recordsRes.data);
      setVaccinations(vaccinationsRes.data.vaccinations || []);
    } catch (error) {
      console.error('Error al cargar datos', error);
    } finally {
      setLoading(false);
    }
  };

  const getVaccinationStatusColor = (status) => {
    switch (status) {
      case 'aplicada':
        return 'bg-green-100 text-green-800';
      case 'próxima':
        return 'bg-orange-100 text-orange-800';
      case 'vencida':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVaccinationTypeColor = (type) => {
    switch (type) {
      case 'obligatoria':
        return 'bg-blue-100 text-blue-800';
      case 'opcional':
        return 'bg-purple-100 text-purple-800';
      case 'refuerzo':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!data) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 text-slate-500">
        No se encontró información de la mascota.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/portal/pets" className="text-sm text-blue-600 font-semibold">
        ← Regresar
      </Link>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-bold text-slate-800">{data.pet?.name}</h2>
        <p className="text-sm text-slate-500 mt-1">
          {data.pet?.species} {data.pet?.breed ? `• ${data.pet.breed}` : ''}
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow">
        <div className="border-b border-slate-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('records')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition ${activeTab === 'records'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              📋 Historial Médico
            </button>
            <button
              onClick={() => setActiveTab('vaccinations')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition ${activeTab === 'vaccinations'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              💉 Vacunas ({vaccinations.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'records' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Registros médicos
              </h3>
              {data.records?.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Sin registros médicos disponibles.
                </p>
              ) : (
                <div className="space-y-4">
                  {data.records.map((record) => (
                    <div
                      key={record.id}
                      className="border border-slate-200 rounded-xl p-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <p className="text-base font-semibold text-slate-800">
                          {record.diagnosis}
                        </p>
                        <span className="text-xs text-slate-400">
                          {new Date(record.createdAt).toLocaleDateString()} -{' '}
                          {record.veterinarian?.name || 'Veterinario no asignado'}
                        </span>
                      </div>
                      {record.treatment && (
                        <p className="text-sm text-slate-600 mt-2">
                          Tratamiento: {record.treatment}
                        </p>
                      )}
                      {record.notes && (
                        <p className="text-sm text-slate-500 mt-2">
                          Notas: {record.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'vaccinations' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Historial de vacunación
              </h3>
              {vaccinations.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Sin vacunas registradas.
                </p>
              ) : (
                <div className="space-y-4">
                  {vaccinations.map((vaccination) => (
                    <div
                      key={vaccination.id}
                      className="border border-slate-200 rounded-xl p-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-semibold text-slate-800">
                              {vaccination.vaccineName}
                            </h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getVaccinationStatusColor(
                                vaccination.status
                              )}`}
                            >
                              {vaccination.status === 'aplicada'
                                ? 'Aplicada'
                                : vaccination.status === 'próxima'
                                  ? 'Próxima'
                                  : 'Vencida'}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getVaccinationTypeColor(
                                vaccination.vaccineType
                              )}`}
                            >
                              {vaccination.vaccineType === 'obligatoria'
                                ? 'Obligatoria'
                                : vaccination.vaccineType === 'opcional'
                                  ? 'Opcional'
                                  : 'Refuerzo'}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1 text-sm text-slate-600">
                            <p>
                              <span className="font-medium">Aplicada:</span>{' '}
                              {new Date(
                                vaccination.applicationDate
                              ).toLocaleDateString('es-PY')}
                            </p>
                            {vaccination.nextDoseDate && (
                              <p>
                                <span className="font-medium">Próxima dosis:</span>{' '}
                                {new Date(
                                  vaccination.nextDoseDate
                                ).toLocaleDateString('es-PY')}
                              </p>
                            )}
                            {vaccination.veterinarian && (
                              <p>
                                <span className="font-medium">Veterinario:</span>{' '}
                                {vaccination.veterinarian.name}
                              </p>
                            )}
                            {vaccination.batchNumber && (
                              <p className="text-xs text-slate-400">
                                Lote: {vaccination.batchNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortalPetDetails;
