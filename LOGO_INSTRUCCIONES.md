# Instrucciones para el Logo de Refresquitos

## Ubicación del Logo

Para que el logo aparezca correctamente en la aplicación, debes colocar el archivo `logo1.png` en la carpeta `public` del proyecto.

### Pasos:

1. **Copia el archivo `logo1.png`** que tienes
2. **Pégalo en la carpeta `public`** del proyecto Refresquitos
3. **La ruta final debe ser:** `public/logo1.png`

### Estructura de carpetas:
```
Refresquitos/
├── public/
│   └── logo1.png  ← Aquí debe ir tu logo
├── src/
├── package.json
└── ...
```

## Dónde aparece el logo:

✅ **Pantalla de Login:** Logo grande en la parte superior del formulario
✅ **Header de la aplicación:** Logo pequeño en la esquina superior izquierda

## Características técnicas:

- **Formato soportado:** PNG (recomendado), JPG, SVG
- **Tamaño recomendado:** Mínimo 200x200 píxeles para buena calidad
- **Fondo:** Preferiblemente transparente para mejor integración

## Fallback automático:

Si el archivo no se encuentra, la aplicación mostrará automáticamente un logo de respaldo con la letra "R" en un círculo azul.

---

**¡Una vez que coloques el archivo `logo1.png` en la carpeta `public`, el logo aparecerá automáticamente!** 