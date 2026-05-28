import * as fs from 'fs';
import * as path from 'path';
import { Session, AnalysisStep } from './sessionService';

export interface ExportOptions {
  sessionDir: string;
  format?: 'json' | 'md' | 'mmd' | 'txt';
}

export class FileExporter {
  private sessionDir: string;

  constructor(sessionDir: string) {
    this.sessionDir = sessionDir;
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
  }

  private getStepFileName(stepId: number, format: string): string {
    const stepNames: Record<number, string> = {
      1: '01-use-cases',
      2: '02-activity-diagram',
      3: '03-candidate-classes',
      4: '04-domain-model',
      5: '05-state-diagrams',
      6: '06-design-class-diagram'
    };
    return `${stepNames[stepId]}.${format}`;
  }

  private parseStepResult(step: AnalysisStep): any {
    try {
      const jsonMatch = step.result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // JSON 解析失败，返回原始文本
    }
    return { raw: step.result };
  }

  private unescapeNewlines(str: string | undefined): string {
    if (!str || typeof str !== 'string') {
      return '';
    }
    return str.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
  }

  exportStep(step: AnalysisStep, format: 'json' | 'md' | 'mmd' | 'txt' = 'json'): string | null {
    const fileName = this.getStepFileName(step.id, format);
    const filePath = path.join(this.sessionDir, fileName);

    let content: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(this.parseStepResult(step), null, 2);
        break;

      case 'md':
        content = this.generateMarkdown(step);
        break;

      case 'mmd':
        content = this.generateMermaid(step);
        if (!content || content.trim() === '') {
          return null;
        }
        break;

      case 'txt':
        content = step.result;
        break;

      default:
        content = step.result;
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    return filePath;
  }

  private generateMarkdown(step: AnalysisStep): string {
    const parsed = this.parseStepResult(step);
    const stepNames: Record<number, string> = {
      1: '用例建模',
      2: '活动图',
      3: '候选类识别',
      4: '领域模型',
      5: '状态机图',
      6: '设计类图'
    };

    let md = `# ${stepNames[step.id]}\n\n`;
    md += `**步骤**: ${step.id}/6\n`;
    md += `**状态**: ${step.status}\n`;
    md += `**自检**: ${step.selfChecked ? '已通过' : '未检查'}\n\n`;
    md += `---\n\n`;

    if (parsed.raw) {
      md += this.unescapeNewlines(parsed.raw);
    } else {
      md += this.formatParsedResult(parsed, step.id);
    }

    return md;
  }

  private formatParsedResult(parsed: any, stepId: number): string {
    switch (stepId) {
      case 1:
        return this.formatUseCases(parsed);
      case 2:
        return this.formatActivityDiagram(parsed);
      case 3:
        return this.formatCandidateClasses(parsed);
      case 4:
        return this.formatDomainModel(parsed);
      case 5:
        return this.formatStateDiagrams(parsed);
      case 6:
        return this.formatDesignClassDiagram(parsed);
      default:
        return JSON.stringify(parsed, null, 2);
    }
  }

  private formatUseCases(parsed: any): string {
    let content = '';
    if (parsed.useCases && Array.isArray(parsed.useCases)) {
      parsed.useCases.forEach((uc: any, index: number) => {
        content += `## 用例 ${index + 1}: ${uc.name || uc.title || '未命名'}\n\n`;
        if (uc.description) content += `**描述**: ${this.unescapeNewlines(uc.description)}\n\n`;
        if (uc.actors) content += `**参与者**: ${Array.isArray(uc.actors) ? uc.actors.join(', ') : uc.actors}\n\n`;
        if (uc.preconditions) content += `**前置条件**: ${this.unescapeNewlines(uc.preconditions)}\n\n`;
        if (uc.postconditions) content += `**后置条件**: ${this.unescapeNewlines(uc.postconditions)}\n\n`;
        if (uc.flow) content += `**基本流程**:\n${this.unescapeNewlines(uc.flow)}\n\n`;
        content += '---\n\n';
      });
    }
    return content || JSON.stringify(parsed, null, 2);
  }

  private formatActivityDiagram(parsed: any): string {
    let content = '';
    if (parsed.description) {
      content += `**描述**: ${this.unescapeNewlines(parsed.description)}\n\n`;
    }
    if (parsed.activityDiagram) {
      content += `## Mermaid 活动图\n\n\`\`\`mermaid\n${this.unescapeNewlines(parsed.activityDiagram)}\n\`\`\`\n\n`;
    }
    return content || JSON.stringify(parsed, null, 2);
  }

  private formatCandidateClasses(parsed: any): string {
    let content = '';
    if (parsed.classes && Array.isArray(parsed.classes)) {
      parsed.classes.forEach((cls: any, index: number) => {
        content += `## 类 ${index + 1}: ${cls.name || '未命名'}\n\n`;
        if (cls.description) content += `**描述**: ${this.unescapeNewlines(cls.description)}\n\n`;
        if (cls.attributes && cls.attributes.length > 0) {
          content += `**属性**:\n`;
          cls.attributes.forEach((attr: string) => content += `- ${attr}\n`);
          content += '\n';
        }
        if (cls.responsibilities) content += `**职责**: ${this.unescapeNewlines(cls.responsibilities)}\n\n`;
        content += '---\n\n';
      });
    }
    return content || JSON.stringify(parsed, null, 2);
  }

  private formatDomainModel(parsed: any): string {
    let content = '';
    if (parsed.description) {
      content += `**描述**: ${this.unescapeNewlines(parsed.description)}\n\n`;
    }
    if (parsed.classDiagram) {
      content += `## Mermaid 类图\n\n\`\`\`mermaid\n${this.unescapeNewlines(parsed.classDiagram)}\n\`\`\`\n\n`;
    }
    if (parsed.relationships && Array.isArray(parsed.relationships)) {
      content += `## 类关系\n\n`;
      parsed.relationships.forEach((rel: any) => {
        content += `- **${rel.from}** ${rel.type} **${rel.to}**`;
        if (rel.multiplicity) content += ` (${rel.multiplicity})`;
        content += '\n';
      });
      content += '\n';
    }
    if (parsed.domainModel) {
      const dm = parsed.domainModel;
      if (dm.classDiagram) {
        content += `## Mermaid 类图\n\n\`\`\`mermaid\n${this.unescapeNewlines(dm.classDiagram)}\n\`\`\`\n\n`;
      }
      if (dm.relationships && Array.isArray(dm.relationships)) {
        content += `## 类关系详情\n\n`;
        dm.relationships.forEach((relGroup: any) => {
          content += `### ${relGroup.type}\n\n`;
          content += `**描述**: ${relGroup.description}\n\n`;
          if (relGroup.details && Array.isArray(relGroup.details)) {
            relGroup.details.forEach((detail: any) => {
              content += `- **${detail.parent || detail.from || detail.whole}** → **${detail.child || detail.to || detail.part}**: ${detail.description}\n`;
            });
          }
          content += '\n';
        });
      }
    }
    return content || JSON.stringify(parsed, null, 2);
  }

  private formatStateDiagrams(parsed: any): string {
    let content = '';
    if (parsed.stateDiagrams && Array.isArray(parsed.stateDiagrams)) {
      parsed.stateDiagrams.forEach((sd: any, index: number) => {
        content += `## 状态机图 ${index + 1}: ${sd.object || '未命名'}\n\n`;
        if (sd.description) content += `**描述**: ${this.unescapeNewlines(sd.description)}\n\n`;
        if (sd.diagram) {
          content += `\`\`\`mermaid\n${this.unescapeNewlines(sd.diagram)}\n\`\`\`\n\n`;
        }
        content += '---\n\n';
      });
    }
    return content || JSON.stringify(parsed, null, 2);
  }

  private formatDesignClassDiagram(parsed: any): string {
    let content = '';
    if (parsed.summary) {
      content += `**设计摘要**: ${this.unescapeNewlines(parsed.summary)}\n\n`;
    }
    if (parsed.classDiagram) {
      content += `## Mermaid 设计类图\n\n\`\`\`mermaid\n${this.unescapeNewlines(parsed.classDiagram)}\n\`\`\`\n\n`;
    }
    return content || JSON.stringify(parsed, null, 2);
  }

  private generateMermaid(step: AnalysisStep): string {
    const parsed = this.parseStepResult(step);

    switch (step.id) {
      case 2:
        return this.unescapeNewlines(parsed.activityDiagram || '');
      case 4:
        const diagram4 = parsed.classDiagram || (parsed.domainModel?.classDiagram || '');
        return this.unescapeNewlines(diagram4);
      case 5:
        if (parsed.stateDiagrams && Array.isArray(parsed.stateDiagrams)) {
          return parsed.stateDiagrams.map((sd: any) => this.unescapeNewlines(sd.diagram || '')).join('\n\n');
        }
        return '';
      case 6:
        return this.unescapeNewlines(parsed.classDiagram || '');
      default:
        return '';
    }
  }

  exportAllSteps(session: Session): string[] {
    const exportedFiles: string[] = [];

    session.steps.forEach(step => {
      if (step.status === 'completed' && step.result) {
        const jsonFile = this.exportStep(step, 'json');
        const mdFile = this.exportStep(step, 'md');
        if (jsonFile) exportedFiles.push(jsonFile);
        if (mdFile) exportedFiles.push(mdFile);

        if ([2, 4, 5, 6].includes(step.id)) {
          const mmdFile = this.exportStep(step, 'mmd');
          if (mmdFile) exportedFiles.push(mmdFile);
        }
      }
    });

    return exportedFiles;
  }

  exportSessionSummary(session: Session): string {
    const fileName = '00-session-summary.md';
    const filePath = path.join(this.sessionDir, fileName);

    let content = `# 会话摘要\n\n`;
    content += `**会话ID**: ${session.id}\n`;
    content += `**会话名称**: ${session.name}\n`;
    content += `**创建时间**: ${session.createdAt.toLocaleString()}\n`;
    content += `**更新时间**: ${session.updatedAt.toLocaleString()}\n`;
    content += `**当前步骤**: ${session.currentStep}/6\n\n`;
    content += `---\n\n`;

    content += `## 步骤状态\n\n`;
    session.steps.forEach(step => {
      const statusIcon = step.status === 'completed' ? '✅' : step.status === 'error' ? '❌' : '⏳';
      const checkIcon = step.selfChecked ? '🔍' : '';
      content += `${statusIcon} 步骤 ${step.id}: ${step.name} ${checkIcon}\n`;
    });
    content += '\n';

    content += `## 需求文档\n\n`;
    content += `\`\`\`\n${session.requirements}\n\`\`\`\n\n`;

    content += `## 对话历史\n\n`;
    content += `共 ${session.messages.length} 条消息\n\n`;

    fs.writeFileSync(filePath, content, 'utf-8');
    return filePath;
  }
}