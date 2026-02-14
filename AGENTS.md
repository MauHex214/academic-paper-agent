# Academic Paper Writing Agent System

## 项目概述

一个多 Agent 学术论文写作助手，帮助用户从理解工作内容到完成论文起草的全流程。

## 增量工作模式（参考 Anthropic 文章）

本项目采用 Anthropic 提出的长时运行 Agent 框架，确保在多个会话中持续有效地工作。

### 核心机制

| 文件 | 作用 |
|------|------|
| `feature_list.json` | 功能列表，记录所有待实现功能及状态 |
| `claude-progress.txt` | 进度日志，记录每个会话的工作内容 |
| `init.sh` | 启动脚本，用于初始化环境 |
| Git 仓库 | 每次完成功能后提交，便于回滚 |

### 会话启动流程

```
1. pwd → 确认工作目录
2. git status → 检查未提交的更改
3. read feature_list.json → 查看待完成任务
4. read claude-progress.txt → 了解历史工作
5. 选择一个功能开始实现
```

### 工作规范

1. **每次只做一个功能** - 避免一次性实现太多导致上下文溢出
2. **完成后更新 feature_list.json** - 将 passes 设为 true
3. **提交 git** - 编写描述性 commit message
4. **更新进度日志** - 记录本次完成的工作

### 开发与验收分离（重要）

为避免在同一 context 下既开发又验收，采用以下流程：

```
┌─────────────────────────────────────────────────────────────┐
│  Coding Agent (我)                                          │
│  - 实现功能                                                  │
│  - 完成后说 "请求验收"                                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Verification Agent (task subagent - deep category)          │
│  - 读取 feature_list.json                                   │
│  - 验证功能实现是否完整                                       │
│  - 验证通过后更新 passes: true                              │
│  - 返回验证结果                                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Coding Agent (我)                                          │
│  - 如果通过：领取下一个任务                                   │
│  - 如果未通过：修复问题后再次请求验收                         │
└─────────────────────────────────────────────────────────────┘
```

### 自动化验收流程

1. **功能实现完成后**：告诉 Coding Agent "请求验收"
2. **自动调用验证**：使用 `task(category="deep")` 启动验证 subagent
3. **验证标准**：读取 feature_list.json 中的 steps 进行逐项检查
4. **状态更新**：验证通过后自动更新 passes: true
5. **循环**：如果未通过，Coding Agent 修复后再次请求验收

### 验收 prompt 模板

```
请验证功能 #ID: 功能名称

功能描述：xxx

验收标准：
1. 步骤1
2. 步骤2
3. 步骤3

重要：
1. 必须实际检查代码/文件来验证，不能仅凭描述
2. 如果发现问题，明确列出哪些步骤未完成
3. 验证完成后，如果全部通过，必须更新 feature_list.json 中该功能的 passes 为 true
4. 最后说 "验收通过" 或 "验收未通过：原因..."
```

## Agent 模块设计

### Agent 1: Work & Journal Analyzer
- **职责**: 理解用户的工作内容，了解用户希望投稿的期刊
- **输入**: 用户的工作描述（可以是文档、代码链接、会议演讲稿等）
- **输出**: 结构化的工作摘要 + 目标期刊列表

### Agent 2: Writing Style Analyst
- **职责**: 分析目标期刊不同章节的写作风格，总结审稿人偏爱的写作路径
- **输入**: 目标期刊的多篇论文
- **输出**: 各章节（Abstract, Introduction, Method, Result, Discussion）的写作风格指南

### Agent 3: Workload Estimator
- **职责**: 评估目标期刊接收同类型工作所需工作量
- **输入**: 用户工作类型 + 目标期刊论文
- **输出**: 预估工作量（时间/复杂度）

### Agent 4: Gap Analyzer
- **职责**: 评估用户工作量与目标期刊接收所需的差距，给出具体优化建议
- **输入**: 用户当前工作量 + Agent3 评估结果
- **输出**: 差距报告 + 优化建议清单

### Agent 5: Paper Draft Writer
- **职责**: 根据 Agent2 的写作风格和路径，起草学术论文
- **输入**: 用户工作 + 写作风格指南 + 优化建议
- **输出**: 完整论文草稿

## 技术栈

- **后端**: Node.js + Express + TypeScript
- **数据库**: SQLite (sql.js)
- **前端**: HTML + Vanilla JS
- **LLM**: 通过 API 调用
- **期刊数据**: PubMed API

## 工作流程

```
User Input → Agent1 → Agent2 → Agent3 → Agent4 → Agent5 → Draft
              ↓         ↓        ↓        ↓        ↓
           [SQLite Database]
```

## 数据库表结构

| 表名 | 说明 |
|------|------|
| projects | 项目记录 |
| journals | 期刊信息 |
| journal_styles | 期刊写作风格 |
| paper_drafts | 论文草稿 |
| user_uploads | 用户上传文件 |

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/projects | 获取项目列表 |
| POST | /api/projects | 创建新项目 |
| GET | /api/journals/search | 搜索 PubMed 期刊 |
| GET | /api/journals/:pmid/abstract | 获取论文摘要 |

## 启动方式

```bash
# 方式1: 使用 init.sh
./init.sh

# 方式2: 手动启动
bun install
bun run dev
```

访问 http://localhost:3000

## 待实现

- [ ] LLM 集成
- [ ] Agent 逻辑完善
- [ ] PDF/LaTeX 导出
- [ ] 用户认证

## 已完成

- [x] 增量工作框架
- [x] Git 初始化
- [x] Feature List
- [x] Progress 追踪
- [x] PubMed API
- [x] 数据库持久化
- [x] 基础 Web UI

## Git 配置

### 远程仓库
- 地址: https://github.com/MauHex214/academic-paper-agent
- 凭证: 已存储在 `~/.git-credentials`，无需每次输入

### 提交流程
完成功能后，执行以下命令提交到 GitHub：
```bash
git add .
git commit -m "feat: 添加XXX功能"
git push
```

### 下次会话
新的对话中可以直接说 "帮我提交到 Git"，会自动使用已保存的凭证。
