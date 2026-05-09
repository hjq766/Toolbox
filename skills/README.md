# jqnest Skills

> 本目录遵循 [Anthropic Claude Skills](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/overview) 规范，将 jqnest 工具箱的开发能力包装成可被 AI agent 按需调用的 **Skill**。

---

## 这是什么？

**Skill** 是 Anthropic 在 2025 年推出的概念：一个文件夹，封装了特定领域的知识、代码模板、可执行脚本，供 Claude 等 agent 在匹配场景时**按需调用**。

与「规则/instructions」的区别：

| 维度 | Rules（如 `.cursor/rules/`） | Skills（本目录） |
|---|---|---|
| 形态 | 单文件 md | 文件夹 + 多文件 |
| 加载 | 全量注入上下文 | 按 description 匹配后加载 |
| 能力 | 纯文字约束 | 带模板 + 可执行脚本 |
| 上下文开销 | 高（始终占用） | 低（扫描时仅读 frontmatter） |

---

## 目录内容

```text
skills/
└─ jqnest-tool-builder/            jqnest 工具改版/新增的一站式 skill
   ├─ SKILL.md                     主入口（带 frontmatter，Claude 首读）
   ├─ reference/                   深度资料（需要细节时读）
   ├─ assets/templates/            代码模板（创建新工具时复制改造）
   └─ scripts/                     shell 脚本（脚手架、验证）
```

---

## 如何使用

### 方式 1：Claude Code (CLI)

```bash
# 项目级（优先级最高，仅此项目生效）
# 本项目已自带 ./skills/，Claude Code 启动时自动发现

claude
# 进入对话后，Claude 会扫描 ./skills/*/SKILL.md 的 frontmatter
# 当用户需求命中 description 时，自动加载对应 skill

# 全局级（所有项目都能用）
mkdir -p ~/.claude/skills
ln -s "$(pwd)/skills/jqnest-tool-builder" ~/.claude/skills/
```

### 方式 2：Claude Agent SDK

```python
from claude_agent_sdk import Agent, load_skills

agent = Agent(
    model="claude-sonnet-4-5",
    skills=load_skills("./skills"),   # 自动扫描所有子文件夹
)

response = agent.run("帮我按规范重构 convert_volume 工具")
# agent 会自动从 jqnest-tool-builder 调出相关 reference / templates
```

### 方式 3：Claude API（手动）

```python
import anthropic
from pathlib import Path

# 读取 frontmatter + SKILL.md 注入 system prompt
skill_md = Path("skills/jqnest-tool-builder/SKILL.md").read_text()

client = anthropic.Anthropic()
msg = client.messages.create(
    model="claude-sonnet-4-5",
    system=f"You have access to the following skill:\n\n{skill_md}",
    messages=[{"role": "user", "content": "改版 convert_volume"}],
    tools=[{"type": "bash_20250124"}, {"type": "text_editor_20250124"}],
)
```

### 方式 4：Claude Desktop / Claude.ai

当前（2026-04）Claude Desktop 已支持 Skills。将 `jqnest-tool-builder/` 压缩为 zip 后通过"Skills"入口上传。

---

## Skill 运行原理（Progressive Disclosure）

```text
┌──────────────────────────────────────────────────────────┐
│ 1. Agent 启动                                             │
│    扫描所有 SKILL.md 的 frontmatter                       │
│    ~50 token/skill，可装备数十上百个                      │
└──────────────────────┬───────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────┐
│ 2. 用户发出请求                                           │
│    "帮我改版 images_flip 工具"                             │
└──────────────────────┬───────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────┐
│ 3. Agent 匹配 description                                 │
│    发现 jqnest-tool-builder 的 description 命中           │
│    完整读取 SKILL.md（主流程 + 索引）                      │
└──────────────────────┬───────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────┐
│ 4. 按 SKILL.md 指引按需加载                                │
│    读 reference/tool-types.md 查 9.3 图片工具模板          │
│    读 assets/templates/image-tool/ 拿起步代码              │
│    调 scripts/check_skeleton.sh 验证产出                   │
└──────────────────────────────────────────────────────────┘
```

**核心优势**：上下文里永远只有"当下需要"的内容，不会被无关资料撑爆。

---

## 与项目其他规范文件的关系

| 文件 | 服务对象 | 机制 |
|---|---|---|
| `skills/jqnest-tool-builder/` | **Claude Code / Agent SDK / Desktop** | 真正的 Skill（progressive disclosure） |
| `SKILL.md`（根目录） | 人类开发者 / 通用 AI | 开发规范总览（一次性阅读） |
| `AGENTS.md` | Codex / OpenAI Agents | agents.md 约定 |
| `.cursor/rules/` | Cursor | Cursor 规则系统 |
| `.github/copilot-instructions.md` | GitHub Copilot | Copilot 项目指令 |
| `.windsurf/workflows/` | Windsurf | 斜杠命令工作流 |

**单一数据源仍是 `SKILL.md` + `v2/docs/DEVELOPMENT.md`**。Skill 的 reference/ 内容精简自这两个文档，保持同步。

---

## 后续计划

- [ ] 对每个改版场景验证 skill 触发准确度
- [ ] 丰富 `assets/templates/` 覆盖更多工具类型
- [ ] `scripts/` 增加自动化验收脚本
- [ ] 考虑拆分为 `refactor-tool` 和 `create-tool` 两个独立 skill（如果单 skill description 过于宽泛导致匹配不准）
