use std::fs;
use std::path::PathBuf;
use tauri::Manager;

fn settings_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("settings.json"))
}

#[tauri::command]
pub fn load_settings(app: tauri::AppHandle) -> Result<String, String> {
    let path = settings_path(&app)?;
    if !path.exists() {
        return Ok("{}".to_string());
    }
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_settings(app: tauri::AppHandle, content: String) -> Result<(), String> {
    let path = settings_path(&app)?;
    fs::write(&path, content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn load_recent(app: tauri::AppHandle) -> Result<String, String> {
    let path = settings_path(&app)?.parent().map(|p| p.join("recent.json"));
    let Some(path) = path else { return Ok("[]".to_string()) };
    if !path.exists() {
        return Ok("[]".to_string());
    }
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_recent(app: tauri::AppHandle, content: String) -> Result<(), String> {
    let Some(dir) = app.path().app_config_dir().ok() else { return Ok(()) };
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let path = dir.join("recent.json");
    fs::write(&path, content).map_err(|e| e.to_string())
}
