import { db } from "../firebase";
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    deleteDoc,
    doc,
    getDoc
} from "firebase/firestore";

/**
 * Servicio para gestionar comentarios en la aplicación.
 * @backend.md: Implementado con enfoque en rendimiento y tiempo real.
 */
export const commentService = {
    /**
     * Añade un nuevo comentario
     */
    async addComment(bandId, parentId, parentType, author, text) {
        if (!text.trim()) throw new Error("El comentario no puede estar vacío");

        try {
            const commentsRef = collection(db, "bands", bandId, "messages");
            return await addDoc(commentsRef, {
                parentId,
                parentType,
                authorUid: author.uid, // Solo guardamos la referencia al UID
                text: text.trim(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error adding comment:", error);
            throw new Error("No se pudo guardar el comentario. Verifica tu conexión.");
        }
    },

    /**
     * Elimina un comentario
     */
    async deleteComment(bandId, commentId) {
        try {
            const commentRef = doc(db, "bands", bandId, "messages", commentId);
            return await deleteDoc(commentRef);
        } catch (error) {
            console.error("Error deleting comment:", error);
            throw new Error("No se pudo eliminar el comentario.");
        }
    },

    /**
     * Suscripción en tiempo real a comentarios de un elemento específico
     */
    subscribeToComments(bandId, parentId, callback) {
        const commentsRef = collection(db, "bands", bandId, "messages");
        const q = query(
            commentsRef,
            where("parentId", "==", parentId),
            orderBy("createdAt", "desc")
        );

        return onSnapshot(q, async (snapshot) => {
            const rawComments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Enriquecer con perfiles actuales (Join en cliente)
            const enrichedComments = await Promise.all(rawComments.map(async (c) => {
                const uid = c.authorUid || c.author?.uid; // Retrocompatibilidad
                if (uid) {
                    try {
                        const userSnap = await getDoc(doc(db, "users", uid));
                        if (userSnap.exists()) {
                            const ud = userSnap.data();
                            return {
                                ...c,
                                author: {
                                    uid,
                                    displayName: ud.nombre || ud.fullName || ud.displayName || 'Músico',
                                    photoURL: ud.photoURL || null
                                }
                            };
                        }
                    } catch (e) {
                        console.error("Error fetching commenter profile:", e);
                    }
                }
                return {
                    ...c,
                    author: c.author || { displayName: 'Desconocido', photoURL: null }
                };
            }));

            callback(enrichedComments);
        });
    }
};
