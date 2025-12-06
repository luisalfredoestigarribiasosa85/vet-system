import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Users,
  PawPrint,
  Calendar,
  Stethoscope,
  Package,
  DollarSign,
  CreditCard,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/clients', icon: Users, label: 'Clientes' },
    { path: '/pets', icon: PawPrint, label: 'Mascotas' },
    { path: '/appointments', icon: Calendar, label: 'Citas' },
    { path: '/medical', icon: Stethoscope, label: 'Historial Médico' },
    { path: '/inventory', icon: Package, label: 'Inventario' },
    { path: '/invoices', icon: DollarSign, label: 'Facturación' },
    { path: '/payments', icon: DollarSign, label: 'Pagos' },
    { path: '/subscription', icon: CreditCard, label: 'Suscripción' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-blue-600 text-white p-2 rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        className={`
          fixed top-0 left-0 h-full bg-gradient-to-b from-blue-900 to-blue-800 text-white
          transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 w-64
        `}
      >
        <div className="flex flex-col h-full p-6 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold flex items-center">
              <Stethoscope className="mr-2" /> VetSystem
            </h1>
            <p className="text-sm text-blue-200 mt-1">Sistema de Gestión</p>
          </div>

          <div className="bg-blue-800 rounded-lg p-3 mb-6">
            <p className="text-xs text-blue-200">Usuario</p>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-xs text-blue-300 capitalize">{user?.role}</p>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center px-4 py-3 rounded-lg transition
                    ${isActive
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-800'
                    }
                  `}
                  onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                >
                  <Icon size={20} className="mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={logout}
            className="flex items-center px-4 py-3 text-blue-100 hover:bg-blue-800 rounded-lg transition mt-4"
          >
            <LogOut size={20} className="mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
