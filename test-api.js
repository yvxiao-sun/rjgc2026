"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = require("openai");
const readline = __importStar(require("readline"));
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
async function testAPI() {
    console.log('=== SE Agent API 测试工具 ===\n');
    rl.question('请输入 API 密钥: ', async (apiKey) => {
        if (!apiKey.trim()) {
            console.error('错误: API密钥不能为空');
            rl.close();
            return;
        }
        rl.question('请选择模型提供商 (deepseek/openai，默认deepseek): ', async (provider) => {
            const selectedProvider = provider.trim().toLowerCase() || 'deepseek';
            let baseURL = 'https://api.openai.com/v1';
            let model = 'gpt-4o';
            if (selectedProvider === 'deepseek') {
                baseURL = 'https://api.deepseek.com/v1';
                model = 'deepseek-chat';
            }
            console.log(`\n正在测试 ${selectedProvider} 提供商...`);
            console.log(`API端点: ${baseURL}`);
            console.log(`模型: ${model}`);
            console.log('------------------------\n');
            try {
                const client = new openai_1.OpenAI({
                    apiKey,
                    baseURL
                });
                console.log('正在发送测试请求...');
                const response = await client.chat.completions.create({
                    model,
                    messages: [{ role: 'user', content: '你好，请回复"测试成功"即可' }],
                    temperature: 0.3,
                    max_tokens: 50
                });
                const content = response.choices[0].message.content || '';
                console.log('✅ API调用成功！');
                console.log('响应内容:', content);
                if (content.includes('测试成功')) {
                    console.log('\n🎉 测试通过！API配置正确');
                }
                else {
                    console.log('\n⚠️ 响应内容不符合预期，但API调用正常');
                }
            }
            catch (error) {
                console.error('\n❌ API调用失败:', error instanceof Error ? error.message : String(error));
                console.log('\n可能的原因:');
                console.log('1. API密钥无效或已过期');
                console.log('2. 网络连接问题');
                console.log('3. API额度不足');
                console.log('4. 防火墙或代理阻止了连接');
            }
            finally {
                rl.close();
            }
        });
    });
}
testAPI();
//# sourceMappingURL=test-api.js.map