import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg'];

/**
 * Sube un archivo a Firebase Storage con restricciones de tamaño (2MB) y formato.
 * @param {File} file - El archivo a subir
 * @param {string} path - Ruta en Storage (ej: 'bands/{bandId}/rehearsals/{id}/{filename}')
 * @param {function} onProgress - Callback de progreso (0 a 100)
 * @returns {Promise<string>} Download URL del archivo subido
 */
export const uploadAttachment = (file, path, onProgress) => {
    return new Promise((resolve, reject) => {
        if (!file) return reject(new Error("No file provided"));

        if (!ALLOWED_TYPES.includes(file.type)) {
            return reject(new Error("Formato no soportado. Solo se admiten PDFs y JPGs."));
        }

        if (file.size > MAX_FILE_SIZE) {
            return reject(new Error("El archivo excede el límite de 2MB."));
        }

        try {
            const storageRef = ref(storage, path);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (onProgress) onProgress(progress);
                },
                (error) => {
                    console.error("Upload error:", error);
                    reject(new Error("Error al subir el archivo. Revisa tu conexión."));
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve({
                            url: downloadURL,
                            name: file.name,
                            type: file.type,
                            path: storageRef.fullPath
                        });
                    } catch (urlErr) {
                        console.error("Error getting download URL:", urlErr);
                        reject(new Error("No se pudo obtener la URL de descarga."));
                    }
                }
            );
        } catch (error) {
            console.error("Storage init error:", error);
            reject(new Error("Error al iniciar la subida."));
        }
    });
};

/**
 * Elimina un archivo de Firebase Storage
 * @param {string} fullPath - Ruta completa del archivo en el storage
 */
export const deleteAttachment = async (fullPath) => {
    try {
        const storageRef = ref(storage, fullPath);
        await deleteObject(storageRef);
    } catch (error) {
        console.error("Error deleting attachment:", error);
        throw error;
    }
};
