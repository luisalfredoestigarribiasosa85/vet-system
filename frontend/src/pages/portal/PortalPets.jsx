import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import portalApi from '../../api/portalApi';
import Loader from '../../components/common/Loader';
import usePortalAuth from '../../hooks/usePortalAuth';

const PortalPets = () => {
  const { profile } = usePortalAuth();
  const [pets, setPets] = useState(profile?.pets || []);
  const [loading, setLoading] = useState(!profile?.pets);

  useEffect(() => {
    if (!profile?.pets) {
      loadPets();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPets = async () => {
    setLoading(true);
    try {
      const res = await portalApi.get('/portal/pets');
      setPets(res.data || []);
    } catch (error) {
      console.error('Error al cargar mascotas', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Mis mascotas</h2>
      </div>

      {pets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-6 text-slate-500">
          Todavia no hay mascotas registradas en tu cuenta.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pets.map((pet) => (
            <Link
              to={`/portal/pets/${pet.id}`}
              key={pet.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-500 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-800">{pet.name}</p>
                  <p className="text-xs uppercase text-slate-400">{pet.species} {pet.breed ? `- ${pet.breed}` : ''}</p>
                </div>
                <span className="text-xs text-slate-400">Edad: {pet.age ? `${pet.age} anos` : 'N/D'}</span>
              </div>

              {pet.medicalRecords?.length ? (
                <div className="mt-4 text-xs text-slate-500">
                  Ultimos registros:
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {pet.medicalRecords.slice(0, 3).map((record) => (
                      <li key={record.id}>
                        {record.diagnosis} - {new Date(record.createdAt).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-4 text-xs text-slate-400">Sin registros medicos disponibles.</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PortalPets;
