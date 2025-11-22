import PropTypes from 'prop-types';
import { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import './ImageGallery.css';

const ImageGallery = ({ attachments, recordId, onDelete }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [deleting, setDeleting] = useState(null);

    if (!attachments || attachments.length === 0) {
        return (
            <div className="no-images">
                <p>📎 No hay archivos adjuntos</p>
            </div>
        );
    }

    const handleDelete = async (attachmentId) => {
        if (!window.confirm('¿Estás seguro de eliminar este archivo?')) {
            return;
        }

        try {
            setDeleting(attachmentId);
            await api.delete(`/medical/records/${recordId}/attachments/${attachmentId}`);
            toast.success('Archivo eliminado');
            if (onDelete) {
                onDelete(attachmentId);
            }
        } catch (error) {
            console.error('Error al eliminar archivo:', error);
            toast.error('Error al eliminar archivo');
        } finally {
            setDeleting(null);
        }
    };

    const openLightbox = (attachment) => {
        if (attachment.type === 'image') {
            setSelectedImage(attachment);
        } else {
            // Abrir PDF en nueva pestaña
            window.open(`http://localhost:5000${attachment.url}`, '_blank');
        }
    };

    const closeLightbox = () => {
        setSelectedImage(null);
    };

    return (
        <>
            <div className="image-gallery">
                {attachments.map((attachment) => (
                    <div key={attachment.id} className="gallery-item">
                        {attachment.type === 'image' ? (
                            <div className="image-container" onClick={() => openLightbox(attachment)}>
                                <img
                                    src={`http://localhost:5000${attachment.url}`}
                                    alt={attachment.name}
                                    className="gallery-image"
                                />
                                <div className="image-overlay">
                                    <span className="view-text">👁️ Ver</span>
                                </div>
                            </div>
                        ) : (
                            <div className="pdf-container" onClick={() => openLightbox(attachment)}>
                                <div className="pdf-icon">📄</div>
                                <p className="pdf-name">{attachment.name}</p>
                            </div>
                        )}
                        <div className="gallery-actions">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(attachment.id);
                                }}
                                disabled={deleting === attachment.id}
                                className="delete-btn"
                            >
                                {deleting === attachment.id ? '⏳' : '🗑️'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {selectedImage && (
                <div className="lightbox" onClick={closeLightbox}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={closeLightbox}>
                            ✕
                        </button>
                        <img
                            src={`http://localhost:5000${selectedImage.url}`}
                            alt={selectedImage.name}
                            className="lightbox-image"
                        />
                        <p className="lightbox-caption">{selectedImage.name}</p>
                    </div>
                </div>
            )}
        </>
    );
};

ImageGallery.propTypes = {
    attachments: PropTypes.array,
    recordId: PropTypes.number.isRequired,
    onDelete: PropTypes.func
};

export default ImageGallery;
