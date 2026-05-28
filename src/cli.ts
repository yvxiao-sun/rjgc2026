#!/usr/bin/env node

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { createLLMClient, getModelName } from './services/llmService';
import { sessionManager, Session } from './services/sessionService';
import { AnalysisFlow } from './services/analysisFlow';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

interface CommandOptions {
  action: string;
  caseName?: string;
  step?: number;
  requirementsFile?: string;
}

function parseArgs(args: string[]): CommandOptions {
  const options: CommandOptions = { action: '' };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === 'start' || arg === 'create') {
      options.action = arg;
      if (args[i + 1]) {
        options.caseName = args[i + 1];
        i++;
      }
    } else if (arg === '--step' || arg === '-s') {
      options.step = parseInt(args[i + 1]);
      i++;
    } else if (arg === '--file' || arg === '-f') {
      options.requirementsFile = args[i + 1];
      i++;
    } else if (!options.action) {
      options.action = arg;
    }
  }

  return options;
}

async function loadRequirements(filePath: string): Promise<string> {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`文件不存在: ${fullPath}`);
    }
    return fs.readFileSync(fullPath, 'utf-8');
  } catch (error) {
    console.error('加载需求文档失败:', error);
    throw error;
  }
}

async function createSession(caseName: string, requirements: string): Promise<Session> {
  console.log(`创建会话: ${caseName}`);
  const session = sessionManager.createSession(caseName, requirements);
  console.log(`会话创建成功，ID: ${session.id}`);
  return session;
}

async function runStep(session: Session, stepId: number, interactive: boolean = true): Promise<void> {
  const callbacks = {
    showInfo: console.log,
    showError: console.error,
    showWarning: console.warn,
    promptSelfCheck: async (stepId: number, stepName: string) => {
      if (!interactive) return false;
      const answer = await new Promise<string>((resolve) => {
        rl.question(`步骤 ${stepId}: ${stepName} 已完成，是否启动自检流程？(y/n): `, (answer) => {
          resolve(answer.toLowerCase());
        });
      });
      return answer === 'y' || answer === 'yes';
    },
    promptEndSession: async () => {
      if (!interactive) return true;
      const answer = await new Promise<string>((resolve) => {
        rl.question(`是否结束当前会话？(y/n): `, (answer) => {
          resolve(answer.toLowerCase());
        });
      });
      return answer === 'y' || answer === 'yes';
    }
  };

  const flow = new AnalysisFlow(session.id, callbacks);

  console.log(`\n=== 执行步骤 ${stepId}: ${session.steps.find(s => s.id === stepId)?.name} ===`);

  const result = await flow.runStep(stepId);
  if (!result) {
    console.log(`步骤 ${stepId} 执行失败`);
    return;
  }

  console.log(`步骤 ${stepId} 完成`);

  if (interactive && [2, 4, 5].includes(stepId)) {
    const shouldCheck = await callbacks.promptSelfCheck!(stepId, result.name);
    if (shouldCheck) {
      await flow.runSelfCheck(stepId);
    }
  }
}

async function runAllSteps(session: Session, interactive: boolean = true): Promise<void> {
  const callbacks = {
    showInfo: console.log,
    showError: console.error,
    showWarning: console.warn,
    promptSelfCheck: async (stepId: number, stepName: string) => {
      if (!interactive) return false;
      const answer = await new Promise<string>((resolve) => {
        rl.question(`步骤 ${stepId}: ${stepName} 已完成，是否启动自检流程？(y/n): `, (answer) => {
          resolve(answer.toLowerCase());
        });
      });
      return answer === 'y' || answer === 'yes';
    },
    promptEndSession: async () => {
      if (!interactive) return true;
      const answer = await new Promise<string>((resolve) => {
        rl.question(`是否结束当前会话？(y/n): `, (answer) => {
          resolve(answer.toLowerCase());
        });
      });
      return answer === 'y' || answer === 'yes';
    }
  };

  const flow = new AnalysisFlow(session.id, callbacks);

  for (let stepId = 1; stepId <= 6; stepId++) {
    console.log(`\n=== 执行步骤 ${stepId}: ${session.steps.find(s => s.id === stepId)?.name} ===`);

    const result = await flow.runStep(stepId);
    if (!result) {
      console.log(`步骤 ${stepId} 执行失败，终止流程`);
      return;
    }

    console.log(`步骤 ${stepId} 完成`);

    if (interactive && [2, 4, 5].includes(stepId)) {
      const shouldCheck = await callbacks.promptSelfCheck!(stepId, result.name);
      if (shouldCheck) {
        await flow.runSelfCheck(stepId);
      }
    }
  }

  console.log('\n=== 所有步骤执行完成 ===');
}

async function listSessions(): Promise<void> {
  const sessions = sessionManager.getAllSessions();
  if (sessions.length === 0) {
    console.log('没有找到会话');
    return;
  }

  console.log('=== 可用会话 ===');
  sessions.forEach((session, index) => {
    console.log(`${index + 1}. ${session.name} (ID: ${session.id})`);
    console.log(`   当前步骤: ${session.currentStep}/6`);
    console.log(`   创建时间: ${session.createdAt.toLocaleString()}`);
    console.log();
  });
}

async function selectSession(): Promise<Session | null> {
  const sessions = sessionManager.getAllSessions();
  if (sessions.length === 0) {
    console.log('没有找到会话，请先创建会话');
    return null;
  }

  const answer = await new Promise<string>((resolve) => {
    console.log('=== 选择会话 ===');
    sessions.forEach((session, index) => {
      console.log(`${index + 1}. ${session.name} (步骤: ${session.currentStep}/6)`);
    });
    rl.question('请输入会话编号: ', (answer) => {
      resolve(answer);
    });
  });

  const index = parseInt(answer) - 1;
  if (index >= 0 && index < sessions.length) {
    return sessions[index];
  }

  console.log('无效的选择');
  return null;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  console.log('=== SE Agent 命令行工具 ===\n');

  try {
    switch (options.action.toLowerCase()) {
      case 'start':
      case 'create': {
        if (!options.caseName) {
          const name = await new Promise<string>((resolve) => {
            rl.question('请输入用例名称: ', resolve);
          });
          options.caseName = name;
        }

        let requirements = '';
        if (options.requirementsFile) {
          requirements = await loadRequirements(options.requirementsFile);
        } else {
          const file = await new Promise<string>((resolve) => {
            rl.question('请输入需求文档路径: ', resolve);
          });
          requirements = await loadRequirements(file);
        }

        const session = await createSession(options.caseName, requirements);

        if (options.step) {
          await runStep(session, options.step);
        } else {
          const answer = await new Promise<string>((resolve) => {
            rl.question('是否执行所有步骤？(y/n): ', (answer) => {
              resolve(answer.toLowerCase());
            });
          });

          if (answer === 'y' || answer === 'yes') {
            await runAllSteps(session);
          } else {
            const step = await new Promise<string>((resolve) => {
              rl.question('请输入要执行的步骤编号(1-6): ', resolve);
            });
            await runStep(session, parseInt(step));
          }
        }
        break;
      }

      case 'continue': {
        const session = await selectSession();
        if (session) {
          const nextStep = session.currentStep + 1;
          if (nextStep <= 6) {
            await runStep(session, nextStep);
          } else {
            console.log('所有步骤已完成');
          }
        }
        break;
      }

      case 'list': {
        await listSessions();
        break;
      }

      case 'step': {
        const session = await selectSession();
        if (session && options.step) {
          await runStep(session, options.step);
        }
        break;
      }

      case 'selfcheck': {
        const session = await selectSession();
        if (session && options.step) {
          const callbacks = {
            showInfo: console.log,
            showError: console.error,
            showWarning: console.warn
          };
          const flow = new AnalysisFlow(session.id, callbacks);
          await flow.runSelfCheck(options.step);
        }
        break;
      }

      default: {
        console.log('命令帮助:');
        console.log('  start <用例名称> [-f <需求文件>] [-s <步骤>]  创建会话并开始分析');
        console.log('  continue                              继续上次会话');
        console.log('  list                                  列出所有会话');
        console.log('  step -s <步骤>                         执行指定步骤');
        console.log('  selfcheck -s <步骤>                    对指定步骤进行自检');
        console.log('  help                                  显示此帮助');
        break;
      }
    }
  } catch (error) {
    console.error('执行失败:', error);
  } finally {
    rl.close();
  }
}

main();
