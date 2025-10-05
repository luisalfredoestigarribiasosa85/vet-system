import { NavLink, Outlet } from 'react-router-dom';
import usePortalAuth from '../../hooks/usePortalAuth';

const links = [
  { to: '/portal', label: 'Inicio' },
  { to: '/portal/appointments', label: 'Mis citas' },
  { to: '/portal/pets', label: 'Mis mascotas' },
];

const PortalLayout = () => {
  const { user, logout } = usePortalAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Portal Cliente</p>
            <h1 className="text-2xl font-bold text-slate-800">VetSystem Care</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="text-right">
              <p className="font-semibold text-slate-800">{user?.name}</p>
              <p className="text-xs uppercase tracking-wide text-slate-400">Cliente</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
            >
              Cerrar sesion
            </button>
          </div>
        </div>
        <nav className="bg-slate-100">
          <div className="max-w-5xl mx-auto px-4 flex gap-4">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/portal'}
                className={({ isActive }) => `py-3 text-sm font-medium border-b-2 transition ${
                  isActive ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-blue-600'
                }`}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default PortalLayout;
