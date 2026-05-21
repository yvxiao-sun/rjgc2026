import * as vscode from 'vscode';

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

  context.subscriptions.push(analyzeDisposable);
  context.subscriptions.push(designDisposable);
  context.subscriptions.push(analyzeAndDesignDisposable);
  
  console.log('SE Agent 扩展已激活');
}

export function deactivate() {}

async function handleAnalyzeCommand() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('请先打开一个需求文档');
    return;
  }

  const document = editor.document;
  const requirements = document.getText();
  
  if (!requirements.trim()) {
    vscode.window.showErrorMessage('需求文档内容为空');
    return;
  }

  try {
    vscode.window.showInformationMessage('正在进行需求分析...');
    
    // 动态导入服务模块
    const { analyzeRequirements } = await import('./services/analysisService');
    const { writeOutputFiles } = await import('./utils/fileWriter');
    
    const analysisResult = await analyzeRequirements(requirements);
    await writeOutputFiles('analysis', analysisResult);
    vscode.window.showInformationMessage('需求分析完成！输出文件已保存');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`分析失败: ${errorMessage}`);
  }
}

async function handleDesignCommand() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('请先打开一个需求文档');
    return;
  }

  const document = editor.document;
  const requirements = document.getText();
  
  if (!requirements.trim()) {
    vscode.window.showErrorMessage('需求文档内容为空');
    return;
  }

  try {
    vscode.window.showInformationMessage('正在生成设计模型...');
    
    // 动态导入服务模块
    const { generateDesign } = await import('./services/designService');
    const { writeOutputFiles } = await import('./utils/fileWriter');
    
    const designResult = await generateDesign(requirements);
    await writeOutputFiles('design', designResult);
    vscode.window.showInformationMessage('设计模型生成完成！输出文件已保存');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`设计生成失败: ${errorMessage}`);
  }
}

async function handleAnalyzeAndDesignCommand() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('请先打开一个需求文档');
    return;
  }

  const document = editor.document;
  const requirements = document.getText();
  
  if (!requirements.trim()) {
    vscode.window.showErrorMessage('需求文档内容为空');
    return;
  }

  try {
    vscode.window.showInformationMessage('正在进行需求分析...');
    
    // 动态导入服务模块
    const { analyzeRequirements } = await import('./services/analysisService');
    const { generateDesign } = await import('./services/designService');
    const { writeOutputFiles } = await import('./utils/fileWriter');
    
    const analysisResult = await analyzeRequirements(requirements);
    await writeOutputFiles('analysis', analysisResult);
    
    vscode.window.showInformationMessage('正在生成设计模型...');
    const designResult = await generateDesign(requirements, analysisResult);
    await writeOutputFiles('design', designResult);
    
    vscode.window.showInformationMessage('分析与设计完成！输出文件已保存');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`处理失败: ${errorMessage}`);
  }
}
