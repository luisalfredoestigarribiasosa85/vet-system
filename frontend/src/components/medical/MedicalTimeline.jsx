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
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-5 sm:mb-6 pb-3 border-b border-gray-200">Historial Médico</h3>
            {sortedRecords.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay registros médicos</p>
            ) : (
                <div className="relative">
                    <div className="absolute left-6 sm:left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 via-gray-200 to-gray-300"></div>
                    <div className="space-y-6 sm:space-y-6">
                        {sortedRecords.map((record) => (
                            <div key={record.id} className="relative pl-16 sm:pl-20">
                                <div className={`absolute left-4 sm:left-5 w-10 h-10 sm:w-12 sm:h-12 rounded-full ${getEventColor(record)} flex items-center justify-center text-white shadow-lg border-4 border-white z-10`}>
                                    <span className="text-base sm:text-lg">{getEventIcon(record)}</span>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-lg transition-all">
                                    {/* Header con fecha y veterinario */}
                                    <div className="mb-4 pb-3 border-b border-gray-100">
                                        <p className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                                            {new Date(record.createdAt).toLocaleDateString('es-PY', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                        {record.veterinarian && (
                                            <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2">
                                                <span className="text-lg">👨‍⚕️</span>
                                                <span>Dr. {record.veterinarian.name}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Botones de acción y peso - Mejor organizados */}
                                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                                        {record.treatment && (
                                            <button
                                                onClick={() => handleDownloadPrescription(record.id, record.pet?.name || 'mascota')}
                                                disabled={downloading === record.id}
                                                className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                                            >
                                                <span className="text-lg">{downloading === record.id ? '⏳' : '📄'}</span>
                                                <span>{downloading === record.id ? 'Descargando...' : 'Descargar Receta'}</span>
                                            </button>
                                        )}
                                        {record.weight && (
                                            <div className="w-full sm:w-auto px-4 py-2.5 bg-green-100 text-green-800 text-sm sm:text-base font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm border border-green-200">
                                                <span className="text-lg">⚖️</span>
                                                <span>{record.weight} kg</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Contenido médico */}
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm sm:text-base font-bold text-gray-800 mb-2">Diagnóstico:</p>
                                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">{record.diagnosis}</p>
                                        </div>
                                        {record.treatment && (
                                            <div>
                                                <p className="text-sm sm:text-base font-bold text-gray-800 mb-2">Tratamiento:</p>
                                                <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap bg-blue-50 p-3 rounded-lg">{record.treatment}</p>
                                            </div>
                                        )}
                                        {record.temperature && (
                                            <div className="flex items-center justify-between gap-3 bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
                                                <span className="text-sm sm:text-base font-semibold text-gray-700 flex items-center gap-2">
                                                    <span className="text-lg">🌡️</span>
                                                    <span>Temperatura:</span>
                                                </span>
                                                <span className="text-base sm:text-lg text-gray-800 font-bold">{record.temperature}°C</span>
                                            </div>
                                        )}
                                        {record.notes && (
                                            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-400">
                                                <p className="text-sm sm:text-base font-bold text-gray-800 mb-2 flex items-center gap-2">
                                                    <span>📝</span>
                                                    <span>Notas:</span>
                                                </p>
                                                <p className="text-sm sm:text-base text-gray-700 italic leading-relaxed">{record.notes}</p>
                                            </div>
                                        )}
                                        {/* Galería de imágenes */}
                                        {record.attachments && record.attachments.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <p className="text-sm sm:text-base font-bold text-gray-800 mb-3">Archivos adjuntos:</p>
                                                <ImageGallery
                                                    attachments={record.attachments}
                                                    recordId={record.id}
                                                    onDelete={(attachmentId) => handleDeleteAttachment(record.id, attachmentId)}
                                                />
                                            </div>
                                        )}
                                        {/* Uploader de imágenes */}
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <button
                                                onClick={() => toggleExpand(record.id)}
                                                className="w-full sm:w-auto text-sm sm:text-base text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50 transition"
                                            >
                                                <span className="text-lg">{expandedRecords[record.id] ? '➖' : '➕'}</span>
                                                <span>{expandedRecords[record.id] ? 'Ocultar subida de archivos' : 'Subir archivo'}</span>
                                            </button>
                                            {expandedRecords[record.id] && (
                                                <div className="mt-4">
                                                    <ImageUploader
                                                        recordId={record.id}
                                                        onUploadSuccess={(attachment) => handleUploadSuccess(record.id, attachment)}
                                                    />
                                                </div>
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