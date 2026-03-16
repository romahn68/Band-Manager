import { initializeApp } from "firebase/app";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    doc, 
    writeBatch,
    deleteField
} from "firebase/firestore";
import dotenv from 'dotenv';

// Cargar variables de entorno si existe un archivo .env
dotenv.config();

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTIONS_TO_CLEAN = [
    { name: 'musicians', idFields: ['id', 'member_id'], personalFields: ['nombre', 'email', 'photoURL', 'fullName', 'apellido', 'perfil'] },
    { name: 'songs', idFields: ['id', 'song_id'] },
    { name: 'finances', idFields: ['id', 'finance_id'] },
    { name: 'gear', idFields: ['id', 'gear_id'] },
    { name: 'rehearsals', idFields: ['id', 'rehearsal_id'] },
    { name: 'gigs', idFields: ['id', 'gig_id'] }
];

async function migrate() {
    console.log("🚀 Iniciando migración de datos...");

    try {
        const bandsSnap = await getDocs(collection(db, "bands"));
        console.log(`Encontradas ${bandsSnap.size} bandas.`);

        for (const bandDoc of bandsSnap.docs) {
            const bandId = bandDoc.id;
            console.log(`\n--- Procesando banda: ${bandId} ---`);
            const batch = writeBatch(db);
            let bandOperations = 0;

            for (const config of COLLECTIONS_TO_CLEAN) {
                const subSnap = await getDocs(collection(db, "bands", bandId, config.name));
                console.log(`  > Limpiando ${config.name} (${subSnap.size} documentos)`);

                subSnap.docs.forEach(subDoc => {
                    const data = subDoc.data();
                    const updates = {};

                    // Marcar campos de ID para borrar
                    config.idFields.forEach(f => {
                        if (data[f] !== undefined) updates[f] = deleteField();
                    });

                    // Marcar campos personales para borrar (solo musicians)
                    if (config.personalFields) {
                        config.personalFields.forEach(f => {
                            if (data[f] !== undefined) updates[f] = deleteField();
                        });
                    }

                    if (Object.keys(updates).length > 0) {
                        batch.update(subDoc.ref, updates);
                        bandOperations++;
                    }
                });
            }

            if (bandOperations > 0) {
                console.log(`  📤 Ejecutando ${bandOperations} actualizaciones para la banda ${bandId}...`);
                await batch.commit();
                console.log(`  ✅ Banda ${bandId} migrada.`);
            } else {
                console.log(`  ℹ️ No se requirieron cambios para la banda ${bandId}.`);
            }
        }

        console.log("\n✨ Migración completada exitosamente.");
    } catch (error) {
        console.error("\n❌ Error durante la migración:", error);
    }
}

migrate();
