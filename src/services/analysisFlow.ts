import { createLLMClient, getModelName } from './llmService';
import { sessionManager, Session, AnalysisStep } from './sessionService';
import { FileExporter } from './fileExporter';

const STEP_PROMPTS: Record<number, string> = {
  1: `你是一位资深的软件需求分析师。请对以下需求文档进行用例建模：

需求文档：
{requirements}

请输出用例列表，每个用例包含：用例名称、描述、参与者、前置条件、后置条件、基本流程。

格式要求：JSON格式输出`,

  2: `基于之前的用例分析结果，请绘制活动图来理清业务流程。

要求：
1. 选择2-3个核心业务流程
2. 使用Mermaid flowchart语法输出
3. 包含分支判断和循环

格式要求：JSON格式，包含 activityDiagram 和 description 字段`,

  3: `基于需求文档和之前的分析，请识别候选类（提取名词/概念）。

需求文档：
{requirements}

要求：
1. 识别主要的领域实体
2. 列出每个类的核心属性
3. 简要说明每个类的职责

格式要求：JSON格式输出`,

  4: `基于之前识别的候选类，请分析类与类之间的关系，构建领域模型。

要求：
1. 分析继承关系（泛化）
2. 分析关联关系
3. 分析聚合/组合关系
4. 识别多重性约束

格式要求：JSON格式输出，包含 classDiagram（Mermaid语法）和 relationships 字段`,

  5: `基于领域模型，请为关键对象绘制状态机图，描述其生命周期。

要求：
1. 选择2-3个关键对象
2. 描述对象的状态转换
3. 使用Mermaid stateDiagram-v2语法

格式要求：JSON格式输出，包含 stateDiagrams 数组`,

  6: `基于之前的分析结果，请进行设计细化，转化为设计类图。

要求：
1. 补充类的方法
2. 添加属性和方法的可见性（public/private/protected）
3. 完善类之间的关系
4. 使用Mermaid classDiagram语法

格式要求：JSON格式输出，包含 classDiagram 和 summary 字段`,
};

const SELF_CHECK_PROMPT = `请检查以下分析结果是否存在错误：

分析步骤：{stepName}
分析结果：
{result}

请从以下方面进行检查：
1. 是否符合需求文档
2. 是否存在逻辑错误
3. 是否有遗漏的重要信息
4. 是否有不合理的设计

请输出检查结果和改进建议。JSON格式输出，包含 isValid 和 suggestions 字段。`;

export interface UICallbacks {
  showInfo?: (message: string) => void;
  showError?: (message: string) => void;
  showWarning?: (message: string) => void;
  promptSelfCheck?: (stepId: number, stepName: string) => Promise<boolean>;
  promptEndSession?: () => Promise<boolean>;
}

export class AnalysisFlow {
  private session: Session;
  private callbacks: UICallbacks;

  constructor(sessionId: string, callbacks: UICallbacks = {}) {
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      throw new Error(`会话不存在: ${sessionId}`);
    }
    this.session = session;
    this.callbacks = {
      showInfo: callbacks.showInfo || console.log,
      showError: callbacks.showError || console.error,
      showWarning: callbacks.showWarning || console.warn,
      promptSelfCheck: callbacks.promptSelfCheck || (async () => false),
    };
  }

  getSession(): Session {
    return this.session;
  }

  async runStep(stepId: number): Promise<AnalysisStep | null> {
    if (stepId < 1 || stepId > 6) {
      throw new Error('无效的步骤编号');
    }

    const step = this.session.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`步骤不存在: ${stepId}`);
    }

    try {
      const client = await createLLMClient();
      const model = await getModelName();

      let prompt = STEP_PROMPTS[stepId];
      prompt = prompt.replace('{requirements}', this.session.requirements);

      const messages = [
        ...this.session.messages,
        { role: 'user', content: prompt } as const
      ];

      this.callbacks.showInfo!(`步骤 ${stepId}: ${step.name} - 正在调用 ${model} 模型...`);

      const response = await client.chat.completions.create({
        model,
        messages,
        temperature: 0.3,
      });

      const content = response.choices[0].message.content || '';

      sessionManager.addMessage(this.session.id, 'user', prompt);
      sessionManager.addMessage(this.session.id, 'assistant', content);
      sessionManager.updateStep(this.session.id, stepId, content, 'completed');

      if (this.session.sessionDir) {
        try {
          const exporter = new FileExporter(this.session.sessionDir);
          exporter.exportStep(step, 'json');
          exporter.exportStep(step, 'md');
          if ([2, 4, 5, 6].includes(stepId)) {
            const mmdFile = exporter.exportStep(step, 'mmd');
            if (mmdFile) {
              this.callbacks.showInfo!(`Mermaid 图表已导出到: ${mmdFile}`);
            }
          }
        } catch (error) {
          console.error('导出步骤文件失败:', error);
        }
      }

      this.callbacks.showInfo!(`步骤 ${stepId}: ${step.name} - 完成`);
      return step;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      sessionManager.updateStep(this.session.id, stepId, '', 'error');
      this.callbacks.showError!(`步骤 ${stepId}: ${step.name} 失败: ${errorMessage}`);
      return null;
    }
  }

  async runSelfCheck(stepId: number): Promise<boolean> {
    const step = this.session.steps.find(s => s.id === stepId);
    if (!step || step.status !== 'completed') {
      throw new Error('无法对未完成的步骤进行自检');
    }

    try {
      const client = await createLLMClient();
      const model = await getModelName();

      const prompt = SELF_CHECK_PROMPT
        .replace('{stepName}', step.name)
        .replace('{result}', step.result);

      const messages = [
        ...this.session.messages,
        { role: 'user', content: prompt } as const
      ];

      this.callbacks.showInfo!(`步骤 ${stepId}: ${step.name} - 正在进行自检...`);

      const response = await client.chat.completions.create({
        model,
        messages,
        temperature: 0.3,
      });

      const content = response.choices[0].message.content || '';

      sessionManager.addMessage(this.session.id, 'user', prompt);
      sessionManager.addMessage(this.session.id, 'assistant', content);
      sessionManager.setSelfChecked(this.session.id, stepId, true);

      try {
        const result = JSON.parse(content);
        if (result.isValid) {
          this.callbacks.showInfo!(`自检通过！`);
          if (result.suggestions && result.suggestions.length > 0) {
            this.callbacks.showInfo!(`建议: ${result.suggestions.join('; ')}`);
          }
          return true;
        } else {
          this.callbacks.showWarning!(`自检发现问题: ${result.suggestions?.join('; ') || '未知问题'}`);
          return false;
        }
      } catch {
        this.callbacks.showInfo!(`自检完成: ${content.substring(0, 100)}...`);
        return true;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.callbacks.showError!(`自检失败: ${errorMessage}`);
      return false;
    }
  }

  async runAllSteps(skipSelfCheck = false): Promise<void> {
    for (let stepId = 1; stepId <= 6; stepId++) {
      const result = await this.runStep(stepId);
      if (!result) {
        break;
      }

      if (!skipSelfCheck && [2, 4, 5].includes(stepId)) {
        const shouldCheck = await this.callbacks.promptSelfCheck!(stepId, result.name);
        if (shouldCheck) {
          await this.runSelfCheck(stepId);
        }
      }
    }

    const allCompleted = this.session.steps.every(step => step.status === 'completed');
    if (allCompleted) {
      this.callbacks.showInfo!('所有步骤已完成！');

      if (this.session.sessionDir) {
        try {
          const exporter = new FileExporter(this.session.sessionDir);
          exporter.exportSessionSummary(this.session);
          this.callbacks.showInfo!(`会话摘要已保存到: ${this.session.sessionDir}/00-session-summary.md`);
        } catch (error) {
          console.error('导出会话摘要失败:', error);
        }
      }

      const shouldEnd = await this.callbacks.promptEndSession!();
      if (shouldEnd) {
        this.callbacks.showInfo!('会话已结束');
      }
    }
  }
}
