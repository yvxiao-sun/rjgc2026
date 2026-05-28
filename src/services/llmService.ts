import { OpenAI } from 'openai';

export type ModelProvider = 'deepseek' | 'openai';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

let configCache: { apiKey?: string; provider?: ModelProvider; model?: string } | null = null;

export function setConfig(config: { apiKey?: string; provider?: ModelProvider; model?: string }) {
  configCache = config;
}

function getConfigValue<T>(key: string, defaultValue: T): T {
  if (configCache && key in configCache) {
    return configCache[key as keyof typeof configCache] as T;
  }

  try {
    const vscode = require('vscode');
    const config = vscode.workspace.getConfiguration('se-agent');
    return config.get(key, defaultValue);
  } catch {
    const envValue = process.env[`SE_AGENT_${key.toUpperCase()}`];
    if (envValue !== undefined) {
      return envValue as unknown as T;
    }
    return defaultValue;
  }
}

export async function createLLMClient(): Promise<OpenAI> {
  const apiKey = getConfigValue<string>('apiKey', '');
  const provider = getConfigValue<ModelProvider>('provider', 'deepseek');

  if (!apiKey) {
    throw new Error('请配置API密钥 (se-agent.apiKey 或 SE_AGENT_APIKEY 环境变量)');
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
  const provider = getConfigValue<ModelProvider>('provider', 'deepseek');
  const customModel = getConfigValue<string>('model', '');

  if (customModel) {
    return customModel;
  }

  return provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o';
}
