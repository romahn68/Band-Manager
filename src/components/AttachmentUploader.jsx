import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { uploadAttachment, deleteAttachment } from '../services/storageService';

const AttachmentUploader = ({ bandId, entityType, entityId, onUploadComplete, currentAttachments = [] }) => {
    const fileInputRef = useRef(null);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        setProgress(0);

        try {
            const timestamp = new Date().getTime();
            // Store under: bands/{bandId}/{entityType}/{entityId}/attachments/{timestamp_filename}
            const path = `bands/${bandId}/${entityType}/${entityId}/attachments/${timestamp}_${file.name}`;

            const result = await uploadAttachment(file, path, (p) => setProgress(p));
            // Trigger callback with the new file info
            if (onUploadComplete) {
                onUploadComplete([...currentAttachments, result]);
            }
        } catch (err) {
            console.error("Upload error:", err);
            setError(err.message || "Error al subir el archivo.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setProgress(0);
        }
    };

    const handleRemove = async (attachmentToRemove) => {
        if (!window.confirm("¿Seguro que deseas eliminar este archivo?")) return;

        try {
            await deleteAttachment(attachmentToRemove.path);
            if (onUploadComplete) {
                const filtered = currentAttachments.filter(a => a.path !== attachmentToRemove.path);
                onUploadComplete(filtered);
            }
        } catch (err) {
            console.error("Remove error:", err);
            setError("Error al eliminar el archivo.");
        }
    };

    return (
        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Archivos Adjuntos (Max 2MB, PDF/JPG)</h4>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                {currentAttachments.map((file, idx) => (
                    <div key={idx} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem', background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--glass-border)', borderRadius: '6px', fontSize: '0.8rem'
                    }}>
                        {file.type === 'application/pdf' ? <FileText size={16} color="#ef4444" /> : <ImageIcon size={16} color="#3b82f6" />}
                        <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'none', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {file.name}
                        </a>
                        <button onClick={() => handleRemove(file)} style={{ background: 'none', padding: '0.1rem', color: '#ef4444', marginLeft: '0.5rem' }}>
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf, image/jpeg, image/jpg"
                style={{ display: 'none' }}
            />

            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)',
                    fontSize: '0.85rem'
                }}
            >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                {uploading ? `Subiendo ${Math.round(progress)}%...` : 'Adjuntar Archivo'}
            </button>

            {error && (
                <div style={{ marginTop: '0.5rem', color: '#ef4444', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    ⚠️ {error}
                </div>
            )}
        </div>
    );
};

export default AttachmentUploader;
