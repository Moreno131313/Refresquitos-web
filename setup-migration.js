// setup-migration.js
// Script de configuración para ayudar a configurar la ruta del serviceAccountKey.json

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupMigration() {
  console.log('🔧 Configuración del Script de Migración Firebase\n');
  
  console.log('Este script te ayudará a configurar la ruta correcta para tu archivo serviceAccountKey.json\n');
  
  // Preguntar por la ruta del archivo
  const keyPath = await askQuestion('Ingresa la ruta ABSOLUTA a tu archivo serviceAccountKey.json: ');
  
  // Verificar si el archivo existe
  if (!fs.existsSync(keyPath)) {
    console.log('❌ Error: El archivo no existe en la ruta especificada.');
    console.log('Asegúrate de que la ruta sea correcta y que el archivo exista.');
    rl.close();
    return;
  }
  
  // Verificar si es un archivo JSON válido
  try {
    const content = fs.readFileSync(keyPath, 'utf8');
    const parsed = JSON.parse(content);
    
    if (parsed.type !== 'service_account') {
      console.log('❌ Error: El archivo no parece ser una clave de cuenta de servicio válida.');
      rl.close();
      return;
    }
    
    console.log('✅ Archivo de credenciales válido encontrado.');
    console.log(`📋 Proyecto ID: ${parsed.project_id}`);
    console.log(`📧 Email de servicio: ${parsed.client_email}`);
    
  } catch (error) {
    console.log('❌ Error: El archivo no es un JSON válido o está corrupto.');
    rl.close();
    return;
  }
  
  // Leer el archivo de migración actual
  const migrationFilePath = path.join(__dirname, 'migrate_data.js');
  let migrationContent = fs.readFileSync(migrationFilePath, 'utf8');
  
  // Reemplazar la ruta del placeholder
  const oldLine = "const serviceAccount = require('/ruta/absoluta/a/tu/serviceAccountKey.json');";
  const newLine = `const serviceAccount = require('${keyPath.replace(/\\/g, '/')}');`;
  
  migrationContent = migrationContent.replace(oldLine, newLine);
  
  // Escribir el archivo actualizado
  fs.writeFileSync(migrationFilePath, migrationContent);
  
  console.log('\n✅ Configuración completada!');
  console.log('📁 El archivo migrate_data.js ha sido actualizado con la ruta correcta.');
  console.log('\n🚨 IMPORTANTE:');
  console.log('1. Asegúrate de probar el script primero en un entorno de desarrollo');
  console.log('2. Haz un backup de tu base de datos antes de ejecutar en producción');
  console.log('3. Instala las dependencias: npm install firebase-admin');
  console.log('\n▶️  Para ejecutar la migración: node migrate_data.js');
  
  rl.close();
}

setupMigration().catch(console.error); 