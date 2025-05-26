# Configuración de Variables de Entorno en Vercel

Una vez que hagas el deploy a Vercel, necesitas configurar las variables de entorno para que Firebase funcione en producción.

## Variables de entorno que debes agregar en Vercel:

Ve a tu proyecto en Vercel → Settings → Environment Variables y agrega:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDYGZZevD-IPQi4LCqE8AbsE4vVSKF8aT8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=refresquitos-manager-9c2bb.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=refresquitos-manager-9c2bb
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=refresquitos-manager-9c2bb.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=738680530919
NEXT_PUBLIC_FIREBASE_APP_ID=1:738680530919:web:1447357c7dd6756d47ff42
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-L4GS819X38
```

## Pasos:

1. Haz login en Vercel con GitHub
2. Ejecuta `npx vercel` para hacer el deploy
3. Ve a tu proyecto en Vercel dashboard
4. Settings → Environment Variables
5. Agrega cada variable una por una
6. Redeploy el proyecto

## Importante:

- Todas las variables deben tener el prefijo `NEXT_PUBLIC_`
- Asegúrate de que estén configuradas para todos los entornos (Production, Preview, Development)
- Después de agregar las variables, haz un nuevo deploy 