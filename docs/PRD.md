# PRD.md

# 1. 项目概述

## 项目名称

MarkFlow（暂定）

## 产品定位

一个本地 Markdown 笔记应用。

目标体验：

- Typora 的所见即所得编辑
- Obsidian 的文件树管理
- VSCode 的稳定交互

仅支持本地文件，不做云同步。

---

# 2. MVP目标

必须实现：

✅ 无限层级文件夹

✅ Markdown文件

✅ 所见即所得编辑

✅ 自动保存

✅ 文件拖拽

✅ 重命名

✅ 删除

✅ 新建

✅ 搜索

✅ 快捷键

不实现：

❌ 图片

❌ 表格增强

❌ 数学公式

❌ Mermaid

❌ 插件

❌ 云同步

❌ 协同

❌ 收藏

---

# 3. 用户流程

启动应用

↓

选择 Workspace

↓

加载文件树

↓

点击 Markdown

↓

编辑

↓

自动保存

↓

关闭应用

---

# 4. 页面

仅一个页面。

```
+------------------------------------------------------+

Toolbar

+---------------+--------------------------------------+

Sidebar         Editor

(File Tree)     (WYSIWYG)

+---------------+--------------------------------------+

Status Bar

+------------------------------------------------------+
```

---

# 5. Workspace

Workspace 即一个本地目录。

例如：

```
Notes/

Daily/

Study/

Project/

README.md
```

应用不会维护数据库。

所有数据均来自文件系统。

---

# 6. 文件树

支持：

- 无限层级
- 展开
- 收起
- 新建文件
- 新建文件夹
- 删除
- 重命名
- 拖拽排序
- 拖拽移动目录
- 多层嵌套

默认按：

Folder

↓

File

排序。

支持搜索。

---

# 7. 编辑器

编辑器采用：

所见即所得。

不是：

左Markdown

右Preview

而是：

只有一个编辑区域。

例如：

输入：

# Hello

立即显示：

大标题

输入：

- item

立即变成：

•

输入：

> quote

立即显示引用块。

---

# 8. Markdown支持

支持：

# Heading

## Heading

Paragraph

Bold

Italic

Strike

Quote

Code

Code Block

Ordered List

Unordered List

Task List

Horizontal Rule

Link

支持快捷输入。

不支持：

Image

Math

HTML

Mermaid

Footnote

---

# 9. 编辑行为

Enter：

继续当前Block。

Shift+Enter：

换行。

Backspace：

Block为空时回退。

Tab：

列表缩进。

Shift+Tab：

列表反缩进。

Ctrl+Z：

Undo。

Ctrl+Y：

Redo。

Ctrl+A：

全选。

Ctrl+C：

复制。

Ctrl+V：

粘贴。

Ctrl+X：

剪切。

---

# 10. 自动保存

无需 Ctrl+S。

编辑后：

500ms

自动保存。

退出时：

确保全部写盘。

---

# 11. 搜索

支持：

文件名搜索

全文搜索

搜索结果点击立即定位。

---

# 12. 拖拽

支持：

文件

↓

文件夹

文件夹

↓

文件夹

文件

↓

根目录

拖拽实时更新文件系统。

---

# 13. 快捷键

Ctrl+N

新建文件

Ctrl+Shift+N

新建文件夹

Ctrl+F

搜索

Ctrl+P

快速打开

Ctrl+Z

撤销

Ctrl+Y

恢复

Ctrl+D

删除当前行

Alt+↑↓

移动当前Block

---

# 14. 设置

支持：

主题

字体大小

字体

Tab宽度

自动保存时间

默认Workspace

---

# 15. 性能要求

启动：

< 2 秒

切换文件：

<100ms

输入延迟：

<16ms

支持：

100000 行Markdown

不卡顿。

---

# 16. 数据存储

Workspace/

README.md

Study/

note.md

Project/

doc.md

配置：

settings.json

最近打开：

recent.json

不使用数据库。

---

# 17. 错误处理

文件不存在：

提示

权限不足：

提示

保存失败：

提示

不会导致程序崩溃。

---

# 18. 验收标准

必须满足：

□ 无限目录

□ Typora体验

□ 自动保存

□ 拖拽正常

□ Undo

□ Redo

□ 搜索

□ 快捷键

□ 所见即所得

□ 本地文件同步

---

# 19. 后续版本

V1

Markdown编辑器

V2

标签

V3

插件系统

V4

Git

V5

云同步

---

# 20. AI开发原则

整个项目遵循：

- 模块化
- TypeScript严格模式
- 不使用 any
- 所有组件单一职责
- 每个模块可独立测试
- 所有功能先实现 MVP，再扩展
- 优先保证稳定性，而非功能数量