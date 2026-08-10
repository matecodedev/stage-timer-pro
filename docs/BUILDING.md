# Stage Timer Pro - Configuración para Windows

## Requisitos del Sistema

- Windows 10 versión 1903 o superior
- Visual Studio Build Tools o Visual Studio Community
- Node.js 16 o superior
- Rust (se instala automáticamente con Tauri)

## Instalación de Dependencias

### 1. Visual Studio Build Tools

```powershell
# Descargar e instalar Visual Studio Build Tools
# Asegúrate de incluir "C++ build tools" durante la instalación
```

### 2. Node.js

```powershell
# Descargar desde https://nodejs.org/
# O usar chocolatey:
choco install nodejs
```

### 3. Instalar dependencias del proyecto

```powershell
cd stage-timer-pro
npm install
```

## Diferencias con macOS

### Atajos Globales

Los atajos han sido adaptados para Windows:

- **macOS**: `Cmd+Shift+Space` → **Windows**: `Ctrl+Shift+Space` (Start/Pause timer)
- **macOS**: `Cmd+Shift+R` → **Windows**: `Ctrl+Shift+R` (Reset timer)
- **macOS**: `Cmd+Shift+F` → **Windows**: `Ctrl+Shift+F` (Toggle stage fullscreen)

### Notificaciones

- Las notificaciones funcionan a través del sistema de notificaciones de Windows
- Los badges de la aplicación no están disponibles en Windows (funcionalidad específica de macOS)

### Gestión de Ventanas

- Mejorado el manejo de cierre de ventanas para evitar que la app se cuelgue
- La ventana stage se oculta en lugar de cerrarse cuando se presiona el botón X
- Solo cerrar la ventana principal cierra toda la aplicación

## Comandos de Desarrollo

```powershell
# Modo desarrollo
npm run tauri:dev

# Compilar para producción
npm run tauri:build

# Solo frontend
npm run dev
```

## Compilación para Distribución

El proyecto está configurado para generar:

- **MSI**: Instalador estándar de Windows
- **NSIS**: Instalador con más opciones de personalización

```powershell
npm run tauri:build
```

Los archivos compilados estarán en `src-tauri/target/release/bundle/`

## Solución de Problemas

### La aplicación se cierra inmediatamente

- ✅ **Solucionado**: Los atajos globales ahora usan `Ctrl` en lugar de `Cmd`
- ✅ **Solucionado**: Mejor manejo de eventos de cierre de ventana

### Errores de compilación

- Asegúrate de tener Visual Studio Build Tools instalado
- Verifica que Node.js esté actualizado
- Ejecuta `npm install` para reinstalar dependencias

### Problemas con atajos globales

- Algunos atajos pueden estar en uso por otras aplicaciones
- Windows puede requerir permisos de administrador para ciertos atajos
- Los atajos se registran automáticamente al iniciar la aplicación

### Rendimiento

- Windows Defender puede afectar el rendimiento durante el desarrollo
- Añade la carpeta del proyecto a las exclusiones de Windows Defender

## Configuración Recomendada para Desarrollo

1. **PowerShell como terminal predeterminado** (ya configurado)
2. **Exclusiones de Windows Defender** para la carpeta del proyecto
3. **Visual Studio Code** con las extensiones:
   - Rust Analyzer
   - Tauri
   - ES6 Modules

## Notas de Compatibilidad

- ✅ Atajos globales adaptados para Windows
- ✅ Manejo de ventanas mejorado
- ✅ Notificaciones compatibles con Windows
- ✅ Iconos optimizados para Windows
- ⚠️ Badges no disponibles (funcionalidad específica de macOS)
- ✅ Compilación nativa para Windows (MSI/NSIS)
