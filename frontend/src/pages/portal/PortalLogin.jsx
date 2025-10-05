import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import usePortalAuth from '../../hooks/usePortalAuth';

const PortalLogin = () => {
  const navigate = useNavigate();
  const { user, login } = usePortalAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to="/portal" replace />;
  }

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    const { success, message } = await login(form.email, form.password);
    setSubmitting(false);
    if (!success) {
      setError(message);
      return;
    }
    navigate('/portal');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white shadow-lg rounded-2xl max-w-md w-full p-8">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Portal Cliente</p>
          <h1 className="text-2xl font-bold text-slate-800">Ingresa a tu cuenta</h1>
          <p className="text-sm text-slate-500 mt-2">Consulta el estado de tus mascotas y agenda citas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            required
          />
          <Input
            label="Contrasena"
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Ingresando...' : 'Iniciar sesion'}
          </Button>
        </form>
        <Link to="/login" className="text-blue-600 font-semibold">
          Iniciar sesion como veterinario
        </Link>

        <p className="text-xs text-slate-500 text-center mt-6">
          Aun no tienes cuenta?{' '}
          <Link to="/portal/register" className="text-blue-600 font-semibold">
            Registrate aqui
          </Link>
        </p>
      </div>
    </div>
  );
};

export default PortalLogin;
