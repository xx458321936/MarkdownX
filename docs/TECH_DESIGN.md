# TECH_DESIGN.md

# 1. 技术栈

Frontend

- React 19
- TypeScript
- Vite

Desktop

- Tauri 2
- Rust

Style

- TailwindCSS

Markdown

- unified
- remark
- rehype

State

- Zustand

File Watch

- notify (Rust)

Build

- pnpm

---

# 2. 项目架构

Application

├── UI

├── Editor

├── Sidebar

├── File System

├── Search

├── State

└── Tauri

所有模块独立。

模块之间仅通过公开接口通信。

---

# 3. 项目目录

src/

App.tsx

main.tsx

components/

editor/

sidebar/

toolbar/

statusbar/

layout/

hooks/

store/

services/

types/

utils/

styles/

tauri/

assets/

---

# 4. React组件

<App>

Layout

Sidebar

Toolbar

Editor

StatusBar

SearchDialog

SettingsDialog

ConfirmDialog

Toast

每个组件职责唯一。

---

# 5. Sidebar

负责：

Workspace

文件树

拖拽

搜索

刷新

展开

收起

不会处理：

Markdown

编辑器

保存

---

# 6. Editor

负责：

Markdown编辑

Block管理

Selection

Cursor

Undo

Redo

Paste

Copy

Cut

Delete

不会操作文件系统。

---

# 7. Document Model

整个文档：

Document

↓

Blocks

↓

Inline

示例：

Document

Paragraph

Heading

Quote

List

Code

Rule

Block之间互相独立。

---

# 8. Block类型

Heading

Paragraph

Quote

Code

CodeBlock

OrderedList

BulletList

TaskList

HorizontalRule

所有Block必须有唯一id。

---

# 9. Selection

维护：

Cursor

Anchor

Focus

Selection

编辑器所有操作基于Selection。

---

# 10. State

使用：

Zustand

Store：

WorkspaceStore

EditorStore

FileStore

SettingStore

UIStore

Store之间禁止循环依赖。

---

# 11. 文件系统

Rust负责：

读取

写入

删除

重命名

监听

拖拽移动

React不直接访问磁盘。

---

# 12. Tauri接口

readFile()

writeFile()

rename()

delete()

move()

mkdir()

create()

watch()

search()

所有接口Promise化。

---

# 13. Workspace

Workspace

↓

Folder

↓

Folder

↓

Markdown

无限层级。

路径全部使用绝对路径。

---

# 14. Markdown Parser

流程：

Markdown

↓

AST

↓

Document

↓

Render

编辑：

Document

↓

Markdown

始终保持双向同步。

---

# 15. Render

Editor只Render：

Visible Block。

禁止一次渲染全部内容。

支持Virtual Render。

---

# 16. Undo

采用Command Pattern。

每一次编辑：

生成Command。

Undo：

逆执行。

Redo：

重新执行。

默认保存1000步。

---

# 17. Auto Save

编辑

↓

Dirty

↓

500ms

↓

Write File

多个编辑合并保存。

---

# 18. File Watch

监听：

新增

删除

修改

移动

外部修改立即刷新。

不会覆盖用户未保存内容。

---

# 19. Search

文件名索引。

全文索引。

支持：

模糊搜索。

搜索结果实时刷新。

---

# 20. 拖拽

Drag Start

↓

Drag Hover

↓

Drop

↓

Move File

↓

Refresh Tree

全部调用Rust接口。

---

# 21. Toolbar

负责：

New

Save

Search

Undo

Redo

Setting

Toolbar无业务逻辑。

---

# 22. StatusBar

显示：

Workspace

文件名

字符数

行数

保存状态

Cursor位置

---

# 23. Settings

Theme

Font

Font Size

Tab Size

Auto Save

Default Workspace

JSON保存。

---

# 24. 性能

首次启动：

<2s

文件切换：

<100ms

输入：

<16ms

搜索：

<100ms

拖拽：

<100ms

---

# 25. 内存

按需加载。

关闭文件立即释放。

禁止重复缓存。

Markdown只保留当前编辑内容。

---

# 26. 错误处理

所有Promise：

必须try/catch。

Rust错误：

统一返回Result。

React：

统一Toast。

---

# 27. 日志

Development：

Console。

Release：

Log File。

所有异常必须记录。

---

# 28. 类型

全部：

TypeScript。

禁止：

any

unknown滥用

所有接口必须声明类型。

---

# 29. 命名规范

组件：

PascalCase

变量：

camelCase

常量：

UPPER_CASE

文件：

kebab-case

Hook：

useXXX

Store：

xxxStore

---

# 30. Hooks

允许：

useEditor

useSelection

useWorkspace

useSearch

useSetting

禁止一个Hook承担多个职责。

---

# 31. CSS

Tailwind优先。

禁止：

inline style。

复杂样式：

css module。

---

# 32. 通信原则

React

↓

Store

↓

Service

↓

Tauri

↓

Rust

↓

OS

禁止跨层调用。

---

# 33. 编码原则

SOLID

DRY

KISS

YAGNI

优先可维护。

---

# 34. 测试

每个模块：

独立测试。

每个Service：

必须可Mock。

UI禁止依赖真实文件系统。

---

# 35. MVP完成标准

必须实现：

√ 文件树

√ 编辑器

√ Markdown

√ Undo

√ Redo

√ 自动保存

√ 搜索

√ 拖拽

√ Workspace

√ 设置

其余功能后续版本实现。