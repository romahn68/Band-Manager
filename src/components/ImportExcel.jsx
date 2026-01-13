import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, Loader2 } from 'lucide-react';
import { readExcel, mapImportedData } from '../services/excelService';

const ImportExcel = ({ onImport, mapping, label = 'Importar Excel' }) => {
    const fileRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const rawData = await readExcel(file);
            console.log('Raw Excel Data:', rawData);

            const mappedData = mapImportedData(rawData, mapping);
            console.log('Mapped Data:', mappedData);

            if (mappedData.length === 0) {
                setError('El archivo parece estar vacío o no tiene el formato correcto.');
                setLoading(false);
                return;
            }

            if (window.confirm(`¿Importar ${mappedData.length} registros detectados?`)) {
                await onImport(mappedData);
                // Clear input
                if (fileRef.current) fileRef.current.value = '';
            }
        } catch (err) {
            console.error('Import Error:', err);
            setError('Error al procesar el archivo. Asegúrate de que sea un archivo .xlsx válido.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'inline-block' }}>
            <input
                type="file"
                ref={fileRef}
                onChange={handleFileChange}
                accept=".xlsx, .xls, .csv"
                style={{ display: 'none' }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                    onClick={() => fileRef.current.click()}
                    disabled={loading}
                    className="glass"
                    style={{
                        padding: '0.75rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: '#60a5fa',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <FileSpreadsheet size={18} />
                    )}
                    {loading ? 'Procesando...' : label}
                </button>

                {error && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#ef4444', fontSize: '0.8rem' }}>
                        <AlertCircle size={14} /> {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImportExcel;
