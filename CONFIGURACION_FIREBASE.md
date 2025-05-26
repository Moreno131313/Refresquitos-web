# 🔥 Configuración de Firebase para Refresquitos

## 📋 Pasos para Configurar Firebase

### 1. **Crear Proyecto en Firebase**
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto"
3. Nombre del proyecto: `refresquitos-manager`
4. Habilita Google Analytics (opcional)
5. Crea el proyecto

### 2. **Configurar Firestore Database**
1. En el panel izquierdo, ve a "Firestore Database"
2. Haz clic en "Crear base de datos"
3. Selecciona "Comenzar en modo de prueba" (por ahora)
4. Elige la ubicación más cercana (ej: `southamerica-east1`)

### 3. **Obtener Configuración Web**
1. En "Configuración del proyecto" (ícono de engranaje)
2. Ve a la pestaña "General"
3. En "Tus aplicaciones", haz clic en "Web" (`</>`)
4. Registra la aplicación con nombre: `refresquitos-web`
5. Copia la configuración que aparece

### 4. **Variables de Entorno**

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id

# Credenciales de acceso (existentes)
NEXT_PUBLIC_ADMIN_EMAIL=refresquitos@gmail.com
NEXT_PUBLIC_ADMIN_PASSWORD=Moreno123@$#
```

### 5. **Configurar en Vercel**

En el dashboard de Vercel:
1. Ve a tu proyecto "refresquitos-web"
2. Settings → Environment Variables
3. Agrega cada variable de Firebase:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

### 6. **Reglas de Seguridad de Firestore**

En Firebase Console → Firestore Database → Reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acceso a datos de usuarios autenticados
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🔄 **Migración de Datos**

Una vez configurado Firebase:

1. **Automática**: La aplicación detectará datos locales y ofrecerá migrarlos
2. **Manual**: Usa el componente de migración en la interfaz
3. **Sincronización**: Los datos se sincronizarán en tiempo real entre dispositivos

## ✅ **Beneficios**

- ✅ **Acceso desde cualquier dispositivo**
- ✅ **Sincronización en tiempo real**
- ✅ **Respaldo automático en la nube**
- ✅ **Funciona offline y sincroniza después**
- ✅ **Escalable y seguro**

## 🆘 **Soporte**

Si tienes problemas:
1. Verifica que todas las variables de entorno estén configuradas
2. Revisa la consola del navegador para errores
3. Asegúrate de que las reglas de Firestore permitan el acceso 