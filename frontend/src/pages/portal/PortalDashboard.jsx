import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import usePortalAuth from '../../hooks/usePortalAuth';

const PortalDashboard = () => {
  const { profile, loading, refreshProfile } = usePortalAuth();

  useEffect(() => {
    if (!profile && !loading) {
      refreshProfile();
    }
  }, [profile, loading, refreshProfile]);

  if (loading && !profile) {
    return <Loader fullScreen />;
  }

  const upcoming = useMemo(() => {
    if (!profile?.appointments) return null;
    return profile.appointments
      .filter((appointment) => appointment.status !== 'cancelada')
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))[0];
  }, [profile]);

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl shadow p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Hola, {profile?.client?.name}</h2>
            <p className="text-sm text-slate-500">Bienvenido a tu portal personal de seguimiento</p>
          </div>
          <Link
            to="/portal/appointments"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium shadow hover:bg-blue-700 transition"
          >
            Gestionar citas
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs uppercase text-slate-400">Mascotas activas</p>
            <p className="text-2xl font-bold text-slate-800">{profile?.pets?.length || 0}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs uppercase text-slate-400">Citas programadas</p>
            <p className="text-2xl font-bold text-slate-800">{profile?.appointments?.length || 0}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs uppercase text-slate-400">Proxima cita</p>
            {upcoming ? (
              <div>
                <p className="text-base font-semibold text-slate-800">{upcoming.date}</p>
                <p className="text-sm text-slate-500">{upcoming.time?.slice(0, 5)} - {upcoming.pet?.name}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Sin citas futuras</p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Mascotas</h3>
          <Link to="/portal/pets" className="text-sm text-blue-600 font-semibold">Ver todas</Link>
        </div>

        {profile?.pets?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.pets.map((pet) => (
              <Link
                to={`/portal/pets/${pet.id}`}
                key={pet.id}
                className="border border-slate-200 rounded-xl p-4 hover:border-blue-500 transition"
              >
                <p className="text-base font-semibold text-slate-800">{pet.name}</p>
                <p className="text-xs text-slate-500 uppercase">{pet.species} {pet.breed ? `- ${pet.breed}` : ''}</p>
                {pet.age ? <p className="text-xs text-slate-400 mt-2">Edad: {pet.age} anos</p> : null}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Agrega a tu primera mascota desde la clinica para ver su informacion aqui.</p>
        )}
      </section>
    </div>
  );
};

export default PortalDashboard;
