const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// DeepSeek API 配置
const DEEPSEEK_API_KEY = 'sk-d0522e698322494db0196cdfbdecca05';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

// 中间件
app.use(cors());
app.use(express.json());

// 内存缓存
const cache = new Map();

// DeepSeek API 调用函数
async function callDeepSeekAPI(text) {
  try {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个智能诊断助手。请根据用户输入的内容进行分析和回应。如果是技术问题，提供专业的诊断建议；如果是日常对话，进行友好的回应。'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API 错误: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek API 调用失败:', error);
    throw error;
  }
}

// 健康检查
app.get('/health', (req, res) => {
  console.log('收到健康检查请求');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'DeepSeek服务器正常运行',
    api_configured: !!DEEPSEEK_API_KEY
  });
});

// 文本诊断接口
app.post('/api/analyze-text', async (req, res) => {
  const { text } = req.body;
  console.log('收到文本诊断请求:', text);
  
  if (!text || text.trim() === '') {
    return res.status(400).json({
      success: false,
      error: '请输入要分析的文本'
    });
  }

  try {
    // 检查缓存
    const cacheKey = `text:${text}`;
    if (cache.has(cacheKey)) {
      console.log('从缓存返回结果');
      const cachedResult = cache.get(cacheKey);
      return res.json({
        ...cachedResult,
        cached: true
      });
    }

    // 调用 DeepSeek API
    console.log('调用 DeepSeek API...');
    const analysis = await callDeepSeekAPI(text);
    
    const response = {
      success: true,
      analysis: analysis,
      timestamp: new Date().toISOString(),
      mode: 'deepseek-api',
      cached: false
    };

    // 缓存结果（5分钟过期）
    cache.set(cacheKey, response);
    setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000);

    console.log('DeepSeek API 调用成功');
    res.json(response);

  } catch (error) {
    console.error('文本分析失败:', error);
    
    // 如果 API 调用失败，返回友好的错误信息
    const fallbackResponse = `抱歉，我现在无法处理您的请求。

输入内容："${text}"

可能的原因：
1. 网络连接问题
2. API 服务暂时不可用
3. 请求频率过高

建议：
1. 请稍后重试
2. 检查网络连接
3. 如果问题持续，请联系技术支持

错误详情：${error.message}`;

    res.json({
      success: true,
      analysis: fallbackResponse,
      timestamp: new Date().toISOString(),
      mode: 'fallback',
      error: error.message
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log('=================================');
  console.log('🚀 DeepSeek服务器启动成功!');
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log('📋 可用接口:');
  console.log('  GET  /health - 健康检查');
  console.log('  POST /api/analyze-text - 文本诊断');
  console.log(`🔑 API密钥: ${DEEPSEEK_API_KEY ? '已配置' : '未配置'}`);
  console.log('=================================');
});

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});
