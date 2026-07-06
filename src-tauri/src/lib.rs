mod commands;
mod settings;

use commands::file;
use commands::search;
use commands::tree;
use commands::watch::{start_watch, stop_watch, WatchState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(WatchState::default())
        .invoke_handler(tauri::generate_handler![
            file::read_directory,
            file::read_file,
            file::write_file,
            file::delete_path,
            file::rename_path,
            file::move_path,
            file::mkdir,
            file::create_file,
            file::exists,
            file::get_metadata,
            tree::load_tree,
            search::search_files,
            start_watch,
            stop_watch,
            settings::load_settings,
            settings::save_settings,
            settings::load_recent,
            settings::save_recent,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
