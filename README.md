# SE Agent - 软件工程智能体

基于大语言模型的需求分析与设计工具，作为VSCode插件提供服务。

## 功能特性

- **需求分析**：根据需求文档自动识别参与者、用例、功能需求、非功能需求和领域实体
- **设计生成**：自动生成类图和活动图，支持Mermaid和PlantUML格式
- **一键分析设计**：完整的分析+设计流程

## 支持的大语言模型

- **DeepSeek**（默认）：使用 `deepseek-chat` 模型
- **OpenAI**：使用 `gpt-4o` 模型

## 安装

1. 克隆仓库：`git clone <repository-url>`
2. 安装依赖：`npm install`
3. 编译扩展：`npm run compile`
4. 在VSCode中按F5启动调试

## 配置

在VSCode中按 `Ctrl+,` 打开设置，搜索 "SE Agent Configuration"：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `se-agent.provider` | 模型提供商 | `deepseek` |
| `se-agent.apiKey` | API密钥 | 空（必填） |
| `se-agent.model` | 自定义模型名称 | 空（使用默认） |
| `se-agent.outputFormat` | 输出格式 | `mermaid` |
| `se-agent.outputDirectory` | 输出目录 | `./design-output` |

### 获取 DeepSeek API 密钥

1. 访问 [DeepSeek 平台](https://platform.deepseek.com/)
2. 注册/登录账号
3. 进入 "API Keys" 页面
4. 创建新的 API Key

## 使用方法

1. **打开工作区**：确保已打开一个VSCode工作区（不是单独文件）
2. **打开需求文档**：打开一个Markdown格式的需求文档
3. **执行命令**：
   - 右键菜单选择 "SE Agent: 分析并生成设计"
   - 或按 `Ctrl+Shift+P` 打开命令面板，输入 `SE Agent`

## 命令

| 命令 | 描述 |
|------|------|
| `se-agent.analyze` | 仅执行需求分析 |
| `se-agent.design` | 仅生成设计模型 |
| `se-agent.analyzeAndDesign` | 执行完整的分析+设计流程 |

## 项目结构

```
.
├── src/
│   ├── extension.ts          # 扩展入口
│   ├── services/
│   │   ├── analysisService.ts    # 需求分析服务
│   │   ├── designService.ts      # 设计生成服务
│   │   └── llmService.ts         # 大语言模型服务
│   ├── utils/
│   │   └── fileWriter.ts         # 文件写入工具
│   └── test/                     # 测试代码
├── testdata/              # 测试数据
├── package.json           # 扩展配置
├── tsconfig.json          # TypeScript配置
└── README.md
```

## 故障排除

### 问题1：无输出文件，未响应

**可能原因**：

1. **未配置API密钥**
   - 解决方案：在VSCode设置中配置 `se-agent.apiKey`

2. **未打开工作区**
   - 解决方案：需要打开一个VSCode工作区（File > Open Folder），不能只打开单个文件

3. **网络连接问题**
   - 解决方案：检查网络连接，确保可以访问 `https://api.deepseek.com`

4. **API密钥无效或额度不足**
   - 解决方案：检查DeepSeek平台的API密钥状态和余额

### 问题2：命令执行后无任何提示

**可能原因**：

1. **扩展未正确激活**
   - 解决方案：重启VSCode调试环境（按F5重新启动）

2. **需求文档内容为空**
   - 解决方案：确保打开的Markdown文件包含有效的需求内容

### 问题3：输出文件为空或格式不正确

**可能原因**：

1. **模型响应解析失败**
   - 解决方案：检查输出目录中的日志信息

2. **需求文档格式不规范**
   - 解决方案：参考 `testdata/requirements-example.md` 的格式编写需求文档

## 技术栈

- TypeScript
- VSCode Extension API
- OpenAI SDK（兼容DeepSeek API）
- Mermaid / PlantUML

## 许可证

MIT
