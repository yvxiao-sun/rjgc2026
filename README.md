# rjgc2026
# 项目文件结构
se-agent/
│
├── README.md                          # 项目说明：环境搭建、运行命令、示例
├── requirements.txt                   # Python依赖清单
├── setup.py                           # 安装配置（可选，用于IDE集成时定位路径）
├── .gitignore                         # Git忽略规则
├── .env.example                       # 环境变量模板（API密钥等）
│
├── src/                               # 源代码主目录
│   ├── __init__.py
│   │
│   ├── main.py                        # CLI主入口，解析参数并调用编排器
│   │
│   ├── cli/                           # CLI命令行接口模块
│   │   ├── __init__.py
│   │   └── arg_parser.py             # argparse参数定义与校验
│   │
│   ├── orchestration/                 # 任务编排引擎模块（自研核心）
│   │   ├── __init__.py
│   │   ├── orchestrator.py           # AgentOrchestrator：创建Crew，调度执行
│   │   ├── context_manager.py        # ContextManager：全局上下文存取
│   │   └── crew_config.py           # CrewAI的Crew、Agent、Task定义
│   │
│   ├── agents/                        # 智能体模块（自研Agent实现）
│   │   ├── __init__.py
│   │   ├── base_agent.py             # BaseSEAgent：Agent基类
│   │   ├── req_agent.py              # 需求分析Agent
│   │   ├── design_agent.py           # 设计生成Agent
│   │   └── validator_agent.py        # 设计验证Agent
│   │
│   ├── tools/                         # 工具模块（自研工具集）
│   │   ├── __init__.py
│   │   ├── prd_parser.py             # PRD解析器（规则+LLM混合）
│   │   ├── uml_generator.py          # UML代码生成器（PlantUML/Mermaid）
│   │   ├── file_handler.py           # 文件读写、输出目录管理
│   │   └── llm_client.py            # LLM API调用封装（DeepSeek适配）
│   │
│   ├── prompts/                       # 提示词模板目录
│   │   ├── __init__.py
│   │   ├── prompt_loader.py          # 提示词加载与管理
│   │   ├── req_analysis.yaml         # 需求分析提示词模板（含few-shot示例）
│   │   ├── design_generation.yaml    # 设计生成提示词模板
│   │   └── design_validation.yaml    # 设计验证提示词模板
│   │
│   └── utils/                         # 通用工具
│       ├── __init__.py
│       ├── config.py                  # 配置加载（从.env与settings.yaml读取）
│       ├── logger.py                  # 日志配置
│       └── exceptions.py             # 自定义异常类
│
├── config/                            # 全局配置文件
│   └── settings.yaml                  # LLM参数、默认路径、重试策略等
│
├── tests/                             # 测试目录
│   ├── __init__.py
│   ├── conftest.py                    # pytest共享fixture
│   ├── test_prd_parser.py            # PRD解析器单元测试
│   ├── test_uml_generator.py         # UML生成器单元测试
│   ├── test_context_manager.py       # 上下文管理器单元测试
│   ├── test_orchestrator.py          # 编排器集成测试
│   ├── test_agents_integration.py    # Agent集成测试
│   └── test_e2e.py                   # 端到端测试（模拟CLI完整流程）
│
├── benchmark/                         # 基准测试目录
│   ├── README.md                      # 基准测试说明
│   ├── cases/                         # 测试用例PRD文件（≥5个）
│   │   ├── case1_blog_system.md
│   │   ├── case2_ecommerce.md
│   │   ├── case3_library_mgmt.md
│   │   ├── case4_online_exam.md
│   │   └── case5_hr_system.md
│   ├── expected/                      # 期望输出（人工标注的参考结果）
│   │   ├── case1_expected/
│   │   └── ...
│   ├── evaluate.py                    # 自动评估脚本（计算成功率）
│   └── run_benchmark.sh              # 一键批量运行脚本
│
├── ide-plugin/                        # VSCode插件目录
│   ├── package.json                   # 插件清单
│   ├── extension.js                   # 插件主入口（右键菜单、快捷键触发）
│   ├── .vscodeignore
│   └── README.md                      # 插件安装与使用说明
│
├── docs/                              # 项目文档（交付物源文件）
│   ├── design.md                      # 系统设计方案（本文件源稿）
│   ├── technical_report.md           # 工作原理技术报告
│   ├── test_report.md                # 测试方案与报告
│   └── user_guide.md                 # 使用说明与应用案例
│
├── examples/                          # 示例案例（用于演示的完整输入输出）
│   ├── case_study_1/
│   │   ├── requirements.md           # 输入PRD
│   │   └── output/                   # 生成的类图、活动图、状态机图
│   └── case_study_2/
│       ├── requirements.md
│       └── output/
│
└── scripts/                           # 辅助脚本
    ├── setup_env.sh                   # 一键环境配置脚本
    └── run_demo.sh                    # 快速演示脚本
