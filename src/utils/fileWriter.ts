import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import type { AnalysisResult } from '../services/analysisService';
import type { DesignResult } from '../services/designService';

export async function writeOutputFiles(type: 'analysis' | 'design', data: AnalysisResult | DesignResult): Promise<void> {
  try {
    const config = vscode.workspace.getConfiguration('se-agent');
    const outputDir = config.get<string>('outputDirectory') || './design-output';
    
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      throw new Error('请先打开一个工作区');
    }

    const basePath = path.join(workspaceFolders[0].uri.fsPath, outputDir);
    
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
      vscode.window.showInformationMessage(`创建输出目录: ${basePath}`);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    if (type === 'analysis') {
      const analysis = data as AnalysisResult;
      const analysisContent = generateAnalysisMarkdown(analysis);
      const filePath = path.join(basePath, `analysis-${timestamp}.md`);
      fs.writeFileSync(filePath, analysisContent, 'utf-8');
      vscode.window.showInformationMessage(`分析报告已保存: ${filePath}`);
    } else {
      const design = data as DesignResult;
      const outputFormat = config.get<string>('outputFormat') || 'mermaid';
      const ext = outputFormat === 'mermaid' ? 'mmd' : 'puml';
      
      if (design.classDiagram) {
        const classDiagramPath = path.join(basePath, `class-diagram-${timestamp}.${ext}`);
        fs.writeFileSync(classDiagramPath, design.classDiagram, 'utf-8');
        vscode.window.showInformationMessage(`类图已保存: ${classDiagramPath}`);
      }
      
      if (design.activityDiagram) {
        const activityDiagramPath = path.join(basePath, `activity-diagram-${timestamp}.${ext}`);
        fs.writeFileSync(activityDiagramPath, design.activityDiagram, 'utf-8');
        vscode.window.showInformationMessage(`活动图已保存: ${activityDiagramPath}`);
      }
      
      if (design.stateMachineDiagram) {
        const stateDiagramPath = path.join(basePath, `state-machine-${timestamp}.${ext}`);
        fs.writeFileSync(stateDiagramPath, design.stateMachineDiagram, 'utf-8');
        vscode.window.showInformationMessage(`状态机图已保存: ${stateDiagramPath}`);
      }
      
      if (design.designSummary) {
        const designSummaryPath = path.join(basePath, `design-summary-${timestamp}.md`);
        fs.writeFileSync(designSummaryPath, design.designSummary, 'utf-8');
        vscode.window.showInformationMessage(`设计摘要已保存: ${designSummaryPath}`);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`文件写入失败: ${errorMessage}`);
    throw error;
  }
}

function generateAnalysisMarkdown(result: AnalysisResult): string {
  let markdown = `# 需求分析报告

生成时间：${new Date().toLocaleString('zh-CN')}

## 1. 参与者（Actors）

${result.actors.length ? result.actors.map((actor, index) => `${index + 1}. ${actor}`).join('\n') : '暂无'}

## 2. 用例（Use Cases）

${result.useCases.length ? result.useCases.map(uc => `### ${uc.name}

**描述**：${uc.description || '-'}

**参与者**：${uc.actor || '-'}

**前置条件**：
${uc.preconditions && uc.preconditions.length ? uc.preconditions.map(p => `- ${p}`).join('\n') : '- 无'}

**后置条件**：
${uc.postconditions && uc.postconditions.length ? uc.postconditions.map(p => `- ${p}`).join('\n') : '- 无'}

**基本流程**：
${uc.steps && uc.steps.length ? uc.steps.map((step, index) => `${index + 1}. ${step}`).join('\n') : '- 无'}

`).join('\n') : '暂无'}

## 3. 功能需求

${result.functionalRequirements.length ? result.functionalRequirements.map((req, index) => `${index + 1}. ${req}`).join('\n') : '暂无'}

## 4. 非功能需求

${result.nonFunctionalRequirements.length ? result.nonFunctionalRequirements.map((req, index) => `${index + 1}. ${req}`).join('\n') : '暂无'}

## 5. 领域实体

${result.domainEntities.length ? result.domainEntities.map((entity, index) => `${index + 1}. ${entity}`).join('\n') : '暂无'}

## 6. 分析摘要

${result.summary || '暂无'}
`;

  return markdown;
}
