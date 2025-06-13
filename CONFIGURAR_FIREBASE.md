# 🔥 Configuración de Firebase para Refresquitos

## ✅ Estado Actual
- ✅ Credenciales configuradas en `.env.local`
- ✅ Reglas de Firestore creadas en `firestore.rules`
- ✅ Servidor funcionando en http://localhost:3000
- ✅ Componente de diagnóstico agregado

## 🚀 Pasos para Activar Firebase

### 1. Configurar Reglas de Firestore (IMPORTANTE)

Ve a la **Consola de Firebase**: https://console.firebase.google.com/

1. **Selecciona tu proyecto**: `refresquitos-manager-9c2bb`
2. **Ve a Firestore Database** (en el menú lateral)
3. **Haz clic en "Reglas"** (pestaña superior)
4. **Reemplaza las reglas actuales** con el contenido del archivo `firestore.rules`:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acceso completo para desarrollo
    // NOTA: En producción, estas reglas deben ser más restrictivas
    match /{document=**} {
      allow read, write: if true;
    }
    
    // Reglas específicas para las colecciones de la aplicación
    match /users/{userId} {
      allow read, write: if true;
    }
    
    match /users/{userId}/incomes/{incomeId} {
      allow read, write: if true;
    }
    
    match /users/{userId}/expenses/{expenseId} {
      allow read, write: if true;
    }
    
    match /users/{userId}/productions/{productionId} {
      allow read, write: if true;
    }
    
    match /users/{userId}/absences/{absenceId} {
      allow read, write: if true;
    }
    
    match /users/{userId}/employeeCycles/{cycleId} {
      allow read, write: if true;
    }
  }
}
```

5. **Haz clic en "Publicar"**

### 2. Verificar la Aplicación

1. **Abre**: http://localhost:3000
2. **Verifica el indicador en la esquina inferior derecha**:
   - 🔥 Verde = Firebase conectado
   - 💾 Amarillo = Modo desarrollo (localStorage)
3. **Verifica en la consola del navegador** que ya no aparezcan errores de Firebase
4. **Prueba crear un gasto o ingreso** para verificar que se guarde en Firebase

### 3. Verificar en Firebase Console

1. **Ve a Firestore Database > Datos**
2. **Deberías ver las colecciones** creándose cuando uses la aplicación:
   - `users/[email]/expenses`
   - `users/[email]/incomes`
   - `users/[email]/productions`
   - etc.

## 🔧 Solución de Problemas

### Si sigues viendo "💾 Modo Desarrollo":
1. **Reinicia el servidor**: Ctrl+C y luego `npm run dev`
2. **Verifica el archivo `.env.local`** que tenga todas las credenciales
3. **Limpia la caché del navegador**: Ctrl+Shift+R
4. **Verifica las reglas de Firestore** en la consola de Firebase

### Si aparecen errores de permisos:
1. **Verifica que las reglas de Firestore** estén publicadas
2. **Asegúrate de que el proyecto ID** sea correcto: `refresquitos-manager-9c2bb`

### Si la aplicación se queda cargando:
1. **Abre las herramientas de desarrollador** (F12)
2. **Ve a la pestaña Console** para ver errores
3. **Verifica que no haya bucles infinitos** en la carga de datos

## 🎉 ¡Listo!

Una vez completados estos pasos, tu aplicación estará guardando todos los datos en Firebase en lugar de localStorage.

**Credenciales configuradas:**
- API Key: ✅ AIzaSyDYGZZevD-IPQi4LCqE8AbsE4vVSKF8aT8
- Project ID: ✅ refresquitos-manager-9c2bb
- Auth Domain: ✅ refresquitos-manager-9c2bb.firebaseapp.com

**Nuevas características:**
- ✅ Indicador visual de estado de Firebase
- ✅ Manejo automático de fallback a localStorage
- ✅ Diagnóstico automático en consola 