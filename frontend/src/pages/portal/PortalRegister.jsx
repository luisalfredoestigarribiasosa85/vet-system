import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import usePortalAuth from '../../hooks/usePortalAuth';

const PortalRegister = () => {
  const navigate = useNavigate();
  const { user, register } = usePortalAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
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
    const { success, message } = await register(form);
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
          <h1 className="text-2xl font-bold text-slate-800">Crear cuenta</h1>
          <p className="text-sm text-slate-500 mt-2">Registrate para gestionar tus mascotas y citas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre completo"
            value={form.name}
            onChange={handleChange('name')}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            required
          />
          <Input
            label="Telefono"
            value={form.phone}
            onChange={handleChange('phone')}
          />
          <Input
            label="Contrasena"
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            minLength={6}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Creando...' : 'Crear cuenta'}
          </Button>
        </form>

        <p className="text-xs text-slate-500 text-center mt-6">
          Ya tienes cuenta?{' '}
          <Link to="/portal/login" className="text-blue-600 font-semibold">
            Ingresa aqui
          </Link>
        </p>
      </div>
    </div>
  );
};

export default PortalRegister;
