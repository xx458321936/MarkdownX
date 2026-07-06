# TASKS.md

> 开发顺序必须严格按照 Task ID 执行。
> 每完成一个 Task 后确保项目可以正常运行，再继续下一个 Task。

---

# Phase 1：项目初始化

## T001 初始化项目

目标：
- 创建 Vite + React + TypeScript 项目
- 集成 Tauri 2
- 配置 pnpm

验收：
- 项目可启动
- Tauri 窗口正常打开

---

## T002 配置开发环境

目标：
- ESLint
- Prettier
- tsconfig
- Path Alias

验收：
- 无 TypeScript 报错
- eslint 检查通过

---

## T003 创建目录结构

创建：

src/
components/
editor/
sidebar/
toolbar/
statusbar/
hooks/
services/
store/
types/
utils/
styles/

验收：
- 所有目录存在

---

## T004 安装依赖

安装：

- TailwindCSS
- Zustand
- unified
- remark
- rehype

验收：
- 项目正常运行

---

# Phase 2：基础框架

## T005 创建 Layout

实现：

Toolbar

Sidebar

Editor

StatusBar

验收：
- 四个区域正常显示

---

## T006 创建 Zustand Store

创建：

WorkspaceStore

EditorStore

UIStore

SettingStore

验收：
- Store 可正常读写

---

## T007 创建路由（预留）

虽然只有一个页面，
但保留 Router。

验收：
- Router 正常工作

---

# Phase 3：Workspace

## T008 打开 Workspace

功能：

选择本地目录

保存最近 Workspace

验收：
- 可重新打开

---

## T009 加载文件树

读取：

全部目录

Markdown 文件

验收：
- 树正常显示

---

## T010 展开/收起目录

验收：
- 状态正确保存

---

## T011 新建文件

验收：
- 文件真实创建

---

## T012 新建文件夹

验收：
- 文件夹真实创建

---

## T013 删除文件

验收：
- 文件真实删除

---

## T014 重命名

验收：
- 文件同步修改

---

## T015 拖拽移动

验收：
- 文件系统同步更新

---

## T016 文件监听

监听：

新增

删除

修改

移动

验收：
- 文件树自动刷新

---

# Phase 4：编辑器

## T017 创建 Editor Core

验收：
- 可输入文字

---

## T018 Document Model

实现：

Document

Block

Inline

验收：
- Block 正常维护

---

## T019 Cursor

实现：

Cursor

Selection

Anchor

验收：
- 光标正常

---

## T020 Heading

支持：

#

##

###

验收：
- 正常渲染

---

## T021 Paragraph

验收：
- 正常编辑

---

## T022 Quote

验收：
- 引用正常

---

## T023 List

支持：

无序

有序

验收：
- 自动缩进

---

## T024 Task List

支持：

[]

[x]

验收：
- 勾选正常

---

## T025 Code

支持：

Inline Code

验收：
- 渲染正常

---

## T026 Code Block

支持：

```

```

验收：
- Block 正常

---

## T027 Horizontal Rule

支持：

---

验收：
- 正常显示

---

## T028 Bold

支持：

**

验收：
- 正常

---

## T029 Italic

支持：

*

验收：
- 正常

---

## T030 Strike

支持：

~~

验收：
- 正常

---

## T031 Link

支持：

[]

()

验收：
- 正常解析

---

# Phase 5：编辑行为

## T032 Enter

---

## T033 Backspace

---

## T034 Delete

---

## T035 Tab

---

## T036 Shift+Tab

---

## T037 Paste

---

## T038 Copy

---

## T039 Cut

---

## T040 Select All

---

# Phase 6：Undo

## T041 Command Stack

---

## T042 Undo

---

## T043 Redo

---

# Phase 7：文件保存

## T044 Dirty 状态

---

## T045 Auto Save

500ms 自动保存

---

## T046 Save Queue

防止重复写盘

---

# Phase 8：搜索

## T047 文件名搜索

---

## T048 全文搜索

---

## T049 搜索结果定位

---

# Phase 9：设置

## T050 Theme

---

## T051 Font

---

## T052 Font Size

---

## T053 Tab Size

---

## T054 Auto Save Time

---

## T055 Settings 持久化

---

# Phase 10：工具栏

## T056 Toolbar

---

## T057 StatusBar

---

## T058 Toast

---

## T059 Confirm Dialog

---

## T060 Search Dialog

---

# Phase 11：优化

## T061 Virtual Render

---

## T062 Lazy Load

---

## T063 Memory Cache

---

## T064 Performance Optimize

---

## T065 Error Boundary

---

# Phase 12：发布

## T066 Windows Build

---

## T067 Mac Build

---

## T068 Linux Build

---

## T069 Release 测试

---

## T070 发布版本

---

# Done Definition

每个 Task 必须满足：

- 编译通过
- 无 TypeScript 报错
- 无 ESLint 报错
- 可运行
- 可独立测试
- 不影响已有功能
- 完成后提交一次 Git Commit