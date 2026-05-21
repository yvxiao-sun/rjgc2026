import { OpenAI } from 'openai';
import * as vscode from 'vscode';

export type ModelProvider = 'deepseek' | 'openai';

export async function createLLMClient(): Promise<OpenAI> {
  const config = vscode.workspace.getConfiguration('se-agent');
  const apiKey = config.get<string>('apiKey');
  const provider = config.get<ModelProvider>('provider') || 'deepseek';

  if (!apiKey) {
    throw new Error('请在设置中配置API密钥 (se-agent.apiKey)');
  }

  let baseURL = 'https://api.openai.com/v1';
  if (provider === 'deepseek') {
    baseURL = 'https://api.deepseek.com/v1';
  }

  return new OpenAI({
    apiKey,
    baseURL,
    timeout: 30000,
  });
}

export async function getModelName(): Promise<string> {
  const config = vscode.workspace.getConfiguration('se-agent');
  const provider = config.get<ModelProvider>('provider') || 'deepseek';
  const customModel = config.get<string>('model');

  if (customModel) {
    return customModel;
  }

  return provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o';
}
