import * as vscode from 'vscode';
import { createLLMClient, getModelName } from './llmService';

export interface AnalysisResult {
  actors: string[];
  useCases: UseCase[];
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  domainEntities: string[];
  summary: string;
  rawContent?: string;
}

export interface UseCase {
  name: string;
  description: string;
  actor: string;
  preconditions: string[];
  postconditions: string[];
  steps: string[];
}

export async function analyzeRequirements(requirements: string): Promise<AnalysisResult> {
  try {
    const client = await createLLMClient();
    const model = await getModelName();

    const prompt = `
你是一位资深的软件需求分析师。请对以下需求文档进行全面分析：

需求文档内容：
${requirements}

请按照以下JSON格式输出分析结果：
{
  "actors": ["参与者1", "参与者2"],
  "useCases": [
    {
      "name": "用例名称",
      "description": "用例描述",
      "actor": "参与者",
      "preconditions": ["前置条件1", "前置条件2"],
      "postconditions": ["后置条件1", "后置条件2"],
      "steps": ["步骤1", "步骤2", "步骤3"]
    }
  ],
  "functionalRequirements": ["功能需求1", "功能需求2"],
  "nonFunctionalRequirements": ["非功能需求1", "非功能需求2"],
  "domainEntities": ["实体1", "实体2"],
  "summary": "分析摘要"
}

请确保JSON格式正确，无需其他解释文字。
  `.trim();

    vscode.window.showInformationMessage(`正在调用 ${model} 模型进行需求分析...`);

    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content || '';

    if (!content.trim()) {
      throw new Error('模型返回空内容');
    }

    vscode.window.showInformationMessage('模型响应成功，正在解析结果...');
    const result = parseAnalysisResult(content);

    if (!result.actors.length && !result.useCases.length && !result.functionalRequirements.length) {
      throw new Error('解析结果为空，请检查输入格式');
    }

    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`需求分析失败: ${errorMessage}`);
    throw error;
  }
}

function parseAnalysisResult(content: string): AnalysisResult {
  // 尝试提取JSON部分
  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if (jsonMatch) {
    try {
      const jsonContent = jsonMatch[0];
      const parsed = JSON.parse(jsonContent);

      return {
        actors: parsed.actors || [],
        useCases: parsed.useCases || [],
        functionalRequirements: parsed.functionalRequirements || [],
        nonFunctionalRequirements: parsed.nonFunctionalRequirements || [],
        domainEntities: parsed.domainEntities || [],
        summary: parsed.summary || '',
        rawContent: content
      };
    } catch (e) {
      // JSON解析失败，尝试其他方法
      vscode.window.showWarningMessage('JSON解析失败，尝试备用解析方法');
    }
  }

  // 备用解析方法 - 基于文本格式
  return parseTextFormat(content);
}

function parseTextFormat(content: string): AnalysisResult {
  const lines = content.split('\n');
  const result: AnalysisResult = {
    actors: [],
    useCases: [],
    functionalRequirements: [],
    nonFunctionalRequirements: [],
    domainEntities: [],
    summary: '',
    rawContent: content
  };

  let currentSection = '';
  let currentUseCase: Partial<UseCase> = {};
  let inUseCase = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine) continue;

    // 检测章节
    if (trimmedLine.startsWith('1.') || trimmedLine.includes('参与者') || trimmedLine.includes('Actors')) {
      if (!trimmedLine.includes('用例') && !trimmedLine.includes('需求')) {
        currentSection = 'actors';
        inUseCase = false;
      }
    } else if (trimmedLine.startsWith('2.') || trimmedLine.includes('用例') || trimmedLine.includes('Use Case')) {
      currentSection = 'useCases';
      inUseCase = false;
    } else if (trimmedLine.startsWith('3.') || trimmedLine.includes('功能需求') || trimmedLine.includes('Functional')) {
      currentSection = 'functionalRequirements';
      inUseCase = false;
    } else if (trimmedLine.startsWith('4.') || trimmedLine.includes('非功能需求') || trimmedLine.includes('Non-functional')) {
      currentSection = 'nonFunctionalRequirements';
      inUseCase = false;
    } else if (trimmedLine.startsWith('5.') || trimmedLine.includes('领域实体') || trimmedLine.includes('Entities')) {
      currentSection = 'domainEntities';
      inUseCase = false;
    } else if (trimmedLine.startsWith('6.') || trimmedLine.includes('分析摘要') || trimmedLine.includes('Summary')) {
      currentSection = 'summary';
      inUseCase = false;
    } else if (trimmedLine.match(/^\d+\.\s*[\u4e00-\u9fa5a-zA-Z]+/)) {
      // 检测用例名称
      if (inUseCase && currentUseCase.name) {
        result.useCases.push(currentUseCase as UseCase);
      }
      currentUseCase = { name: trimmedLine.replace(/^\d+\.\s*/, '').trim() };
      inUseCase = true;
    } else if (trimmedLine.includes('：') || trimmedLine.includes(':')) {
      // 检测键值对
      const parts = trimmedLine.split(/：|:/);
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join(':').trim();
        if (inUseCase && currentUseCase) {
          switch (key) {
            case '描述':
            case 'Description':
              currentUseCase.description = value;
              break;
            case '参与者':
            case 'Actor':
              currentUseCase.actor = value;
              break;
            case '前置条件':
            case 'Preconditions':
              currentUseCase.preconditions = value ? value.split(/[；;，,]/).map(s => s.trim()).filter(s => s) : [];
              break;
            case '后置条件':
            case 'Postconditions':
              currentUseCase.postconditions = value ? value.split(/[；;，,]/).map(s => s.trim()).filter(s => s) : [];
              break;
            case '基本流程':
            case 'Steps':
              currentUseCase.steps = [];
              break;
          }
        }
      }
    } else if (trimmedLine.match(/^\s*[\d-*+]\s/)) {
      // 检测列表项
      const item = trimmedLine.replace(/^\s*[\d-*+]\s*/, '').trim();
      if (!item) continue;

      if (inUseCase && currentUseCase.steps) {
        currentUseCase.steps.push(item);
      } else if (!inUseCase && currentSection) {
        switch (currentSection) {
          case 'actors':
            result.actors.push(item);
            break;
          case 'functionalRequirements':
            result.functionalRequirements.push(item);
            break;
          case 'nonFunctionalRequirements':
            result.nonFunctionalRequirements.push(item);
            break;
          case 'domainEntities':
            result.domainEntities.push(item);
            break;
        }
      }
    } else if (currentSection === 'summary') {
      result.summary += (result.summary ? '\n' : '') + trimmedLine;
    } else if (!inUseCase && currentSection === 'actors' && !trimmedLine.match(/^\d/)) {
      // 处理没有编号的参与者
      result.actors.push(trimmedLine);
    }
  }

  if (inUseCase && currentUseCase.name) {
    result.useCases.push(currentUseCase as UseCase);
  }

  return result;
}
