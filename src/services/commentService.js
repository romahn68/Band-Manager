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
    doc
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

        const commentsRef = collection(db, "bands", bandId, "comments");
        return await addDoc(commentsRef, {
            parentId,
            parentType,
            author: {
                uid: author.uid,
                displayName: author.displayName || 'Músico',
                photoURL: author.photoURL || null
            },
            text: text.trim(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    },

    /**
     * Elimina un comentario
     */
    async deleteComment(bandId, commentId) {
        const commentRef = doc(db, "bands", bandId, "comments", commentId);
        return await deleteDoc(commentRef);
    },

    /**
     * Suscripción en tiempo real a comentarios de un elemento específico
     */
    subscribeToComments(bandId, parentId, callback) {
        const commentsRef = collection(db, "bands", bandId, "comments");
        const q = query(
            commentsRef,
            where("parentId", "==", parentId),
            orderBy("createdAt", "desc")
        );

        return onSnapshot(q, (snapshot) => {
            const comments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(comments);
        });
    }
};
