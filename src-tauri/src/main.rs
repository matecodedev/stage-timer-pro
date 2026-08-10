#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{AppHandle, GlobalShortcutManager, Manager, WindowBuilder, WindowUrl};

#[tauri::command]
fn emit_to_stage(app: AppHandle, event: String, payload: String) -> Result<(), String> {
    app.emit_to("stage", event.as_str(), payload)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn toggle_stage_fullscreen(app: AppHandle, on: bool) -> Result<(), String> {
    if let Some(win) = app.get_window("stage") {
        win.set_fullscreen(on).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn focus_stage(app: AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_window("stage") {
        win.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn create_stage_window(app: AppHandle) -> Result<(), String> {
    // Check if stage window already exists
    if app.get_window("stage").is_some() {
        return Ok(());
    }

    // Create new stage window - start with a specific position on secondary monitor
    let _stage_window = WindowBuilder::new(&app, "stage", WindowUrl::App("/stage.html".into()))
        .title("Stage Display")
        .resizable(true)
        .fullscreen(false)
        .position(1920.0, 0.0) // Start at likely secondary monitor position
        .inner_size(1920.0, 1080.0) // Set a reasonable default size
        .build()
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn position_stage_on_secondary_monitor(app: AppHandle) -> Result<(), String> {
    if let Some(stage_win) = app.get_window("stage") {
        // First, ensure window is not fullscreen to allow positioning
        stage_win.set_fullscreen(false).map_err(|e| e.to_string())?;

        // Get monitor information from main window
        if let Some(main_win) = app.get_window("main") {
            if let Ok(monitors) = main_win.available_monitors() {
                println!("Found {} monitors", monitors.len());

                // Print monitor info for debugging
                for (i, monitor) in monitors.iter().enumerate() {
                    println!(
                        "Monitor {}: position=({}, {}), size={}x{}",
                        i,
                        monitor.position().x,
                        monitor.position().y,
                        monitor.size().width,
                        monitor.size().height
                    );
                }

                if monitors.len() > 1 {
                    // Try to find secondary monitor
                    let secondary_monitor = monitors
                        .iter()
                        .find(|m| m.position().x != 0) // Not the primary monitor
                        .or_else(|| monitors.get(1)) // Or just take the second one
                        .unwrap_or(&monitors[0]); // Fallback to primary

                    let pos = secondary_monitor.position();
                    let size = secondary_monitor.size();

                    println!(
                        "Using monitor at position ({}, {}) with size {}x{}",
                        pos.x, pos.y, size.width, size.height
                    );

                    // Position and size the window to match the monitor
                    stage_win
                        .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                            x: pos.x,
                            y: pos.y,
                        }))
                        .map_err(|e| e.to_string())?;

                    stage_win
                        .set_size(tauri::Size::Physical(tauri::PhysicalSize {
                            width: size.width,
                            height: size.height,
                        }))
                        .map_err(|e| e.to_string())?;

                    // Show and focus the window
                    stage_win.show().map_err(|e| e.to_string())?;
                    stage_win.set_focus().map_err(|e| e.to_string())?;
                    stage_win.unminimize().map_err(|e| e.to_string())?;

                    // Give it a moment to position properly
                    std::thread::sleep(std::time::Duration::from_millis(300));

                    // Now make it fullscreen
                    stage_win.set_fullscreen(true).map_err(|e| e.to_string())?;

                    return Ok(());
                }
            }
        }

        // Fallback: assume standard dual monitor setup (1920x1080 primary + secondary)
        println!("Using fallback positioning for secondary monitor");

        stage_win
            .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                x: 1920,
                y: 0,
            }))
            .map_err(|e| e.to_string())?;

        stage_win
            .set_size(tauri::Size::Physical(tauri::PhysicalSize {
                width: 1920,
                height: 1080,
            }))
            .map_err(|e| e.to_string())?;

        stage_win.show().map_err(|e| e.to_string())?;
        stage_win.set_focus().map_err(|e| e.to_string())?;
        stage_win.unminimize().map_err(|e| e.to_string())?;

        std::thread::sleep(std::time::Duration::from_millis(300));

        stage_win.set_fullscreen(true).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn close_stage_window(app: AppHandle) -> Result<(), String> {
    if let Some(stage_win) = app.get_window("stage") {
        stage_win.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn get_monitor_info(app: AppHandle) -> Result<String, String> {
    if let Some(main_win) = app.get_window("main") {
        if let Ok(monitors) = main_win.available_monitors() {
            let mut info = format!("Found {} monitors:\n", monitors.len());
            for (i, monitor) in monitors.iter().enumerate() {
                info.push_str(&format!(
                    "Monitor {}: position=({}, {}), size={}x{}\n",
                    i,
                    monitor.position().x,
                    monitor.position().y,
                    monitor.size().width,
                    monitor.size().height
                ));
            }
            return Ok(info);
        }
    }
    Ok("Could not get monitor information".to_string())
}

#[tauri::command]
async fn send_notification(
    app: AppHandle,
    title: String,
    body: String,
    icon: Option<String>,
) -> Result<(), String> {
    use tauri::api::notification::Notification;

    let mut notification = Notification::new(&app.config().tauri.bundle.identifier)
        .title(title)
        .body(body);

    if let Some(icon_path) = icon {
        notification = notification.icon(icon_path);
    }

    notification.show().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn set_badge_label(label: Option<String>) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;

        if let Some(badge_text) = label {
            // Set badge text (for example, remaining time)
            let script = format!(
                r#"osascript -e 'tell application "System Events" to set the badge of application process "Stage Timer Pro" to "{}""#,
                badge_text
            );
            let _ = Command::new("sh").arg("-c").arg(&script).output();
        } else {
            // Clear badge
            let script = r#"osascript -e 'tell application "System Events" to set the badge of application process "Stage Timer Pro" to ""'"#;
            let _ = Command::new("sh").arg("-c").arg(script).output();
        }
    }
    
    #[cfg(target_os = "windows")]
    {
        // En Windows, los badges no están disponibles nativamente
        // Se podría implementar usando notificaciones del sistema o badges personalizados en la taskbar
        // Por ahora, simplemente retornamos Ok para evitar errores
        println!("Badge functionality not available on Windows: {:?}", label);
    }
    
    #[cfg(target_os = "linux")]
    {
        // En Linux, los badges dependen del entorno de escritorio
        // Por ahora, simplemente retornamos Ok para evitar errores
        println!("Badge functionality not available on Linux: {:?}", label);
    }

    Ok(())
}

#[tauri::command]
fn request_notification_permission(app: AppHandle) -> Result<String, String> {
    use tauri::api::notification::Notification;

    // En macOS, las notificaciones requieren permisos
    // Este comando verifica si tenemos permisos
    match Notification::new(&app.config().tauri.bundle.identifier)
        .title("Test")
        .body("Verificando permisos de notificación")
        .show()
    {
        Ok(_) => Ok("granted".to_string()),
        Err(e) => Ok(format!("denied: {}", e)),
    }
}

// Comandos para atajos globales
#[tauri::command]
fn register_global_shortcut(
    app: AppHandle,
    shortcut: String,
    action: String,
) -> Result<(), String> {
    let mut global_shortcut_manager = app.global_shortcut_manager();

    // Verificar si el atajo ya está registrado
    if global_shortcut_manager.is_registered(&shortcut).unwrap_or(false) {
        return Err(format!("Shortcut {} is already registered", shortcut));
    }

    let app_handle = app.clone();
    let action_clone = action.clone();

    match global_shortcut_manager.register(&shortcut, move || {
        let _ = app_handle.emit_all("global-shortcut", &action_clone);
    }) {
        Ok(_) => {
            println!("✅ Successfully registered global shortcut: {}", shortcut);
            Ok(())
        }
        Err(e) => {
            eprintln!("❌ Failed to register shortcut {}: {}", shortcut, e);
            Err(format!("Failed to register shortcut {}: {}", shortcut, e))
        }
    }
}

#[tauri::command]
fn unregister_global_shortcut(app: AppHandle, shortcut: String) -> Result<(), String> {
    let mut global_shortcut_manager = app.global_shortcut_manager();

    // Verificar si el atajo está registrado antes de intentar quitarlo
    if !global_shortcut_manager.is_registered(&shortcut).unwrap_or(false) {
        return Ok(()); // No error si ya no está registrado
    }

    match global_shortcut_manager.unregister(&shortcut) {
        Ok(_) => {
            println!("✅ Successfully unregistered global shortcut: {}", shortcut);
            Ok(())
        }
        Err(e) => {
            eprintln!("❌ Failed to unregister shortcut {}: {}", shortcut, e);
            Err(format!("Failed to unregister shortcut {}: {}", shortcut, e))
        }
    }
}

#[tauri::command]
fn is_global_shortcut_registered(app: AppHandle, shortcut: String) -> Result<bool, String> {
    let global_shortcut_manager = app.global_shortcut_manager();
    Ok(global_shortcut_manager
        .is_registered(&shortcut)
        .unwrap_or(false))
}

#[tauri::command]
fn unregister_all_shortcuts(app: AppHandle) -> Result<(), String> {
    let mut global_shortcut_manager = app.global_shortcut_manager();
    
    match global_shortcut_manager.unregister_all() {
        Ok(_) => {
            println!("✅ Successfully unregistered all global shortcuts");
            Ok(())
        }
        Err(e) => {
            eprintln!("❌ Failed to unregister all shortcuts: {}", e);
            Err(format!("Failed to unregister all shortcuts: {}", e))
        }
    }
}

// Comandos para integración con software de video (Resolume Arena, OBS, etc.)
#[tauri::command]
fn set_stage_for_capture(app: AppHandle, width: u32, height: u32) -> Result<(), String> {
    if let Some(stage_win) = app.get_window("stage") {
        // Configurar ventana para captura de video óptima
        stage_win.set_fullscreen(false).map_err(|e| e.to_string())?;

        // Tamaño estándar para video (1920x1080, 1280x720, etc.)
        stage_win
            .set_size(tauri::Size::Physical(tauri::PhysicalSize { width, height }))
            .map_err(|e| e.to_string())?;

        // Posicionar en una ubicación fija para facilitar captura
        stage_win
            .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                x: 100,
                y: 100,
            }))
            .map_err(|e| e.to_string())?;

        // Configurar ventana para captura
        stage_win
            .set_always_on_top(true)
            .map_err(|e| e.to_string())?;
        stage_win.set_resizable(false).map_err(|e| e.to_string())?;
        stage_win
            .set_title("Stage Timer - Video Capture")
            .map_err(|e| e.to_string())?;

        println!(
            "✅ Stage configurado para captura de video: {}x{}",
            width, height
        );
    }
    Ok(())
}

#[tauri::command]
fn reset_stage_window(app: AppHandle) -> Result<(), String> {
    if let Some(stage_win) = app.get_window("stage") {
        // Resetear configuración de la ventana
        stage_win
            .set_always_on_top(false)
            .map_err(|e| e.to_string())?;
        stage_win.set_resizable(true).map_err(|e| e.to_string())?;
        stage_win
            .set_title("Stage Display")
            .map_err(|e| e.to_string())?;

        println!("✅ Stage window resetted to normal mode");
    }
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            emit_to_stage,
            toggle_stage_fullscreen,
            focus_stage,
            position_stage_on_secondary_monitor,
            create_stage_window,
            get_monitor_info,
            close_stage_window,
            send_notification,
            set_badge_label,
            request_notification_permission,
            register_global_shortcut,
            unregister_global_shortcut,
            is_global_shortcut_registered,
            unregister_all_shortcuts,
            set_stage_for_capture,
            reset_stage_window
        ])
        .setup(|app| {
            // Create stage window pointing to stage.html
            // Position it on secondary monitor using a reasonable offset
            let stage_window = WindowBuilder::new(app, "stage", WindowUrl::App("/stage.html".into()))
                .title("Stage Display")
                .resizable(true)
                .fullscreen(false) // Start windowed, then position and fullscreen
                .position(1920.0, 0.0) // Standard dual monitor setup assumption
                .build()?;

            // Configurar el manejo de eventos de cierre para evitar que la app se cuelgue
            let app_handle = app.handle();
            stage_window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    // Evitar que el cierre de la ventana stage cierre toda la aplicación
                    api.prevent_close();
                    // En su lugar, ocultar la ventana
                    if let Some(stage_win) = app_handle.get_window("stage") {
                        let _ = stage_win.hide();
                    }
                }
            });

            // Configurar el manejo de eventos para la ventana principal
            if let Some(main_window) = app.get_window("main") {
                let app_handle = app.handle();
                main_window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { .. } = event {
                        // Limpiar atajos globales antes de cerrar
                        let mut global_shortcut_manager = app_handle.global_shortcut_manager();
                        let _ = global_shortcut_manager.unregister_all();
                        
                        // Cerrar todas las ventanas
                        if let Some(stage_win) = app_handle.get_window("stage") {
                            let _ = stage_win.close();
                        }
                        
                        // Permitir que la aplicación se cierre
                        std::process::exit(0);
                    }
                });
            }

            // Registrar atajos globales por defecto (Windows compatible)
            let mut global_shortcut_manager = app.global_shortcut_manager();
            let app_handle = app.handle();

            // Usar atajos que no interfieran con Windows
           
           
             // F9, F10, F11 son raramente usados por otras aplicaciones
            
            // F9 para start/pause (fácil de recordar)
            let shortcut_toggle = "F9";
            let app_clone = app_handle.clone();
            if let Err(e) = global_shortcut_manager
                .register(shortcut_toggle, move || {
                    let _ = app_clone.emit_all("global-shortcut", "toggle-timer");
                })
            {
                eprintln!("Failed to register {}: {}", shortcut_toggle, e);
            }

            // F10 para reset
            let shortcut_reset = "F10";
            let app_clone = app_handle.clone();
            if let Err(e) = global_shortcut_manager
                .register(shortcut_reset, move || {
                    let _ = app_clone.emit_all("global-shortcut", "reset-timer");
                })
            {
                eprintln!("Failed to register {}: {}", shortcut_reset, e);
            }

            // F11 para toggle fullscreen del stage
            let shortcut_fullscreen = "F11";
            let app_clone = app_handle.clone();
            if let Err(e) = global_shortcut_manager
                .register(shortcut_fullscreen, move || {
                    let _ = app_clone.emit_all("global-shortcut", "toggle-stage-fullscreen");
                })
            {
                eprintln!("Failed to register {}: {}", shortcut_fullscreen, e);
            }

            println!("✅ Aplicación iniciada con atajos globales:");
            println!("   F9: Start/Pause timer");
            println!("   F10: Reset timer");
            println!("   F11: Toggle stage fullscreen");

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
