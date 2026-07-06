use notify::RecursiveMode;
use notify_debouncer_mini::{new_debouncer, DebounceEventResult, Debouncer};
use std::path::Path;
use std::sync::Mutex;
use std::time::Duration;
use tauri::{AppHandle, Emitter, State};

pub struct WatchState {
    pub debouncer: Mutex<Option<Debouncer<notify::RecommendedWatcher>>>,
}

impl Default for WatchState {
    fn default() -> Self {
        Self {
            debouncer: Mutex::new(None),
        }
    }
}

#[tauri::command]
pub fn start_watch(
    app: AppHandle,
    state: State<'_, WatchState>,
    path: String,
) -> Result<(), String> {
    let app_handle = app.clone();
    let mut debouncer = new_debouncer(
        Duration::from_millis(300),
        move |res: DebounceEventResult| match res {
            Ok(events) => {
                for ev in events {
                    let payload = serde_json::json!({
                        "path": ev.path.to_string_lossy().to_string(),
                        "kind": format!("{:?}", ev.kind),
                    });
                    let _ = app_handle.emit("fs-change", payload);
                }
            }
            Err(e) => eprintln!("watch error: {:?}", e),
        },
    )
    .map_err(|e| e.to_string())?;

    debouncer
        .watcher()
        .watch(Path::new(&path), RecursiveMode::Recursive)
        .map_err(|e| e.to_string())?;

    let mut guard = state.debouncer.lock().unwrap();
    *guard = Some(debouncer);
    Ok(())
}

#[tauri::command]
pub fn stop_watch(state: State<'_, WatchState>) -> Result<(), String> {
    let mut guard = state.debouncer.lock().unwrap();
    guard.take();
    Ok(())
}
