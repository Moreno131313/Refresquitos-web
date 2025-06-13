# 🔄 Guía de Migración de Datos Firebase

## Resumen
Este script migra datos de la estructura `/users/{userEmail}/{collection}/` a la estructura `/{collection}/` con un campo `userId`.

## ⚠️ IMPORTANTE - LEE ANTES DE EJECUTAR

**🚨 ESTE SCRIPT MODIFICA TU BASE DE DATOS DE FIREBASE**
- Siempre prueba primero en un entorno de desarrollo
- Haz un backup de tu base de datos antes de ejecutar en producción
- Asegúrate de entender completamente lo que hace el script

## 📋 Pasos Detallados

### 1. Preparación del Entorno

#### Instalar Firebase Admin SDK
```bash
npm install firebase-admin
```

#### Obtener el archivo serviceAccountKey.json
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto "Refresquitos"
3. Ve a **Configuración del proyecto** (ícono de engranaje ⚙️)
4. Pestaña **"Cuentas de servicio"**
5. Asegúrate de que esté seleccionado **"Firebase Admin SDK"**
6. Haz clic en **"Generar nueva clave privada"**
7. Descarga el archivo JSON

### 2. Configuración del Script

#### Actualizar la ruta del archivo de credenciales
Edita el archivo `migrate_data.js` y cambia esta línea:

```javascript
// ANTES:
const serviceAccount = require('/ruta/absoluta/a/tu/serviceAccountKey.json');

// DESPUÉS (ejemplo para Windows):
const serviceAccount = require('D:/Users/TuUsuario/Documents/Refresquitos/serviceAccountKey.json');

// DESPUÉS (ejemplo para macOS/Linux):
const serviceAccount = require('/Users/TuUsuario/Documents/Refresquitos/serviceAccountKey.json');
```

**💡 Tip**: Usa la ruta ABSOLUTA completa al archivo

### 3. Prueba en Desarrollo (MUY IMPORTANTE)

#### Crear un proyecto de prueba
1. Crea un proyecto Firebase separado para pruebas
2. Copia algunos datos de muestra de tu proyecto principal
3. Ejecuta el script en este proyecto de prueba primero

#### Ejecutar la prueba
```bash
node migrate_data.js
```

#### Verificar los resultados
- Revisa que los datos se migraron correctamente
- Verifica que el campo `userId` se añadió a todos los documentos
- Confirma que no se perdieron datos

### 4. Backup de Producción

Antes de ejecutar en producción, haz un backup:

#### Opción 1: Exportar desde Firebase Console
1. Ve a Firebase Console → Firestore Database
2. Usa la función de exportación

#### Opción 2: Usar gcloud CLI
```bash
gcloud firestore export gs://tu-bucket-de-backup
```

### 5. Ejecución en Producción

#### Verificaciones previas
- [ ] ✅ Script probado en desarrollo
- [ ] ✅ Backup de producción realizado
- [ ] ✅ Ruta del serviceAccountKey.json actualizada
- [ ] ✅ Firebase Admin SDK instalado
- [ ] ✅ Permisos de administrador en Firebase

#### Ejecutar la migración
```bash
node migrate_data.js
```

#### Monitorear la ejecución
El script mostrará información como:
```
Iniciando proceso de migración...
  Procesando subcolecciones para usuario: usuario@ejemplo.com
    UID encontrado para usuario@ejemplo.com: abc123xyz
    Migrando subcolección: expenses
    Migración completada para subcolección expenses. Total documentos procesados: 25
    Migrando subcolección: ingresos
    Migración completada para subcolección ingresos. Total documentos procesados: 15
...
Proceso de migración finalizado.
¡Importante: Ahora debes actualizar tu código frontend y las reglas de seguridad de Firestore!
```

## 📊 Qué hace el Script

### Estructura ANTES de la migración:
```
/users/
  ├── usuario1@ejemplo.com/
  │   ├── expenses/
  │   │   ├── doc1 { amount: 100, description: "..." }
  │   │   └── doc2 { amount: 200, description: "..." }
  │   ├── ingresos/
  │   └── produccion/
  └── usuario2@ejemplo.com/
      ├── expenses/
      └── ingresos/
```

### Estructura DESPUÉS de la migración:
```
/expenses/
  ├── doc1 { amount: 100, description: "...", userId: "uid1" }
  ├── doc2 { amount: 200, description: "...", userId: "uid1" }
  └── doc3 { amount: 150, description: "...", userId: "uid2" }

/ingresos/
  ├── doc1 { amount: 500, description: "...", userId: "uid1" }
  └── doc2 { amount: 300, description: "...", userId: "uid2" }

/produccion/
  └── doc1 { quantity: 50, product: "...", userId: "uid1" }

/employeeCycles/
  └── doc1 { startDate: "...", endDate: "...", userId: "uid1" }
```

## 🔧 Solución de Problemas

### Error: "Cannot find module 'firebase-admin'"
**Solución**: Ejecuta `npm install firebase-admin`

### Error: "Cannot find module '/ruta/absoluta/a/tu/serviceAccountKey.json'"
**Solución**: Verifica que la ruta al archivo sea correcta y absoluta

### Error: "User not found"
**Solución**: Algunos usuarios en Firestore pueden no existir en Firebase Auth. El script los omitirá automáticamente.

### Error: "Permission denied"
**Solución**: Verifica que el archivo serviceAccountKey.json tenga permisos de administrador

## 📝 Después de la Migración

### 1. Actualizar el código frontend
Cambia todas las referencias de:
```javascript
// ANTES:
db.collection('users').doc(userEmail).collection('expenses')

// DESPUÉS:
db.collection('expenses').where('userId', '==', currentUser.uid)
```

### 2. Actualizar las reglas de Firestore
```javascript
// ANTES:
match /users/{userEmail}/{collection}/{document} {
  allow read, write: if request.auth != null && request.auth.token.email == userEmail;
}

// DESPUÉS:
match /{collection}/{document} {
  allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
}
```

### 3. Probar la aplicación
- Verifica que los usuarios puedan ver sus datos
- Confirma que no puedan ver datos de otros usuarios
- Prueba todas las funcionalidades principales

## 🚨 Notas de Seguridad

- **NUNCA** subas el archivo `serviceAccountKey.json` a GitHub
- Ejecuta el script desde un entorno seguro
- Elimina el archivo de credenciales después de la migración si no lo necesitas
- Considera rotar las claves después de la migración

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs del script para errores específicos
2. Verifica que todos los prerequisitos estén cumplidos
3. Prueba primero en un entorno de desarrollo
4. Haz backup antes de cualquier operación en producción 