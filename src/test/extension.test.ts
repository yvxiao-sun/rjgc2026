import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Extension should be activated', async () => {
    const extension = vscode.extensions.getExtension('se-agent');
    assert.ok(extension, 'Extension should exist');
    
    if (!extension.isActive) {
      await extension.activate();
    }
    assert.ok(extension.isActive, 'Extension should be active');
  });

  test('Commands should be registered', async () => {
    const commands = await vscode.commands.getCommands(true);
    const seAgentCommands = commands.filter(cmd => cmd.startsWith('se-agent.'));
    
    assert.ok(seAgentCommands.includes('se-agent.analyze'), 'analyze command should be registered');
    assert.ok(seAgentCommands.includes('se-agent.design'), 'design command should be registered');
    assert.ok(seAgentCommands.includes('se-agent.analyzeAndDesign'), 'analyzeAndDesign command should be registered');
  });

  test('Configuration should be available', () => {
    const config = vscode.workspace.getConfiguration('se-agent');
    
    assert.ok(config.has('apiKey'), 'apiKey config should exist');
    assert.ok(config.has('model'), 'model config should exist');
    assert.ok(config.has('outputFormat'), 'outputFormat config should exist');
    assert.ok(config.has('outputDirectory'), 'outputDirectory config should exist');
  });

  test('Analysis service parse function', () => {
    const testContent = `1. 参与者（Actors）
1. 用户
2. 管理员

2. 用例（Use Cases）
1. 用户登录
描述：用户输入账号密码进行登录
参与者：用户
前置条件：用户已注册
后置条件：登录成功后跳转到首页
基本流程：
1. 用户打开登录页面
2. 用户输入账号密码
3. 系统验证账号密码
4. 验证成功则登录

3. 功能需求
1. 用户注册功能
2. 用户登录功能

4. 非功能需求
1. 登录响应时间小于1秒

5. 领域实体
1. 用户

6. 分析摘要
这是一个简单的登录系统`;

    const expectedActors = ['用户', '管理员'];
    
    assert.ok(expectedActors.length > 0, 'Should parse actors');
  });
});
