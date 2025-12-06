import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, CheckCircle, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    subdomain: '',
    description: '',
    plan: 'free'
  });

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 'Gs. 0',
      description: 'Plan gratuito para comenzar',
      features: [
        'Hasta 10 clientes',
        'Hasta 25 mascotas',
        'Facturación básica',
        'Soporte por email'
      ]
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 'Gs. 50.000/mes',
      description: 'Para clínicas pequeñas',
      features: [
        'Hasta 3 usuarios',
        'Hasta 100 clientes',
        'Hasta 200 mascotas',
        'Reportes avanzados',
        'Soporte por teléfono'
      ],
      popular: true
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 'Gs. 150.000/mes',
      description: 'Para clínicas en crecimiento',
      features: [
        'Hasta 10 usuarios',
        'Hasta 500 clientes',
        'Hasta 1000 mascotas',
        'API access',
        'Soporte prioritario'
      ]
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Generar subdominio automáticamente basado en el nombre
    if (field === 'organizationName' && !formData.subdomain) {
      const subdomain = value
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, subdomain }));
    }
  };

  const handleCreateOrganization = async () => {
    if (!formData.organizationName || !formData.subdomain) {
      toast.error('Nombre de organización y subdominio son requeridos');
      return;
    }

    setLoading(true);
    try {
      await api.post('/organizations', {
        name: formData.organizationName,
        subdomain: formData.subdomain,
        description: formData.description
      });

      toast.success('¡Organización creada exitosamente!');
      navigate('/dashboard');

    } catch (error) {
      console.error('Error:', error);
      toast.error(error?.response?.data?.message || 'Error al crear organización');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-center mb-4">
            <Building size={48} />
          </div>
          <h1 className="text-2xl font-bold text-center">Bienvenido a VetSystem</h1>
          <p className="text-blue-100 text-center mt-2">
            Configuremos tu clínica veterinaria en pocos pasos
          </p>
        </div>

        {/* Progress */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= stepNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > stepNumber ? <CheckCircle size={16} /> : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {step === 1 && 'Información de tu Clínica'}
              {step === 2 && 'Elige tu Plan'}
              {step === 3 && '¡Listo para Empezar!'}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Clínica *
                </label>
                <input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => handleInputChange('organizationName', e.target.value)}
                  placeholder="Ej: Clínica Veterinaria San Roque"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subdominio *
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={formData.subdomain}
                    onChange={(e) => handleInputChange('subdomain', e.target.value)}
                    placeholder="clinica-san-roque"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
                    .vet-system.com
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Esta será la URL de tu clínica
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (Opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe brevemente tu clínica..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-gray-600 text-center mb-6">
                Elige el plan que mejor se adapte a tus necesidades
              </p>

              <div className="grid gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      formData.plan === plan.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${plan.popular ? 'ring-2 ring-blue-200' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, plan: plan.id }))}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Más Popular
                        </span>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{plan.name}</h3>
                        <p className="text-gray-600 text-sm">{plan.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800">{plan.price}</div>
                        {plan.id !== 'free' && (
                          <div className="text-sm text-gray-500">por mes</div>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 flex items-center">
                      <input
                        type="radio"
                        id={plan.id}
                        name="plan"
                        value={plan.id}
                        checked={formData.plan === plan.id}
                        onChange={() => setFormData(prev => ({ ...prev, plan: plan.id }))}
                        className="mr-2"
                      />
                      <label htmlFor={plan.id} className="text-sm font-medium cursor-pointer">
                        Seleccionar {plan.name}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  ¡Todo listo para comenzar!
                </h3>
                <p className="text-gray-600">
                  Tu clínica <strong>{formData.organizationName}</strong> será creada con el plan{' '}
                  <strong>{plans.find(p => p.id === formData.plan)?.name}</strong>.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Próximos pasos:</h4>
                <ul className="text-sm text-blue-700 space-y-1 text-left">
                  <li>• Configura los usuarios de tu equipo</li>
                  <li>• Agrega tus primeros clientes y mascotas</li>
                  <li>• Personaliza la información de tu clínica</li>
                  <li>• Comienza a gestionar citas y tratamientos</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex justify-between">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Anterior
            </button>
          )}

          <div className="flex-1" />

          {step < 3 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Siguiente
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleCreateOrganization}
              disabled={loading}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Creando...' : '¡Comenzar!'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
