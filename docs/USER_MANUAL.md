# 🎯 Stage Timer Pro - Manual de Usuario

**Versión 1.0.2** | **Aplicación Profesional de Timer para Eventos**

---

## 📋 Índice

1. [Introducción](#introducción)
2. [Instalación](#instalación)
3. [Interfaz Principal](#interfaz-principal)
4. [Configuración del Timer](#configuración-del-timer)
5. [Sistema de Mensajes](#sistema-de-mensajes)
6. [Branding Personalizado](#branding-personalizado)
7. [Atajos de Teclado](#atajos-de-teclado)
8. [Dual Monitor](#dual-monitor)
10. [Resolución de Problemas](#resolución-de-problemas)

---

## 🚀 Introducción

**Stage Timer Pro** es una aplicación profesional diseñada para eventos, conferencias, streaming y producciones audiovisuales que requieren un control preciso del tiempo con presentación visual de alta calidad.

### ✨ Características Principales

- **⏰ Timer Profesional**: Control preciso con alertas visuales y sonoras
- **🖥️ Dual Monitor**: Dashboard de control + pantalla fullscreen automática
- **⌨️ Atajos Globales**: Control sin cambiar de aplicación
- **💬 Sistema de Mensajes**: Comunicación visual con la audiencia
- **🎨 Branding Personalizado**: Logo y colores corporativos
- **🔔 Notificaciones**: Alertas nativas del sistema

---

## 💾 Instalación

### macOS

1. Descarga `Stage Timer Pro.dmg` desde [GitHub Releases](https://github.com/russofg/stage-timer-pro/releases)
2. Doble clic en el archivo `.dmg`
3. Arrastra **Stage Timer Pro** a la carpeta **Applications**
4. Abre Launchpad y busca "Stage Timer Pro"
5. **Primera ejecución**: Sistema puede pedir permisos (clic en "Abrir")

### Windows

1. Descarga `Stage Timer Pro_1.0.2_x64_en-US.msi`
2. Doble clic en el archivo `.msi`
3. Sigue el asistente de instalación
4. La aplicación se instalará en `Program Files`
5. Busca "Stage Timer Pro" en el menú Inicio

### ⚠️ Permisos Requeridos

- **macOS**: Accesibilidad (para atajos globales)
- **Windows**: Ejecución de aplicaciones (Windows Defender)

---

## 🖥️ Interfaz Principal

### Dashboard de Control

La ventana principal contiene todos los controles para gestionar el timer:

```
┌─────────────────────────────────────┐
│  🎯 Stage Timer Pro Dashboard       │
├─────────────────────────────────────┤
│  ⏰ Timer Configuration             │
│  ┌─────┐ ┌─────┐ ┌─────┐            │
│  │ HH  │ │ MM  │ │ SS  │ [SET]      │
│  └─────┘ └─────┘ └─────┘            │
│                                     │
│  🎮 Controls                        │
│  [▶️ START] [⏸️ PAUSE] [⏹️ STOP]      │
│                                     │
│  💬 Messages                        │
│  [Send Message] [Hide Message]      │
│                                     │
│  🎨 Branding                        │
│  [Configure Event Branding]        │
└─────────────────────────────────────┘
```

### Pantalla Stage (Monitor Secundario)

Pantalla fullscreen que muestra:

- **Timer principal** en fuente grande
- **Mensaje actual** (si está activo)
- **Branding del evento** (logo y nombre)
- **Estados visuales** (normal/warning/crítico)

---

## ⏰ Configuración del Timer

### Establecer Tiempo

1. **Campos de entrada**:
   - **Horas**: 0-23
   - **Minutos**: 0-59
   - **Segundos**: 0-59
2. Haz clic en **"SET"** para confirmar
3. El timer se actualiza instantáneamente

### Estados del Timer

- 🟢 **Normal**: Tiempo suficiente
- 🟡 **Warning**: Últimos 5 minutos (configurable)
- 🔴 **Crítico**: Últimos 60 segundos
- ⚫ **Time Out**: Tiempo agotado (contador negativo)

### Controles

- **▶️ START**: Inicia el countdown
- **⏸️ PAUSE**: Pausa/reanuda
- **⏹️ STOP**: Detiene y resetea

---

## 💬 Sistema de Mensajes

### Enviar Mensajes

1. Haz clic en **"Send Message"**
2. Escribe tu mensaje
3. **Opciones**:
   - **Tamaño de fuente**: 12px - 400px
   - **Efecto titilación**: On/Off
   - **Modo display**:
     - Flotante (sobre el timer)
     - Reemplazo (oculta el timer)

### Mensajes Predefinidos

- "TIME OUT"
- "DESCANSO"
- "PRÓXIMO TURNO"
- "Q&A SESSION"
- "NETWORKING BREAK"

### Ocultar Mensajes

- Botón **"Hide Message"**
- Atajo: Tecla **H**
- Auto-ocultar (configurable)

---

## 🎨 Branding Personalizado

### Configuración del Evento

```javascript
// Ejemplo de configuración
{
  eventName: "TechConf 2025",
  logo: "https://evento.com/logo.png",
  colors: {
    primary: "#1E40AF",    // Azul corporativo
    secondary: "#10B981",  // Verde timer
    background: "#1F2937", // Fondo oscuro
    accent: "#F59E0B"      // Naranja warning
  }
}
```

### Elementos Personalizables

- **Nombre del evento**: Header superior
- **Logo corporativo**: Esquina superior derecha
- **Colores**: Toda la paleta visual
- **Activación**: Toggle on/off del branding

---

## ⌨️ Atajos de Teclado

### Atajos Globales (Funcionan desde cualquier aplicación)

| Combinación     | Función                    |
| --------------- | -------------------------- |
| `⌘+Shift+Space` | ▶️ Start / ⏸️ Pause Timer  |
| `⌘+Shift+R`     | 🔄 Reset Timer             |
| `⌘+Shift+F`     | 🖥️ Toggle Stage Fullscreen |

### Atajos Locales (Dentro de la app)

| Tecla           | Función             |
| --------------- | ------------------- |
| `Space`         | ▶️ Start / ⏸️ Pause |
| `S`             | ⏹️ Stop             |
| `+` / `-`       | ±1 minuto           |
| `Cmd+` / `Cmd-` | ±5 minutos          |
| `M`             | 💬 Send Message     |
| `H`             | 🙈 Hide Message     |
| `D`             | 🌙 Toggle Dark Mode |

---

## 🖥️ Dual Monitor

### Configuración Automática

1. **Conecta segundo monitor**
2. **Inicia Stage Timer Pro**
3. La app detecta automáticamente:
   - Monitor principal → Dashboard
   - Monitor secundario → Stage fullscreen

### Posicionamiento Manual

- **macOS**: Preferences → Displays → Arrangement
- **Windows**: Settings → Display → Multiple displays

### Resolución de Problemas

- Si Stage no aparece: Atajo `⌘+Shift+F`
- Cambiar monitor: Arrastra ventana Stage
- Reset posición: Restart aplicación

---


---

## ❓ Resolución de Problemas

### 🚨 Problemas Comunes

#### Timer no inicia

- **Verificar**: Tiempo configurado > 0
- **Solución**: Reset y configurar nuevamente

#### Atajos globales no funcionan

- **macOS**: System Preferences → Security → Accessibility → ✅ Stage Timer Pro
- **Windows**: Ejecutar como administrador (primera vez)

#### Stage no aparece en segundo monitor

- **Verificar**: Segundo monitor conectado y detectado
- **Atajo**: `⌘+Shift+F` para toggle
- **Reiniciar**: Cerrar y abrir la aplicación

#### Branding no carga

- **Verificar**: URL del logo accesible
- **Formato**: PNG/JPG recomendado
- **Tamaño**: Máximo 2MB


### 📞 Soporte Técnico

**Email**: support@matecode.dev  
**GitHub Issues**: [github.com/russofg/stage-timer-pro/issues](https://github.com/russofg/stage-timer-pro/issues)  
**Documentación**: [Ver documentación técnica](TECHNICAL_DOCS.md)

---

## 🎯 Casos de Uso Profesionales

### 🎤 Eventos Musicales

- **Configuración**: Timer de 30min por set
- **Mensajes**: "5 MINUTES LEFT", "TIME OUT"
- **Branding**: Logo del festival

### 🎭 Conferencias

- **Configuración**: 45min presentación + 15min Q&A
- **Mensajes**: "Q&A TIME", "NETWORKING BREAK"
- **Branding**: Logo corporativo
- **Video**: OBS → Stream directo

### 📺 Streaming/TV

- **Configuración**: Segmentos de programa
- **Mensajes**: "COMMERCIAL BREAK", "COMING UP"
- **Branding**: Logo del canal
- **Video**: DirectShow → Software de producción

---

**🎯 Stage Timer Pro - Llevando tus eventos al siguiente nivel profesional**

_© 2025 MateCode. Todos los derechos reservados._
