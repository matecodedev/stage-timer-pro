# Stage Timer Pro - Build Script for Production
# Script para compilar la versión de producción

param(
    [Parameter(Position=0)]
    [string]$BuildType = "release"
)

Write-Host "🏗️ Stage Timer Pro - Production Build" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js no encontrado. Instalar desde https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Verificar npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: v$npmVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ npm no encontrado" -ForegroundColor Red
    exit 1
}

# Limpiar archivos anteriores
Write-Host "🧹 Limpiando archivos anteriores..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✅ Carpeta dist eliminada" -ForegroundColor Green
}
if (Test-Path "src-tauri\target\release") {
    Remove-Item -Recurse -Force "src-tauri\target\release"
    Write-Host "✅ Target release eliminado" -ForegroundColor Green
}

# Instalar dependencias
Write-Host "📦 Verificando dependencias..." -ForegroundColor Yellow
npm ci
Write-Host "✅ Dependencias verificadas" -ForegroundColor Green

# Compilar para producción
Write-Host "🔨 Compilando Stage Timer Pro..." -ForegroundColor Yellow
Write-Host "⏱️ Esto puede tomar varios minutos..." -ForegroundColor Gray

$startTime = Get-Date

try {
    npm run tauri:build
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    Write-Host ""
    Write-Host "🎉 ¡Compilación exitosa!" -ForegroundColor Green
    Write-Host "⏱️ Tiempo total: $($duration.ToString('mm\:ss'))" -ForegroundColor Gray
    Write-Host ""
    
    # Verificar archivos generados
    $msiPath = "src-tauri\target\release\bundle\msi"
    $nsisPath = "src-tauri\target\release\bundle\nsis"
    
    if (Test-Path $msiPath) {
        $msiFiles = Get-ChildItem -Path $msiPath -Filter "*.msi"
        foreach ($file in $msiFiles) {
            $sizeInMB = [math]::Round($file.Length / 1MB, 2)
            Write-Host "📦 MSI: $($file.Name) ($sizeInMB MB)" -ForegroundColor Cyan
        }
    }
    
    if (Test-Path $nsisPath) {
        $nsisFiles = Get-ChildItem -Path $nsisPath -Filter "*.exe"
        foreach ($file in $nsisFiles) {
            $sizeInMB = [math]::Round($file.Length / 1MB, 2)
            Write-Host "📦 NSIS: $($file.Name) ($sizeInMB MB)" -ForegroundColor Cyan
        }
    }
    
    Write-Host ""
    Write-Host "📁 Archivos generados en:" -ForegroundColor Yellow
    Write-Host "   • $msiPath" -ForegroundColor White
    Write-Host "   • $nsisPath" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 ¡Listo para distribución!" -ForegroundColor Green
    
    # Abrir carpeta de destino
    $response = Read-Host "¿Abrir carpeta de archivos? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        Start-Process "explorer.exe" -ArgumentList "src-tauri\target\release\bundle"
    }
}
catch {
    Write-Host ""
    Write-Host "❌ Error durante la compilación:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Posibles soluciones:" -ForegroundColor Yellow
    Write-Host "   • Verificar que Visual Studio Build Tools esté instalado" -ForegroundColor White
    Write-Host "   • Ejecutar 'npm install' para reinstalar dependencias" -ForegroundColor White
    Write-Host "   • Verificar que no haya otros procesos usando los archivos" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "✨ Proceso completado exitosamente" -ForegroundColor Green
