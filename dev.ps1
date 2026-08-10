# Stage Timer Pro - Development Script for Windows
# Este script facilita el desarrollo en Windows

param(
    [Parameter(Position=0)]
    [string]$Command = "dev"
)

Write-Host "🚀 Stage Timer Pro - Windows Development Helper" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

switch ($Command) {
    "dev" {
        Write-Host "▶️ Iniciando modo desarrollo..." -ForegroundColor Green
        Write-Host "Atajos globales disponibles:" -ForegroundColor Yellow
        Write-Host "  • Ctrl+Shift+Space: Start/Pause timer" -ForegroundColor White
        Write-Host "  • Ctrl+Shift+R: Reset timer" -ForegroundColor White  
        Write-Host "  • Ctrl+Shift+F: Toggle stage fullscreen" -ForegroundColor White
        Write-Host ""
        npm run tauri:dev
    }
    "build" {
        Write-Host "🔨 Compilando para producción..." -ForegroundColor Green
        npm run tauri:build
        Write-Host "✅ Compilación completada. Archivos en src-tauri/target/release/bundle/" -ForegroundColor Green
    }
    "clean" {
        Write-Host "🧹 Limpiando archivos temporales..." -ForegroundColor Yellow
        if (Test-Path "src-tauri\target") {
            Remove-Item -Recurse -Force "src-tauri\target"
            Write-Host "✅ Carpeta target eliminada" -ForegroundColor Green
        }
        if (Test-Path "node_modules") {
            Remove-Item -Recurse -Force "node_modules"
            Write-Host "✅ node_modules eliminado" -ForegroundColor Green
        }
        if (Test-Path "dist") {
            Remove-Item -Recurse -Force "dist"
            Write-Host "✅ Carpeta dist eliminada" -ForegroundColor Green
        }
    }
    "install" {
        Write-Host "📦 Instalando dependencias..." -ForegroundColor Green
        npm install
        Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
    }
    "setup" {
        Write-Host "⚙️ Configurando entorno de desarrollo..." -ForegroundColor Green
        
        # Verificar Node.js
        try {
            $nodeVersion = node --version
            Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Node.js no encontrado. Instala desde https://nodejs.org/" -ForegroundColor Red
            return
        }
        
        # Verificar npm
        try {
            $npmVersion = npm --version
            Write-Host "✅ npm encontrado: v$npmVersion" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ npm no encontrado" -ForegroundColor Red
            return
        }
        
        # Instalar dependencias
        Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
        npm install
        
        Write-Host ""
        Write-Host "🎉 ¡Configuración completada!" -ForegroundColor Green
        Write-Host "Para iniciar el desarrollo, ejecuta: .\dev.ps1 dev" -ForegroundColor Cyan
    }
    "help" {
        Write-Host "Comandos disponibles:" -ForegroundColor Yellow
        Write-Host "  dev     - Iniciar modo desarrollo" -ForegroundColor White
        Write-Host "  build   - Compilar para producción" -ForegroundColor White
        Write-Host "  clean   - Limpiar archivos temporales" -ForegroundColor White
        Write-Host "  install - Instalar dependencias" -ForegroundColor White
        Write-Host "  setup   - Configurar entorno de desarrollo" -ForegroundColor White
        Write-Host "  help    - Mostrar esta ayuda" -ForegroundColor White
        Write-Host ""
        Write-Host "Uso:" -ForegroundColor Yellow
        Write-Host "  .\dev.ps1 [comando]" -ForegroundColor White
        Write-Host ""
        Write-Host "Ejemplos:" -ForegroundColor Yellow
        Write-Host "  .\dev.ps1 dev" -ForegroundColor White
        Write-Host "  .\dev.ps1 build" -ForegroundColor White
    }
    default {
        Write-Host "❌ Comando no reconocido: $Command" -ForegroundColor Red
        Write-Host "Usa '.\dev.ps1 help' para ver los comandos disponibles" -ForegroundColor Yellow
    }
}
