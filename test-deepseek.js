// 简单的 DeepSeek API 测试脚本
const { OpenAI } = require('openai');

async function testDeepSeek() {
  // 请替换为您的 DeepSeek API 密钥
  const apiKey = 'sk-xxxxxxxxxxxxxxxxxxxxxxxx'; // 这里应该是用户的API密钥
  
  if (!apiKey || apiKey.startsWith('sk-xxxx')) {
    console.error('❌ 请先设置正确的 API 密钥');
    return;
  }

  console.log('=== DeepSeek API 测试 ===\n');
  
  try {
    const client = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com/v1',
      timeout: 30000,
    });

    console.log('正在连接到 DeepSeek API...');
    
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: '你好，请回复"测试成功"即可' }],
      temperature: 0.3,
      max_tokens: 50,
    });

    const content = response.choices[0].message.content || '';
    console.log('✅ API调用成功！');
    console.log('响应内容:', content);
    
    if (content.includes('测试成功')) {
      console.log('\n🎉 测试通过！API配置正确');
    } else {
      console.log('\n⚠️ 响应内容:', content);
    }

  } catch (error) {
    console.error('\n❌ API调用失败:', error.message || error);
    console.log('\n可能的原因:');
    console.log('1. API密钥无效或已过期');
    console.log('2. 网络连接问题');
    console.log('3. API额度不足');
    console.log('4. 防火墙或代理阻止了连接');
  }
}

testDeepSeek();
