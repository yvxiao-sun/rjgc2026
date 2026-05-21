import * as vscode from 'vscode';
import { createLLMClient, getModelName } from './llmService';
import type { AnalysisResult } from './analysisService';

export interface DesignResult {
  classDiagram: string;
  activityDiagram: string;
  stateMachineDiagram?: string;
  componentDiagram?: string;
  designSummary: string;
  rawContent?: string;
}

export async function generateDesign(requirements: string, analysisResult?: AnalysisResult): Promise<DesignResult> {
  try {
    const config = vscode.workspace.getConfiguration('se-agent');
    const outputFormat = config.get<string>('outputFormat') || 'mermaid';
    
    const client = await createLLMClient();
    const model = await getModelName();

    const analysisInfo = analysisResult ? `

需求分析结果：
- 参与者：${analysisResult.actors.join(', ')}
- 领域实体：${analysisResult.domainEntities.join(', ')}
- 用例：${analysisResult.useCases.map(uc => uc.name).join(', ')}
` : '';

    const formatInstructions = outputFormat === 'mermaid' 
      ? `请使用Mermaid语法：
- 类图使用 classDiagram
- 活动图使用 flowchart`
      : `请使用PlantUML语法：
- 类图使用 class 关键字
- 活动图使用 start/end/if 关键字`;

    const prompt = `
你是一位资深的软件架构师。请根据以下需求文档生成系统设计模型。

${analysisInfo}

需求文档：
${requirements}

${formatInstructions}

请按照以下JSON格式输出：
{
  "classDiagram": "类图内容",
  "activityDiagram": "活动图内容",
  "designSummary": "设计摘要"
}

请确保JSON格式正确，图表语法完整可渲染。
  `.trim();

    vscode.window.showInformationMessage(`正在调用 ${model} 模型生成设计...`);

    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content || '';
    
    if (!content.trim()) {
      throw new Error('模型返回空内容');
    }

    vscode.window.showInformationMessage('模型响应成功，正在解析设计结果...');
    const result = parseDesignResult(content);
    
    if (!result.classDiagram && !result.activityDiagram) {
      throw new Error('未能解析出有效的图表内容');
    }
    
    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`设计生成失败: ${errorMessage}`);
    throw error;
  }
}

function parseDesignResult(content: string): DesignResult {
  // 尝试提取JSON部分
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  
  if (jsonMatch) {
    try {
      const jsonContent = jsonMatch[0];
      const parsed = JSON.parse(jsonContent);
      
      return {
        classDiagram: parsed.classDiagram || '',
        activityDiagram: parsed.activityDiagram || '',
        stateMachineDiagram: parsed.stateMachineDiagram,
        componentDiagram: parsed.componentDiagram,
        designSummary: parsed.designSummary || '',
        rawContent: content
      };
    } catch (e) {
      vscode.window.showWarningMessage('JSON解析失败，尝试备用解析方法');
    }
  }
  
  // 备用解析方法 - 提取Mermaid/PlantUML图表
  return parseTextFormat(content);
}

function parseTextFormat(content: string): DesignResult {
  const result: DesignResult = {
    classDiagram: '',
    activityDiagram: '',
    designSummary: '',
    rawContent: content
  };

  // 提取类图
  const classStart = content.indexOf('classDiagram');
  const classEnd = content.indexOf('```', classStart + 1);
  if (classStart !== -1) {
    result.classDiagram = content.substring(classStart, classEnd !== -1 ? classEnd : content.length).trim();
  }

  // 如果没有找到classDiagram，尝试找class关键字的类图
  if (!result.classDiagram) {
    const classDefStart = content.indexOf('class ');
    if (classDefStart !== -1) {
      let endIndex = content.indexOf('```', classDefStart + 1);
      if (endIndex === -1) endIndex = content.length;
      result.classDiagram = content.substring(classDefStart, endIndex).trim();
    }
  }

  // 提取活动图
  const flowStart = content.indexOf('flowchart');
  const flowEnd = content.indexOf('```', flowStart + 1);
  if (flowStart !== -1) {
    result.activityDiagram = content.substring(flowStart, flowEnd !== -1 ? flowEnd : content.length).trim();
  }

  // 如果没有找到flowchart，尝试找stateDiagram
  if (!result.activityDiagram) {
    const stateStart = content.indexOf('stateDiagram');
    const stateEnd = content.indexOf('```', stateStart + 1);
    if (stateStart !== -1) {
      result.activityDiagram = content.substring(stateStart, stateEnd !== -1 ? stateEnd : content.length).trim();
    }
  }

  // 如果没有找到Mermaid格式，尝试找PlantUML格式
  if (!result.activityDiagram) {
    const startIndex = content.indexOf('@startuml');
    const endIndex = content.indexOf('@enduml');
    if (startIndex !== -1 && endIndex !== -1) {
      if (!result.classDiagram) {
        result.classDiagram = content.substring(startIndex, endIndex + 7).trim();
      } else {
        result.activityDiagram = content.substring(startIndex, endIndex + 7).trim();
      }
    }
  }

  // 提取设计摘要
  const summaryStart = content.indexOf('设计摘要');
  if (summaryStart !== -1) {
    let summaryEnd = content.indexOf('```', summaryStart);
    if (summaryEnd === -1) summaryEnd = content.length;
    result.designSummary = content.substring(summaryStart + 4, summaryEnd).trim();
  }

  // 如果没有找到设计摘要，取最后一部分
  if (!result.designSummary) {
    const lines = content.split('\n');
    let summaryLines: string[] = [];
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line && !line.startsWith('```') && !line.startsWith('classDiagram') && !line.startsWith('flowchart')) {
        summaryLines.unshift(line);
        if (summaryLines.length >= 5) break;
      } else if (line.startsWith('```')) {
        break;
      }
    }
    result.designSummary = summaryLines.join('\n').trim();
  }

  return result;
}
