# 🔒 Configuración Segura de Credenciales en Vercel

## Variables de Entorno Requeridas

Para usar tus credenciales personalizadas de forma segura, debes configurar estas variables de entorno en Vercel:

### 📋 Variables a Configurar:

```
NEXT_PUBLIC_ADMIN_EMAIL=refresquitos@gmail.com
NEXT_PUBLIC_ADMIN_PASSWORD=Moreno123@$#
```

## 🚀 Pasos para Configurar en Vercel:

### 1. Acceder a la Configuración del Proyecto
- Ve a [vercel.com](https://vercel.com)
- Entra a tu proyecto "refresquitos-web"
- Haz clic en la pestaña **"Settings"**

### 2. Configurar Variables de Entorno
- En el menú lateral, selecciona **"Environment Variables"**
- Haz clic en **"Add New"**

### 3. Agregar Primera Variable
- **Name**: `NEXT_PUBLIC_ADMIN_EMAIL`
- **Value**: `refresquitos@gmail.com`
- **Environment**: Selecciona "Production", "Preview" y "Development"
- Haz clic en **"Save"**

### 4. Agregar Segunda Variable
- **Name**: `NEXT_PUBLIC_ADMIN_PASSWORD`
- **Value**: `Moreno123@$#`
- **Environment**: Selecciona "Production", "Preview" y "Development"
- Haz clic en **"Save"**

### 5. Redesplegar la Aplicación
- Ve a la pestaña **"Deployments"**
- Haz clic en los tres puntos (...) del último deployment
- Selecciona **"Redeploy"**

## ✅ Verificación

Una vez configurado, tu aplicación usará automáticamente las nuevas credenciales:
- **Email**: `refresquitos@gmail.com`
- **Contraseña**: `Moreno123@$#`

## 🛡️ Seguridad

- ✅ Las credenciales NO aparecen en el código fuente
- ✅ Las credenciales NO se suben a GitHub
- ✅ Solo tú tienes acceso a las variables en Vercel
- ✅ Las variables están encriptadas en Vercel

## 📝 Notas Importantes

- Las variables de entorno solo se aplican después de un redespliegue
- Si no configuras las variables, la app usará las credenciales por defecto
- Puedes cambiar las credenciales en cualquier momento desde Vercel 