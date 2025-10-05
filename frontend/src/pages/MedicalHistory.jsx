import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios'; // Asumo que tienes un 'axios.js' configurado
import { AuthContext } from '../contexts/AuthContext'; // Asumo un AuthContext para el token
import Loader from '../components/common/Loader';

const MedicalHistory = () => {
  const { petId } = useParams();
  const { auth } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [petName, setPetName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // Asumo que la info de la mascota se puede obtener de una ruta como /pets/:petId
        // Esto es para obtener el nombre de la mascota para el título
        const petRes = await api.get(`/pets/${petId}`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        setPetName(petRes.data.name);

        // Obtener el historial médico
        const historyRes = await api.get(`/medical/pets/${petId}/records`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        setRecords(historyRes.data);
        setError(null);
      } catch (err) {
        setError('Error al cargar el historial médico. ' + (err.response?.data?.message || err.message));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (petId && auth.token) {
      fetchHistory();
    }
  }, [petId, auth.token]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Historial Médico de {petName}</h1>
      <div className="space-y-4">
        {records.length > 0 ? (
          records.map(record => (
            <div key={record.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800">Visita del {new Date(record.createdAt).toLocaleDateString()}</h2>
                {record.veterinarian && <span className="text-sm text-gray-500">Atendido por: {record.veterinarian.name}</span>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong className="font-medium text-gray-600">Diagnóstico:</strong> {record.diagnosis}</p>
                  <p><strong className="font-medium text-gray-600">Tratamiento:</strong> {record.treatment}</p>
                </div>
                <div>
                  <p><strong className="font-medium text-gray-600">Peso:</strong> {record.weight || 'N/A'} kg</p>
                  <p><strong className="font-medium text-gray-600">Temperatura:</strong> {record.temperature || 'N/A'} °C</p>
                </div>
              </div>
              {record.notes && (
                <div className="mt-2">
                  <p><strong className="font-medium text-gray-600">Notas:</strong> {record.notes}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p>No se encontraron registros médicos para esta mascota.</p>
          </div>
        )}
      </div>
      <div className="mt-6">
        <Link to="/clients" className="text-blue-500 hover:underline">
          &larr; Volver a Clientes
        </Link>
      </div>
    </div>
  );
};

export default MedicalHistory;