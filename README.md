# MarkFlow

> 一个本地优先的 Markdown 编辑器。

灵感来自 **Typora** 的所见即所得、**Obsidian** 的文件树管理、**VSCode** 的稳定交互。

所有数据保存在本地文件系统中,**不做云同步,不使用数据库**。

---

## 特性

- **所见即所得编辑** — 实时内联渲染,无独立预览窗
- **无限层级文件树** — 文件夹与文件的展开、收起、新建、删除、重命名
- **拖拽操作** — 文件夹/文件跨目录移动,实时同步到磁盘
- **自动保存** — 编辑后 500ms 防抖落盘,无需手动 `Ctrl+S`
- **Markdown 语法** — 标题、段落、引用、有序/无序/任务列表、行内代码、代码块、链接、加粗、斜体、删除线、水平分割线
- **撤销 / 重做** — 完整的 Command Stack
- **搜索** — 文件名搜索 + 全文搜索,点击跳转
- **快捷键** — 体系完整的键盘交互
- **设置** — 主题、字体、自动保存时间等可配置
- **双模式运行** — Tauri 桌面应用 或 纯浏览器模式(无需 Rust 工具链)

---

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前端框架 | React 19 + TypeScript + Vite 6 |
| 状态管理 | Zustand(业务状态)+ React State(组件状态) |
| 样式 | TailwindCSS |
| Markdown | unified + remark-parse + remark-gfm + remark-rehype + rehype-stringify |
| 桌面壳 | Tauri 2 + Rust |
| 包管理 | pnpm |

---

## 快速开始

### 环境要求

- Node.js ≥ 18
- pnpm ≥ 8
- 桌面模式额外需要:Rust 工具链 + Tauri 2 系统依赖(参见 [Tauri 官方文档](https://tauri.app/start/prerequisites/))

### 安装

```bash
pnpm install
```

### 开发

**浏览器模式(无需 Rust):**

```bash
pnpm dev
```

打开 http://localhost:1420 即可使用。

**桌面模式(Tauri):**

```bash
pnpm tauri dev
```

### 构建

**浏览器构建:**

```bash
pnpm build
```

产物输出到 `dist/`,可直接用任意静态服务器托管。

**桌面打包:**

```bash
pnpm tauri build
```

产物输出到 `src-tauri/target/release/bundle/`。

### 代码检查

```bash
pnpm lint          # ESLint
pnpm typecheck     # TypeScript
```

---

## 使用方法

### 1. 选择工作区

首次启动会提示选择一个本地文件夹作为 Workspace。应用会记住最近的 Workspace,下次可直接打开。

所有 Markdown 文件均以**真实文件**形式存储在所选目录中,不维护私有数据库。

### 2. 编辑 Markdown

- 在左侧文件树中点击任意 `.md` 文件即可在编辑器中打开
- **所见即所得**:输入 Markdown 语法(如 `# `、`- `、`> `)会立即渲染为对应格式
- **实时自动保存**:编辑后 500ms 自动写盘
- **未保存指示器**:状态栏会显示当前文件的保存状态

### 3. 文件树操作

- **展开/收起**:点击文件夹旁的箭头
- **新建文件 / 文件夹**:右键菜单或工具栏按钮
- **重命名**:右键 → 重命名 或 `F2`
- **删除**:右键 → 删除 或 `Delete`
- **拖拽移动**:按住文件/文件夹拖到目标位置

### 4. 搜索

- **文件名搜索**:文件树顶部的搜索框,实时过滤文件树
- **全文搜索**:`Ctrl+F`,在右侧面板中查看匹配结果,点击跳转到对应文件与位置

### 5. 快捷键

| 快捷键 | 功能 |
| --- | --- |
| `Ctrl+N` | 新建文件 |
| `Ctrl+Shift+N` | 新建文件夹 |
| `Ctrl+F` | 搜索 |
| `Ctrl+P` | 快速打开 |
| `Ctrl+Z` | 撤销 |
| `Ctrl+Y` | 重做 |
| `Ctrl+D` | 删除当前行 |
| `Ctrl+A` | 全选 |
| `Ctrl+C / V / X` | 复制 / 粘贴 / 剪切 |
| `Enter` | 当前 Block 继续 |
| `Shift+Enter` | 换行 |
| `Tab` | 列表缩进 |
| `Shift+Tab` | 列表反缩进 |
| `Alt+↑ / ↓` | 移动当前 Block |

---

## 当前 MVP 范围

按 [PRD](docs/PRD.md) 与 [TASKS](docs/TASKS.md) 推进。

### ✅ 已实现

- 无限层级文件树
- Markdown 文件的 CRUD 与拖拽
- 所见即所得编辑器
- 自动保存(500ms)
- Undo / Redo
- 搜索(文件名 + 全文)
- 快捷键体系

### ❌ MVP 不做(后续版本)

- 图片、表格增强
- 数学公式、Mermaid
- 插件系统
- 云同步
- 多人协同
- 收藏 / 标签

---

## 项目结构

```
MarkdownX/
├── src/                    # React 前端
│   ├── components/         # UI 组件
│   │   ├── editor/         # 编辑器相关
│   │   ├── sidebar/        # 侧边栏(文件树)
│   │   ├── toolbar/        # 工具栏
│   │   └── statusbar/      # 状态栏
│   ├── hooks/              # React Hooks
│   ├── services/           # 前端服务层(封装 Tauri 调用)
│   ├── store/              # Zustand Store
│   ├── types/              # TypeScript 类型定义
│   ├── utils/              # 工具函数
│   └── styles/             # 全局样式
├── src-tauri/              # Tauri(Rust 桌面壳)
│   └── src/
│       ├── commands/       # Tauri Command(文件 / 文件夹 / 搜索 / 监听)
│       ├── lib.rs
│       └── main.rs
├── docs/                   # 项目文档
│   ├── PRD.md
│   ├── TECH_DESIGN.md
│   ├── TASKS.md
│   └── CODING_RULE.md
└── ...
```

---

## 开发规范

详见 [CLAUDE.md](CLAUDE.md) 与 [docs/CODING_RULE.md](docs/CODING_RULE.md)。

核心约定:

- **TypeScript 严格模式**,**不使用 `any`**
- 业务状态走 Zustand,组件状态走 React State,**不混用**
- 文件操作全部经 Tauri Command,**前端不直接访问磁盘**
- 所有编辑在 **Document Model** 上完成,**不直接操作 DOM**
- Rust 端只负责文件 / 文件夹 / 搜索 / 监听,**不处理 UI 逻辑**
- 每个 Task = 一次 Commit

---

## 文档

- [PRD.md](docs/PRD.md) — 产品需求
- [TECH_DESIGN.md](docs/TECH_DESIGN.md) — 技术设计
- [TASKS.md](docs/TASKS.md) — 任务清单
- [CODING_RULE.md](docs/CODING_RULE.md) — 编码规范

---

## 许可

MIT
