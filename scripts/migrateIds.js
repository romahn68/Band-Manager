/**
 * MIGRATION SCRIPT: Firestore ID Cleanup
 * Purpose: Removes the redundant 'id' field from documents in subcollections
 * where the 'id' field is identical to the document ID.
 * 
 * Usage: node scripts/migrateIds.js --project=YOUR_PROJECT_ID
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';

// Check for service account key
const SERVICE_ACCOUNT_PATH = './serviceAccountKey.json';

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error("Error: serviceAccountKey.json not found in the root directory.");
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

const collectionsToProcess = ['songs', 'gigs', 'gear', 'finances', 'rehearsals', 'musicians'];

async function cleanupIds() {
    console.log("Starting ID Cleanup Migration...");
    
    const bandsSnapshot = await db.collection('bands').get();
    let totalCleaned = 0;

    for (const bandDoc of bandsSnapshot.docs) {
        const bandId = bandDoc.id;
        console.log(`Processing Band: ${bandId} (${bandDoc.data().nombre || 'Unnamed'})`);

        for (const collName of collectionsToProcess) {
            const subcollRef = db.collection('bands').doc(bandId).collection(collName);
            const subcollSnapshot = await subcollRef.get();

            if (subcollSnapshot.empty) continue;

            const batch = db.batch();
            let batchCount = 0;

            subcollSnapshot.docs.forEach(doc => {
                const data = doc.data();
                // Check if 'id' field exists and matches document ID
                if (data.id === doc.id) {
                    batch.update(doc.ref, {
                        id: FieldValue.delete()
                    });
                    batchCount++;
                    totalCleaned++;
                }
            });

            if (batchCount > 0) {
                await batch.commit();
                console.log(`  - ${collName}: Removed ${batchCount} redundant IDs`);
            }
        }
    }

    console.log(`\nMigration Finished. Total fields removed: ${totalCleaned}`);
}

cleanupIds().catch(console.error);
