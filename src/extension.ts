import * as vscode from 'vscode';
import { sessionManager } from './services/sessionService';
import { AnalysisFlow } from './services/analysisFlow';

export function activate(context: vscode.ExtensionContext) {
  let analyzeDisposable = vscode.commands.registerCommand('se-agent.analyze', async () => {
    await handleAnalyzeCommand();
  });

  let designDisposable = vscode.commands.registerCommand('se-agent.design', async () => {
    await handleDesignCommand();
  });

  let analyzeAndDesignDisposable = vscode.commands.registerCommand('se-agent.analyzeAndDesign', async () => {
    await handleAnalyzeAndDesignCommand();
  });

  let createSessionDisposable = vscode.commands.registerCommand('se-agent.createSession', async () => {
    await handleCreateSession();
  });

  let continueSessionDisposable = vscode.commands.registerCommand('se-agent.continueSession', async () => {
    await handleContinueSession();
  });

  let runStepDisposable = vscode.commands.registerCommand('se-agent.runStep', async () => {
    await handleRunStep();
  });

  let listSessionsDisposable = vscode.commands.registerCommand('se-agent.listSessions', async () => {
    await handleListSessions();
  });

  context.subscriptions.push(analyzeDisposable);
  context.subscriptions.push(designDisposable);
  context.subscriptions.push(analyzeAndDesignDisposable);
  context.subscriptions.push(createSessionDisposable);
  context.subscriptions.push(continueSessionDisposable);
  context.subscriptions.push(runStepDisposable);
  context.subscriptions.push(listSessionsDisposable);

  console.log('SE Agent 扩展已激活');
}

export function deactivate() { }

async function getRequirements(): Promise<string | null> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('请先打开一个需求文档');
    return null;
  }

  const document = editor.document;
  const requirements = document.getText();

  if (!requirements.trim()) {
    vscode.window.showErrorMessage('需求文档内容为空');
    return null;
  }

  return requirements;
}

function getVSCodeCallbacks() {
  return {
    showInfo: (message: string) => vscode.window.showInformationMessage(message),
    showError: (message: string) => vscode.window.showErrorMessage(message),
    showWarning: (message: string) => vscode.window.showWarningMessage(message),
    promptSelfCheck: async (stepId: number, stepName: string) => {
      const result = await vscode.window.showInformationMessage(
        `步骤 ${stepId}: ${stepName} 已完成，是否启动自检流程？`,
        '是', '否'
      );
      return result === '是';
    },
    promptEndSession: async () => {
      const result = await vscode.window.showInformationMessage(
        '所有步骤已完成，是否结束当前会话？',
        '是', '否'
      );
      return result === '是';
    }
  };
}

async function handleAnalyzeCommand() {
  const requirements = await getRequirements();
  if (!requirements) return;

  const sessionName = await vscode.window.showInputBox({
    prompt: '请输入会话名称',
    placeHolder: '例如: BlogSystem'
  });

  if (!sessionName) return;

  const session = sessionManager.createSession(sessionName, requirements);
  const flow = new AnalysisFlow(session.id, getVSCodeCallbacks());

  try {
    await flow.runStep(1);
    vscode.window.showInformationMessage('用例建模完成！');
  } catch (error) {
    vscode.window.showErrorMessage(`分析失败: ${error}`);
  }
}

async function handleDesignCommand() {
  const sessions = sessionManager.getAllSessions();
  if (sessions.length === 0) {
    vscode.window.showErrorMessage('没有找到会话，请先创建会话');
    return;
  }

  const session = await selectSession(sessions);
  if (!session) return;

  const flow = new AnalysisFlow(session.id, getVSCodeCallbacks());

  try {
    await flow.runStep(6);
    vscode.window.showInformationMessage('设计细化完成！');
  } catch (error) {
    vscode.window.showErrorMessage(`设计失败: ${error}`);
  }
}

async function handleAnalyzeAndDesignCommand() {
  const requirements = await getRequirements();
  if (!requirements) return;

  const sessionName = await vscode.window.showInputBox({
    prompt: '请输入会话名称',
    placeHolder: '例如: BlogSystem'
  });

  if (!sessionName) return;

  const session = sessionManager.createSession(sessionName, requirements);
  const flow = new AnalysisFlow(session.id, getVSCodeCallbacks());

  try {
    await flow.runAllSteps();
    vscode.window.showInformationMessage('分析与设计完成！');
  } catch (error) {
    vscode.window.showErrorMessage(`处理失败: ${error}`);
  }
}

async function handleCreateSession() {
  const requirements = await getRequirements();
  if (!requirements) return;

  const sessionName = await vscode.window.showInputBox({
    prompt: '请输入会话名称',
    placeHolder: '例如: BlogSystem'
  });

  if (!sessionName) return;

  sessionManager.createSession(sessionName, requirements);
  vscode.window.showInformationMessage(`会话 "${sessionName}" 创建成功！`);
}

async function handleContinueSession() {
  const sessions = sessionManager.getAllSessions();
  if (sessions.length === 0) {
    vscode.window.showErrorMessage('没有找到会话');
    return;
  }

  const session = await selectSession(sessions);
  if (!session) return;

  const flow = new AnalysisFlow(session.id, getVSCodeCallbacks());
  const nextStep = session.currentStep + 1;

  if (nextStep > 6) {
    vscode.window.showInformationMessage('所有步骤已完成');
    return;
  }

  try {
    await flow.runStep(nextStep);
    vscode.window.showInformationMessage(`步骤 ${nextStep} 完成！`);
  } catch (error) {
    vscode.window.showErrorMessage(`执行失败: ${error}`);
  }
}

async function handleRunStep() {
  const sessions = sessionManager.getAllSessions();
  if (sessions.length === 0) {
    vscode.window.showErrorMessage('没有找到会话');
    return;
  }

  const session = await selectSession(sessions);
  if (!session) return;

  const stepInput = await vscode.window.showInputBox({
    prompt: '请输入步骤编号 (1-6)',
    placeHolder: '1'
  });

  if (!stepInput) return;

  const stepId = parseInt(stepInput);
  if (isNaN(stepId) || stepId < 1 || stepId > 6) {
    vscode.window.showErrorMessage('无效的步骤编号');
    return;
  }

  const flow = new AnalysisFlow(session.id, getVSCodeCallbacks());

  try {
    await flow.runStep(stepId);
    vscode.window.showInformationMessage(`步骤 ${stepId} 完成！`);
  } catch (error) {
    vscode.window.showErrorMessage(`执行失败: ${error}`);
  }
}

async function handleListSessions() {
  const sessions = sessionManager.getAllSessions();
  if (sessions.length === 0) {
    vscode.window.showInformationMessage('没有找到会话');
    return;
  }

  const items = sessions.map(session => ({
    label: session.name,
    description: `步骤: ${session.currentStep}/6`,
    detail: `ID: ${session.id}\n创建时间: ${session.createdAt.toLocaleString()}`
  }));

  await vscode.window.showQuickPick(items, {
    title: '可用会话',
    matchOnDescription: true
  });
}

async function selectSession(sessions: ReturnType<typeof sessionManager.getAllSessions>): Promise<ReturnType<typeof sessionManager.getAllSessions>[0] | undefined> {
  const items = sessions.map(session => ({
    label: session.name,
    description: `步骤: ${session.currentStep}/6`,
    session
  }));

  const selected = await vscode.window.showQuickPick(items, {
    title: '选择会话',
    matchOnDescription: true
  });

  return selected?.session;
}
