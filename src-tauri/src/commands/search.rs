use std::fs;
use std::path::Path;
use walkdir::WalkDir;

const SKIP_DIRS: &[&str] = &[".git", "node_modules", "target", "dist", "build"];

#[derive(serde::Serialize)]
pub struct SearchHit {
    pub path: String,
    pub name: String,
    pub is_dir: bool,
    pub line: Option<u32>,
    pub snippet: Option<String>,
}

fn is_markdown(name: &str) -> bool {
    let lower = name.to_lowercase();
    lower.ends_with(".md") || lower.ends_with(".markdown")
}

#[tauri::command]
pub fn search_files(root: String, query: String, content: bool) -> Result<Vec<SearchHit>, String> {
    let q = query.to_lowercase();
    let mut hits: Vec<SearchHit> = Vec::new();
    let walker = WalkDir::new(&root).follow_links(false).into_iter().filter_entry(|e| {
        if e.file_type().is_dir() {
            if let Some(name) = e.file_name().to_str() {
                return !SKIP_DIRS.contains(&name);
            }
        }
        true
    });

    for entry in walker.flatten() {
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();
        let lower_name = name.to_lowercase();
        let is_dir = entry.file_type().is_dir();
        let is_file = entry.file_type().is_file();

        if !is_dir {
            if !is_markdown(&name) && content {
                continue;
            }
        }

        if !content {
            if lower_name.contains(&q) {
                hits.push(SearchHit {
                    path: path.to_string_lossy().to_string(),
                    name: name.clone(),
                    is_dir,
                    line: None,
                    snippet: None,
                });
            }
        } else if is_file && is_markdown(&name) {
            let content = fs::read_to_string(path).unwrap_or_default();
            let lower_content = content.to_lowercase();
            if let Some(idx) = lower_content.find(&q) {
                let start = idx.saturating_sub(40);
                let end = (idx + q.len() + 60).min(content.len());
                let mut snippet = content[start..end].to_string();
                if start > 0 {
                    snippet = format!("…{}", snippet);
                }
                if end < content.len() {
                    snippet = format!("{}…", snippet);
                }
                snippet = snippet.replace('\n', " ");
                let line = content[..idx].matches('\n').count() as u32 + 1;
                hits.push(SearchHit {
                    path: path.to_string_lossy().to_string(),
                    name,
                    is_dir: false,
                    line: Some(line),
                    snippet: Some(snippet),
                });
            }
        }

        if hits.len() >= 200 {
            break;
        }
    }
    Ok(hits)
}
