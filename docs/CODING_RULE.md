# CODING_RULE.md

> 本文档优先级高于其它文档。
> AI 修改代码必须遵守以下规则。

---

# 1. 基本原则

遵循：

- SOLID
- DRY
- KISS
- YAGNI

禁止过度设计。

优先保证：

可维护性 > 可扩展性 > 性能。

---

# 2. TypeScript

开启：

strict

禁止：

any

允许：

unknown

所有函数必须声明类型。

所有 Props 必须声明 Interface。

所有返回值必须声明。

---

# 3. React

使用：

Function Component

禁止：

Class Component

所有组件：

单一职责。

禁止组件承担业务逻辑。

---

# 4. Hooks

所有副作用：

必须放入 Hook。

允许：

useEditor()

useWorkspace()

useSelection()

禁止：

Hook 内直接修改 DOM。

---

# 5. Store

统一：

Zustand。

禁止：

Context 保存业务状态。

禁止：

Store 相互依赖。

---

# 6. 文件系统

React：

禁止直接访问磁盘。

所有文件操作：

必须调用 Tauri Service。

---

# 7. Rust

Rust 仅负责：

文件

目录

监听

搜索

禁止：

业务逻辑。

---

# 8. 组件

单个组件：

≤300 行。

超过：

必须拆分。

---

# 9. 函数

单个函数：

≤50 行。

参数：

≤5 个。

超过：

必须封装。

---

# 10. 文件

单个文件：

≤500 行。

超过：

必须拆分。

---

# 11. 命名

组件：

PascalCase

变量：

camelCase

Hook：

useXXX

Store：

xxxStore

文件：

kebab-case

禁止拼音。

---

# 12. CSS

Tailwind 优先。

禁止：

Inline Style。

复杂样式：

CSS Module。

---

# 13. Props

禁止：

Props Drill。

超过两层：

使用 Store。

---

# 14. State

UI 状态：

组件内部。

业务状态：

Store。

禁止重复状态。

---

# 15. Service

所有 IO：

必须进入 Service。

包括：

文件

搜索

保存

监听

---

# 16. Editor

禁止：

直接修改 DOM。

所有编辑：

修改 Document。

Document 负责 Render。

---

# 17. Block

所有 Block：

必须拥有唯一 ID。

禁止使用数组 Index。

---

# 18. Undo

所有编辑：

Command 化。

禁止：

直接修改状态。

---

# 19. 自动保存

统一：

Dirty Queue。

禁止：

每次输入立即写盘。

---

# 20. Promise

所有 Promise：

必须：

try/catch。

禁止忽略异常。

---

# 21. Error

统一：

Toast。

禁止：

alert()

---

# 22. Console

Development：

允许。

Release：

禁止 Console。

统一 Logger。

---

# 23. Import

顺序：

React

↓

Third Party

↓

Store

↓

Service

↓

Components

↓

Types

↓

Utils

---

# 24. Export

优先：

Named Export。

禁止：

Default Export。

App 除外。

---

# 25. Magic Number

禁止。

统一：

const。

---

# 26. 注释

解释：

为什么。

不是：

做什么。

---

# 27. TODO

统一格式：

TODO:

FIXME:

OPTIMIZE:

禁止中文 TODO。

---

# 28. Git

每完成一个 Task：

Commit。

Commit 格式：

feat:

fix:

refactor:

docs:

style:

test:

---

# 29. AI 修改代码

禁止：

无关重构。

禁止：

修改未涉及模块。

禁止：

修改公共接口。

除非明确要求。

---

# 30. AI 输出

每完成一个 Task：

必须说明：

修改文件

新增文件

删除文件

实现内容

风险

下一步

---

# 31. 验收

所有代码必须：

TypeScript 通过

ESLint 通过

Build 成功

无 Warning

无重复代码

无 Dead Code

---

# 32. 禁止事项

禁止：

any

eval

innerHTML

DOM 查询修改

重复代码

超长函数

超长组件

循环依赖

业务逻辑写 JSX

Rust 写 UI

React 操作磁盘

---

# 33. AI 开发流程

读取 TASKS.md

↓

选择一个 Task

↓

分析依赖

↓

实现

↓

Build

↓

Lint

↓

测试

↓

Commit

↓

进入下一 Task

不得跨 Task 实现功能。

---

# 34. 最终目标

代码应满足：

易读

易维护

易扩展

低耦合

高内聚

模块独立

长期可维护