# ❓ Stage Timer Pro - Preguntas Frecuentes (FAQ)

**Respuestas a las preguntas más comunes de usuarios**

---

## 📋 Índice

1. [Instalación y Configuración](#instalación-y-configuración)
2. [Uso Básico](#uso-básico)
3. [Atajos de Teclado](#atajos-de-teclado)
4. [Dual Monitor](#dual-monitor)
6. [Branding y Personalización](#branding-y-personalización)
7. [Problemas Técnicos](#problemas-técnicos)
8. [Licencias y Comercial](#licencias-y-comercial)

---

## 💾 Instalación y Configuración

### ❓ **¿En qué sistemas operativos funciona Stage Timer Pro?**

✅ **macOS**: 10.15 Catalina o superior (Intel y Apple Silicon)  
✅ **Windows**: Windows 10 version 1903 o superior (x64)  
❌ **Linux**: No disponible actualmente

### ❓ **¿Por qué aparece "App dañada" en macOS?**

Es normal con apps no firmadas digitalmente por Apple:

```bash
# Solución rápida:
sudo xattr -rd com.apple.quarantine "/Applications/Stage Timer Pro.app"
```

O: System Preferences → Security → "Open Anyway"

### ❓ **¿Windows Defender bloquea la instalación, es seguro?**

✅ **Completamente seguro**. Windows bloquea apps de desarrolladores no reconocidos:

1. Clic en "More info"
2. Clic en "Run anyway"
3. La app es 100% libre de malware

### ❓ **¿Necesito permisos especiales?**

**macOS**: Accessibility (atajos globales)  
**Windows**: Ejecutar como administrador (solo primera vez)

### ❓ **¿Cuánto espacio ocupa la aplicación?**

- **Instalador**: ~50MB download
- **Instalada**: ~150MB en disco
- **RAM en uso**: ~100-200MB running

---

## 🎮 Uso Básico

### ❓ **¿Cómo configuro el timer?**

1. **Dashboard**: Campos Horas, Minutos, Segundos
2. **Clic "SET"** para confirmar
3. **Start button** o tecla `Space` para iniciar

### ❓ **¿Puedo pausar el timer?**

✅ **Sí**: Botón Pause o tecla `Space` (toggle start/pause)  
El timer mantiene el tiempo exacto donde se pausó

### ❓ **¿Qué pasa cuando llega a 0?**

- **Timer continúa** en números negativos (overtime)
- **Color cambia** a rojo crítico
- **Notificación** del sistema (si está habilitada)
- **Beep sound** (configurable)

### ❓ **¿Puedo ajustar el tiempo mientras está corriendo?**

✅ **Sí**:

- **+/-**: Ajustar ±1 minuto
- **Cmd/Ctrl + +/-**: Ajustar ±5 minutos
- **Manual**: Pause → Configurar → Start

### ❓ **¿Se puede cambiar el tamaño de fuente del timer?**

La fuente se ajusta automáticamente al tamaño de ventana Stage.
Para tamaño específico: redimensionar ventana Stage

---

## ⌨️ Atajos de Teclado

### ❓ **¿Los atajos funcionan desde cualquier aplicación?**

✅ **Atajos globales** (funcionan desde cualquier app):

- `⌘+Shift+Space`: Start/Pause
- `⌘+Shift+R`: Reset
- `⌘+Shift+F`: Toggle Stage fullscreen

❌ **Atajos locales** (solo dentro de Stage Timer):

- `Space`, `S`, `M`, `H`, `D`, etc.

### ❓ **Los atajos globales no funcionan, ¿qué hago?**

**macOS**:

1. System Preferences → Security & Privacy → Accessibility
2. ✅ Stage Timer Pro
3. Restart la aplicación

**Windows**: Ejecutar como administrador

### ❓ **¿Puedo personalizar los atajos?**

❌ No en v1.0.2, pero está en el roadmap para futuras versiones

### ❓ **¿Hay atajo para enviar mensajes?**

✅ **Tecla `M`** (solo dentro de la app)
Para envío rápido, mantén la app enfocada

---

## 🖥️ Dual Monitor

### ❓ **¿Se configura automáticamente el dual monitor?**

✅ **Detección automática**:

- Monitor principal → Dashboard
- Monitor secundario → Stage fullscreen

### ❓ **¿Qué pasa si no tengo segundo monitor?**

La app funciona perfectamente con un solo monitor:

- **Dashboard**: Ventana principal
- **Stage**: Ventana separada (redimensionable)

### ❓ **¿Puedo elegir en qué monitor aparece Stage?**

1. **Arrastra** la ventana Stage al monitor deseado
2. **Atajo `⌘+Shift+F`** para toggle fullscreen
3. La app recuerda la posición

### ❓ **Stage no aparece en el segundo monitor**

**Soluciones**:

1. **Toggle fullscreen**: `⌘+Shift+F`
2. **Restart** Stage Timer Pro
3. **Verificar** que segundo monitor esté detectado por el OS

### ❓ **¿Funciona con más de 2 monitores?**

✅ **Sí**, la ventana Stage se puede mover a cualquier monitor conectado

---


---

## 🎨 Branding y Personalización

### ❓ **¿Puedo agregar el logo de mi empresa?**

✅ **Sí**:

1. **URL del logo**: Debe ser accesible por internet
2. **Formatos**: PNG, JPG, SVG recomendados
3. **Tamaño**: Máximo 2MB
4. **Posición**: Esquina superior derecha

### ❓ **¿Se pueden cambiar los colores?**

✅ **Paleta completa**:

- **Primary**: Textos y logo
- **Secondary**: Timer en estado normal
- **Background**: Fondo de la aplicación
- **Accent**: Warnings y alertas

### ❓ **¿El branding se guarda entre sesiones?**

❌ **No en v1.0.2** - se resetea al cerrar la app
✅ **Próxima versión** incluirá persistencia de configuración

### ❓ **¿Puedo quitar el branding completamente?**

✅ **Toggle on/off** del branding completo en configuración

### ❓ **¿Hay límite en el nombre del evento?**

**Recomendado**: 20-30 caracteres para visualización óptima
**Máximo**: 100 caracteres (se ajusta automáticamente)

---

## 🚨 Problemas Técnicos

### ❓ **La aplicación no inicia**

**Diagnóstico**:

1. **Verificar** requisitos del sistema
2. **Restart** el computador
3. **Reinstalar** la aplicación
4. **Contactar soporte** si persiste

### ❓ **Timer se congela o va lento**

**Causas comunes**:

- **CPU overload**: Cerrar otras aplicaciones
- **Low RAM**: Mínimo 4GB disponible
- **Background processes**: Task Manager cleanup

### ❓ **Los mensajes no aparecen**

**Verificar**:

1. **Mensaje configurado** correctamente
2. **Stage window** visible
3. **Toggle message**: Tecla `H` para mostrar/ocultar

### ❓ **Branding/logo no carga**

**Soluciones**:

1. **URL accesible**: Verificar que el link funcione en browser
2. **Formato correcto**: PNG/JPG recomendado
3. **Tamaño**: Máximo 2MB
4. **Internet**: Verificar conexión

### ❓ **App consume mucha CPU**

**Optimizaciones**:

- **Close browser** capture previews
- **Lower frame rate** en software de captura
- **Hardware acceleration** enable cuando disponible

---

## 💼 Licencias y Comercial

### ❓ **¿Es gratis Stage Timer Pro?**

✅ **Completamente gratis** para uso personal y comercial
📜 **Licencia MIT** - ver LICENSE file

### ❓ **¿Puedo usarlo en eventos pagos?**

✅ **Uso comercial permitido**:

- Eventos corporativos
- Conferencias pagadas
- Streaming monetizado
- Producciones profesionales

### ❓ **¿Hay versión Pro con más funciones?**

❌ **No actualmente** - una sola versión con todas las funciones
✅ **Roadmap futuro** puede incluir versiones especializadas

### ❓ **¿Puedo modificar el código fuente?**

✅ **Open source** en GitHub: [github.com/russofg/stage-timer-pro](https://github.com/russofg/stage-timer-pro)
✅ **Licencia MIT** permite modificación y redistribución

### ❓ **¿Ofrecen soporte técnico?**

✅ **Soporte comunitario** gratuito:

- GitHub Issues
- Email: support@matecode.dev
- Documentación completa

❌ **Soporte premium** no disponible actualmente

---

## 🔮 Roadmap y Futuras Versiones

### ❓ **¿Qué funciones vienen en próximas versiones?**

**v1.1 (Planeado)**:

- Persistencia de configuración
- Sonidos personalizables
- Múltiples timers simultáneos
- Temas predefinidos

**v1.2 (Futuro)**:

- Atajos personalizables
- Plugins de terceros
- Mobile companion app
- Cloud sync

### ❓ **¿Habrá versión móvil?**

🤔 **En consideración** para control remoto del timer principal

### ❓ **¿Vendrá soporte para Linux?**

🤔 **Posible** si hay suficiente demanda de la comunidad

---

## 📞 Contacto y Soporte

### ❓ **¿Cómo reporto un bug?**

1. **GitHub Issues**: [Crear issue](https://github.com/russofg/stage-timer-pro/issues)
2. **Email**: support@matecode.dev
3. **Incluir**: OS version, steps to reproduce, screenshots

### ❓ **¿Cómo sugiero nuevas funciones?**

✅ **GitHub Issues** con label "enhancement"
✅ **Email** con propuesta detallada
✅ **Community feedback** muy valorado

### ❓ **¿Hay comunidad de usuarios?**

**GitHub Discussions** para:

- Tips y trucos
- Configuraciones compartidas
- Use cases interesantes
- Ayuda entre usuarios

---

## 💡 Tips Pro

### ❓ **¿Mejores prácticas para eventos en vivo?**

1. **Test completo** antes del evento
2. **Backup timer** (otro dispositivo)
3. **Rehearsal** con todo el setup técnico
4. **Responsible person** dedicada al timer
5. **Clear communication** con presenters

### ❓ **¿Configuración recomendada para diferentes tipos de eventos?**

**🎵 Eventos Musicales**:

```
Timer: 30-45 min sets
Messages: "5 MIN LEFT", "TIME"
Colors: Matching event branding
```

**🎭 Conferencias**:

```
Timer: 45 min + 15 min Q&A
Messages: "Q&A TIME", "WRAP UP"
Colors: Corporate branding
Video: OBS → Live stream
```

**📺 Live Shows**:

```
Timer: Segment-based (5-10 min)
Messages: "COMMERCIAL", "BACK IN 3"
Colors: Broadcast style
Video: Professional broadcast chain
```

---

**🎯 ¿No encuentras tu pregunta? Contáctanos en support@matecode.dev**

_Actualizaremos este FAQ basado en las preguntas más frecuentes de la comunidad._
