# SE Agent - 软件工程智能体

基于大语言模型的需求分析与设计工具，支持VS Code扩展和命令行两种运行方式。

## 功能特性

- **多步骤分析流程**：支持6个中间步骤的顺序执行
  - ① 用例建模（梳理功能需求）
  - ② 绘制活动图（理清业务流程）
  - ③ 识别候选类（提取名词/概念）
  - ④ 分析类与关系（构建领域模型）
  - ⑤ 绘制状态机图（描述生命周期）
  - ⑥ 设计细化（转化为设计类图）
- **会话管理**：支持多会话隔离，每个会话独立保存对话历史和中间结果
- **自检机制**：步骤②、④、⑤完成后可选择启动自检流程
- **多格式输出**：支持JSON、Markdown、Mermaid等格式导出
- **双环境支持**：同时支持VS Code扩展和CLI命令行

## 支持的大语言模型

- **DeepSeek**（默认）：使用 `deepseek-chat` 模型
- **OpenAI**：使用 `gpt-4o` 模型

## 安装

### 1. 克隆仓库

```bash
git clone <repository-url>
cd SE_Course_Design
```

### 2. 安装依赖

```bash
npm install
```

### 3. 编译项目

```bash
npm run compile
```

## 配置

### VS Code 环境配置

#### 步骤 1：启动扩展开发主机
1. 在 VS Code 中打开项目目录
2. 按 `F5` 启动调试
3. 等待新窗口打开（标题栏显示 `[Extension Development Host]`）

#### 步骤 2：配置 API 密钥
1. 在**扩展开发主机窗口**中按 `Ctrl+,` 打开设置
2. **搜索 `se-agent`（小写，不带空格）**
3. 配置以下选项：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `se-agent.provider` | 模型提供商 | `deepseek` |
| `se-agent.apiKey` | API密钥 | 空（必填） |
| `se-agent.model` | 自定义模型名称 | 空（使用默认） |

### CLI 环境配置

通过环境变量配置：

```bash
# Windows PowerShell
$env:SE_AGENT_APIKEY="your-api-key"
$env:SE_AGENT_PROVIDER="deepseek"

# Linux/Mac
export SE_AGENT_APIKEY="your-api-key"
export SE_AGENT_PROVIDER="deepseek"
```

### 获取 DeepSeek API 密钥

1. 访问 [DeepSeek 平台](https://platform.deepseek.com/)
2. 注册/登录账号
3. 进入 "API Keys" 页面
4. 创建新的 API Key

## 使用方法

### 方法一：VS Code 扩展

#### 完整使用流程
1. **打开工作区**：在 VS Code 中打开项目目录
2. **启动调试**：按 `F5` 启动扩展开发主机
3. **打开需求文档**：在新窗口中打开一个 Markdown 格式的需求文档（如 `testdata/TestExample2.md`）
4. **验证扩展激活**：
   - 按 `Ctrl+Shift+P` 打开命令面板
   - 输入 `SE Agent`，应该能看到相关命令
5. **执行分析**：
   - **方式一**：右键点击编辑器 → 选择 `SE Agent: 分析并生成设计`
   - **方式二**：按 `Ctrl+Shift+P` → 输入 `SE Agent: 分析并生成设计`

#### 扩展激活说明
- 扩展会在打开 Markdown 文件时自动激活
- 激活成功后，调试控制台（`Ctrl+Shift+Y`）会显示 `SE Agent 扩展已激活`
- 如果未自动激活，可通过命令面板手动触发

### 方法二：CLI 命令行

```bash
# 创建会话并执行所有步骤
node out/cli.js start BlogSystem -f testdata/TestExample2.md

# 创建会话并执行指定步骤
node out/cli.js start BlogSystem -f testdata/TestExample2.md -s 2

# 列出所有会话
node out/cli.js list

# 继续上次会话
node out/cli.js continue

# 执行指定步骤
node out/cli.js step -s 3

# 对指定步骤进行自检
node out/cli.js selfcheck -s 2

# 查看帮助
node out/cli.js help
```

## 命令参考

### CLI 命令

| 命令 | 描述 |
|------|------|
| `start <名称> [-f <文件>] [-s <步骤>]` | 创建会话并开始分析 |
| `continue` | 继续上次会话 |
| `list` | 列出所有会话 |
| `step -s <步骤>` | 执行指定步骤 |
| `selfcheck -s <步骤>` | 对指定步骤进行自检 |
| `help` | 显示帮助信息 |

### VS Code 命令

| 命令 | 描述 |
|------|------|
| `SE Agent: 创建会话` | 基于当前文档创建新会话 |
| `SE Agent: 继续会话` | 继续之前的会话 |
| `SE Agent: 执行指定步骤` | 选择会话并执行指定步骤 |
| `SE Agent: 列出会话` | 查看所有会话 |
| `SE Agent: 分析并生成设计` | 执行完整流程 |

## 输出文件结构

每个会话的中间结果保存在独立目录中：

```
.se-agent/
└── sessions/
    └── BlogSystem-1779959560285/
        ├── 00-session-summary.md      # 会话摘要
        ├── 01-use-cases.json          # 用例建模 JSON
        ├── 01-use-cases.md            # 用例建模 Markdown
        ├── 02-activity-diagram.json   # 活动图 JSON
        ├── 02-activity-diagram.md     # 活动图 Markdown
        ├── 02-activity-diagram.mmd    # 活动图 Mermaid（非空时生成）
        ├── 03-candidate-classes.json  # 候选类 JSON
        ├── 03-candidate-classes.md    # 候选类 Markdown
        ├── 04-domain-model.json       # 领域模型 JSON
        ├── 04-domain-model.md         # 领域模型 Markdown
        ├── 04-domain-model.mmd        # 领域模型 Mermaid
        ├── 05-state-diagrams.json     # 状态机图 JSON
        ├── 05-state-diagrams.md       # 状态机图 Markdown
        ├── 05-state-diagrams.mmd      # 状态机图 Mermaid
        ├── 06-design-class-diagram.json # 设计类图 JSON
        ├── 06-design-class-diagram.md   # 设计类图 Markdown
        └── 06-design-class-diagram.mmd  # 设计类图 Mermaid
```

## 项目结构

```
.
├── src/
│   ├── extension.ts                  # VS Code扩展入口
│   ├── cli.ts                        # CLI命令行入口
│   └── services/
│       ├── analysisFlow.ts           # 分析流程控制
│       ├── fileExporter.ts           # 文件导出服务
│       ├── llmService.ts             # 大语言模型服务
│       └── sessionService.ts         # 会话管理服务
├── testdata/                         # 测试数据
│   └── TestExample2.md               # 示例需求文档
├── package.json                      # 项目配置
├── tsconfig.json                     # TypeScript配置
└── README.md
```

## 自检机制

在步骤②（活动图）、④（类与关系）、⑤（状态机图）完成后，系统会询问是否启动自检流程：

- **自检功能**：调用大模型检查上一步输出是否存在错误
- **检查维度**：
  1. 是否符合需求文档
  2. 是否存在逻辑错误
  3. 是否有遗漏的重要信息
  4. 是否有不合理的设计
- **输出格式**：JSON 格式，包含 `isValid` 和 `suggestions` 字段

## 会话隔离

每个测试用例都有独立的会话ID，会话之间相互隔离：
- 不同用例的对话历史不会混淆
- 每个会话有独立的中间结果存储
- 支持同时处理多个需求文档

## 故障排除

### 问题1：扩展未激活，右键菜单不显示

**可能原因**：
1. 未在扩展开发主机窗口中操作
2. 未打开 Markdown 文件
3. 编译错误

**解决方案**：
1. 确保在标题栏显示 `[Extension Development Host]` 的窗口中操作
2. 打开一个 `.md` 文件（如 `testdata/TestExample2.md`）
3. 按 `Ctrl+Shift+P` 输入 `SE Agent` 验证命令是否存在
4. 检查调试控制台（`Ctrl+Shift+Y`）是否显示 `SE Agent 扩展已激活`
5. 重新编译：`npm run compile`

### 问题2：配置项找不到

**解决方案**：
1. 在**扩展开发主机窗口**中按 `Ctrl+,` 打开设置
2. **搜索 `se-agent`（小写，不带空格）**，不要搜索 `SE Agent Configuration`
3. 如果仍然找不到，手动编辑 `settings.json`：
   ```json
   {
     "se-agent.provider": "deepseek",
     "se-agent.apiKey": "your-api-key"
   }
   ```

### 问题3：CLI 运行时报错 "Cannot find module 'vscode'"

**解决方案**：项目已修复此问题，确保使用最新代码并重新编译。

### 问题4：无输出文件，未响应

**可能原因**：

1. **未配置API密钥**
   - 解决方案：配置环境变量 `SE_AGENT_APIKEY` 或VS Code设置 `se-agent.apiKey`

2. **网络连接问题**
   - 解决方案：检查网络连接，确保可以访问 `https://api.deepseek.com`

3. **API密钥无效或额度不足**
   - 解决方案：检查DeepSeek平台的API密钥状态和余额

### 问题5：输出文件格式不正确

**可能原因**：

1. **需求文档格式不规范**
   - 解决方案：参考 `testdata/TestExample2.md` 的格式编写需求文档

2. **模型响应格式异常**
   - 解决方案：检查会话目录中的 JSON 文件查看原始响应

### 问题6：步骤2导出失败

**解决方案**：确保需求文档包含完整的业务流程描述，避免空的活动图输出。

### 问题7：无法启动扩展开发主机

**解决方案**：
1. 确保已安装依赖：`npm install`
2. 确保已编译：`npm run compile`
3. 检查 `.vscode/launch.json` 配置是否正确
4. 尝试重启 VS Code

## 技术栈

- TypeScript
- VS Code Extension API
- OpenAI SDK（兼容DeepSeek API）
- Mermaid

## 许可证

MIT
