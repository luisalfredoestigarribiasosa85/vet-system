import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import portalApi from '../../api/portalApi';
import Loader from '../../components/common/Loader';

const PortalPetDetails = () => {
  const { petId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await portalApi.get(`/portal/pets/${petId}/records`);
        setData(res.data);
      } catch (error) {
        console.error('Error al cargar historial', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [petId]);

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!data) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 text-slate-500">
        No se encontro informacion de la mascota.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/portal/pets" className="text-sm text-blue-600 font-semibold">Regresar</Link>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-bold text-slate-800">{data.pet?.name}</h2>
        <p className="text-sm text-slate-500 mt-1">Historial clinico y atenciones registradas</p>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Registros medicos</h3>
        {data.records?.length === 0 ? (
          <p className="text-sm text-slate-500">Sin registros medicos disponibles.</p>
        ) : (
          <div className="space-y-4">
            {data.records.map((record) => (
              <div key={record.id} className="border border-slate-200 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className="text-base font-semibold text-slate-800">{record.diagnosis}</p>
                  <span className="text-xs text-slate-400">
                    {new Date(record.createdAt).toLocaleDateString()} - {record.veterinarian?.name || 'Veterinario no asignado'}
                  </span>
                </div>
                {record.treatment ? (
                  <p className="text-sm text-slate-600 mt-2">Tratamiento: {record.treatment}</p>
                ) : null}
                {record.notes ? (
                  <p className="text-sm text-slate-500 mt-2">Notas: {record.notes}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortalPetDetails;
