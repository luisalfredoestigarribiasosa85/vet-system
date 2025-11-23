import PropTypes from 'prop-types';
import { useState } from 'react';
import api from '../../api/axios';
import ImageUploader from './ImageUploader';
import ImageGallery from './ImageGallery';
import './ImageUploader.css';
import './ImageGallery.css';

const MedicalTimeline = ({ records }) => {
    const [expandedRecords, setExpandedRecords] = useState({});
    const [localRecords, setLocalRecords] = useState(records);
    const [downloading, setDownloading] = useState(null);

    const toggleExpand = (recordId) => {
        setExpandedRecords(prev => ({
            ...prev,
            [recordId]: !prev[recordId]
        }));
    };

    const handleUploadSuccess = (recordId, attachment) => {
        setLocalRecords(prevRecords =>
            prevRecords.map(record =>
                record.id === recordId
                    ? { ...record, attachments: [...(record.attachments || []), attachment] }
                    : record
            )
        );
    };

    const handleDeleteAttachment = (recordId, attachmentId) => {
        setLocalRecords(prevRecords =>
            prevRecords.map(record =>
                record.id === recordId
                    ? { ...record, attachments: (record.attachments || []).filter(a => a.id !== attachmentId) }
                    : record
            )
        );
    };

    const handleDownloadPrescription = async (recordId, petName) => {
        try {
            setDownloading(recordId);
            const response = await api.get(`/medical/records/${recordId}/prescription-pdf`, {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/pdf'
                }
            });

            // Verificar si la respuesta es un JSON (error) en lugar de un PDF
            if (response.data.type === 'application/json') {
                const text = await response.data.text();
                const error = JSON.parse(text);
                throw new Error(error.message || 'Error al generar el PDF');
            }

            // Crear URL del blob con tipo explícito
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Nombre del archivo seguro
            const safePetName = (petName || 'mascota').replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const dateStr = new Date().toISOString().split('T')[0];
            link.setAttribute('download', `receta_${safePetName}_${dateStr}.pdf`);

            document.body.appendChild(link);
            link.click();

            // Limpieza
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);

        } catch (error) {
            console.error('Error al descargar la receta:', error);
            alert('Error al descargar la receta: ' + (error.message || 'Intente nuevamente'));
        } finally {
            setDownloading(null);
        }
    };

    const sortedRecords = [...localRecords].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    const getEventIcon = (record) => {
        if (record.surgeries && record.surgeries.length > 0) return '🏥';
        if (record.vaccines && record.vaccines.length > 0) return '💉';
        return '🩺';
    };

    const getEventColor = (record) => {
        if (record.surgeries && record.surgeries.length > 0) return 'bg-red-500';
        if (record.vaccines && record.vaccines.length > 0) return 'bg-blue-500';
        return 'bg-green-500';
    };

    return (
        <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Historial Médico</h3>
            {sortedRecords.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay registros médicos</p>
            ) : (
                <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="space-y-6">
                        {sortedRecords.map((record) => (
                            <div key={record.id} className="relative pl-16">
                                <div className={`absolute left-3 w-6 h-6 rounded-full ${getEventColor(record)} flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                                    {getEventIcon(record)}
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                {new Date(record.createdAt).toLocaleDateString('es-PY', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                            {record.veterinarian && (
                                                <p className="text-xs text-gray-400">Dr. {record.veterinarian.name}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {record.treatment && (
                                                <button
                                                    onClick={() => handleDownloadPrescription(record.id, record.pet?.name || 'mascota')}
                                                    disabled={downloading === record.id}
                                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition flex items-center gap-1 disabled:opacity-50"
                                                >
                                                    {downloading === record.id ? '⏳' : '📄'} Receta
                                                </button>
                                            )}
                                            {record.weight && (
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
                                                    {record.weight} kg
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700">Diagnóstico:</p>
                                            <p className="text-sm text-gray-600">{record.diagnosis}</p>
                                        </div>
                                        {record.treatment && (
                                            <div>
                                                <p className="text-sm font-semibold text-gray-700">Tratamiento:</p>
                                                <p className="text-sm text-gray-600">{record.treatment}</p>
                                            </div>
                                        )}
                                        {record.temperature && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-700">Temperatura:</span>
                                                <span className="text-sm text-gray-600">{record.temperature}°C</span>
                                            </div>
                                        )}
                                        {record.notes && (
                                            <div>
                                                <p className="text-sm font-semibold text-gray-700">Notas:</p>
                                                <p className="text-sm text-gray-600 italic">{record.notes}</p>
                                            </div>
                                        )}
                                        {/* Galería de imágenes */}
                                        {record.attachments && record.attachments.length > 0 && (
                                            <div className="mt-3">
                                                <p className="text-sm font-semibold text-gray-700 mb-2">Archivos adjuntos:</p>
                                                <ImageGallery
                                                    attachments={record.attachments}
                                                    recordId={record.id}
                                                    onDelete={(attachmentId) => handleDeleteAttachment(record.id, attachmentId)}
                                                />
                                            </div>
                                        )}
                                        {/* Uploader de imágenes */}
                                        <div className="mt-3">
                                            <button
                                                onClick={() => toggleExpand(record.id)}
                                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                {expandedRecords[record.id] ? '➖ Ocultar subida de archivos' : '➕ Subir archivo'}
                                            </button>
                                            {expandedRecords[record.id] && (
                                                <ImageUploader
                                                    recordId={record.id}
                                                    onUploadSuccess={(attachment) => handleUploadSuccess(record.id, attachment)}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

MedicalTimeline.propTypes = {
    records: PropTypes.array.isRequired,
};

export default MedicalTimeline;