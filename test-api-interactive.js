const { OpenAI } = require('openai');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== SE Agent API 测试工具 ===\n');

rl.question('请输入您的 DeepSeek API 密钥: ', async (apiKey) => {
  if (!apiKey.trim()) {
    console.error('❌ API密钥不能为空');
    rl.close();
    return;
  }

  console.log('\n正在连接到 DeepSeek API...');
  
  try {
    const client = new OpenAI({
      apiKey: apiKey.trim(),
      baseURL: 'https://api.deepseek.com/v1',
      timeout: 30000,
    });

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
  } finally {
    rl.close();
  }
});
