import PropTypes from 'prop-types';
import { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ImageUploader = ({ recordId, onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = async (files) => {
        const file = files[0];

        // Validar tipo de archivo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Solo se permiten imágenes (JPEG, PNG, GIF) y archivos PDF');
            return;
        }

        // Validar tamaño (10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('El archivo no debe superar los 10MB');
            return;
        }

        // Subir archivo
        await uploadFile(file);
    };

    const uploadFile = async (file) => {
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('image', file);

            const response = await api.post(`/medical/records/${recordId}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Imagen subida exitosamente');
            if (onUploadSuccess) {
                onUploadSuccess(response.data.attachment);
            }
        } catch (error) {
            console.error('Error al subir imagen:', error);
            toast.error(error.response?.data?.message || 'Error al subir imagen');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="image-uploader">
            <form
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`upload-zone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
            >
                <input
                    type="file"
                    id={`file-upload-${recordId}`}
                    accept="image/jpeg,image/jpg,image/png,image/gif,application/pdf"
                    onChange={handleChange}
                    disabled={uploading}
                    style={{ display: 'none' }}
                />
                <label htmlFor={`file-upload-${recordId}`} className="upload-label">
                    {uploading ? (
                        <>
                            <div className="spinner"></div>
                            <p>Subiendo archivo...</p>
                        </>
                    ) : (
                        <>
                            <svg className="upload-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="upload-text">
                                <span className="upload-highlight">Click para subir</span> o arrastra aquí
                            </p>
                            <p className="upload-hint">JPG, PNG, GIF o PDF (máx. 10MB)</p>
                        </>
                    )}
                </label>
            </form>
        </div>
    );
};

ImageUploader.propTypes = {
    recordId: PropTypes.number.isRequired,
    onUploadSuccess: PropTypes.func
};

export default ImageUploader;
