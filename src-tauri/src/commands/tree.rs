use super::file::TreeNode;
use std::fs;
use std::path::Path;

const SKIP_DIRS: &[&str] = &[
    ".git",
    "node_modules",
    "target",
    ".DS_Store",
    ".idea",
    ".vscode",
    "dist",
    "build",
];

fn build_tree(path: &Path) -> Result<TreeNode, String> {
    let metadata = fs::metadata(path).map_err(|e| e.to_string())?;
    let name = path
        .file_name()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| path.to_string_lossy().to_string());
    let mut node = TreeNode {
        id: path.to_string_lossy().to_string(),
        path: path.to_string_lossy().to_string(),
        name,
        is_dir: metadata.is_dir(),
        children: Vec::new(),
    };

    if metadata.is_dir() {
        let entries = fs::read_dir(path).map_err(|e| e.to_string())?;
        let mut dirs: Vec<TreeNode> = Vec::new();
        let mut files: Vec<TreeNode> = Vec::new();
        for entry in entries {
            let entry = entry.map_err(|e| e.to_string())?;
            let p = entry.path();
            let entry_name = entry.file_name().to_string_lossy().to_string();
            if SKIP_DIRS.contains(&entry_name.as_str()) {
                continue;
            }
            let sub = build_tree(&p)?;
            if sub.is_dir {
                dirs.push(sub);
            } else {
                files.push(sub);
            }
        }
        dirs.sort_by(|a, b| a.name.cmp(&b.name));
        files.sort_by(|a, b| a.name.cmp(&b.name));
        node.children.extend(dirs);
        node.children.extend(files);
    }

    Ok(node)
}

#[tauri::command]
pub fn load_tree(root: String) -> Result<TreeNode, String> {
    build_tree(Path::new(&root))
}
