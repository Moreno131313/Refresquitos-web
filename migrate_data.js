// migrate_data.js
// Este script migra datos de la estructura /users/{userEmail}/{collection}/
// a la estructura /{collection}/ con un campo userId.

const admin = require('firebase-admin');

// Reemplaza esta ruta con la ruta ABSOLUTA a tu archivo serviceAccountKey.json
// en el entorno donde ejecutas este script.
const serviceAccount = require('/ruta/absoluta/a/tu/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Lista de subcolecciones a migrar bajo cada documento de usuario
const collectionsToMigrate = ['expenses', 'ingresos', 'produccion', 'employeeCycles'];

async function migrateUserCollection(userDocRef) {
  const userEmail = userDocRef.id; // El ID del documento de usuario es el correo electrónico

  console.log(`  Procesando subcolecciones para usuario: ${userEmail}`);

  let userId = null;
  try {
    // Obtener el UID del usuario de Firebase Auth usando el correo electrónico
    const userRecord = await admin.auth().getUserByEmail(userEmail);
    userId = userRecord.uid;
    console.log(`    UID encontrado para ${userEmail}: ${userId}`);
  } catch (error) {
    console.error(`    Error al obtener UID para ${userEmail}:`, error);
    return; // Si no podemos obtener el UID, no podemos migrar sus datos.
  }

  for (const collectionName of collectionsToMigrate) {
    console.log(`    Migrando subcolección: ${collectionName}`);

    const oldCollectionRef = userDocRef.collection(collectionName);
    const snapshot = await oldCollectionRef.get();

    if (snapshot.empty) {
      console.log('      No documents in this subcollection.');
      continue;
    }

    const batch = db.batch();
    let updateCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Crear una referencia al nuevo documento en la colección principal
      const newDocRef = db.collection(collectionName).doc(doc.id);

      // Añadir el campo userId y copiar los datos existentes
      const newData = { ...data, userId: userId };

      // Usar set con merge: true si quieres asegurarte de no sobrescribir
      // completamente documentos existentes si ya tuvieran un campo userId (poco probable en este caso)
      // o simplemente set para crear o sobrescribir si no hay userId
      batch.set(newDocRef, newData);

      updateCount++;

      // Comitear batches periódicamente para evitar exceder el límite de 500 operaciones
      if (updateCount % 400 === 0) { // Comitear cada 400 operaciones (para dejar margen)
          await batch.commit();
          batch = db.batch(); // Empezar un nuevo batch
          console.log(`      Comiteado un batch para ${collectionName}. Documentos procesados en este batch: ${updateCount % 400}`);
      }
    }

    // Comitear cualquier operación restante en el batch final
    if (updateCount > 0) {
       await batch.commit();
       console.log(`    Migración completada para subcolección ${collectionName}. Total documentos procesados: ${updateCount}`);
    } else {
       console.log(`    No documents to process in subcollection ${collectionName}.`);
    }
  }
}

async function startMigration() {
    console.log('Iniciando proceso de migración...');

    const usersSnapshot = await db.collection('users').get();

    if (usersSnapshot.empty) {
        console.log('No users to migrate.');
        return;
    }

    for (const userDoc of usersSnapshot.docs) {
        await migrateUserCollection(userDoc.ref);
    }

    console.log('Proceso de migración finalizado.');
    console.log('¡Importante: Ahora debes actualizar tu código frontend y las reglas de seguridad de Firestore!');
}

startMigration().catch(console.error); 