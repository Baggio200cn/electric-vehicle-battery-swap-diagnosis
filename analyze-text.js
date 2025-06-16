// Vercel Serverless Function for DeepSeek API
export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST请求' });
  }

  const { text } = req.body;
  
  if (!text || text.trim() === '') {
    return res.status(400).json({
      success: false,
      error: '请输入要分析的文本'
    });
  }

  try {
    // DeepSeek API 配置
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-d0522e698322494db0196cdfbdecca05';
    const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

    // 使用Node.js内置fetch（Node 18+支持）
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
            content: '你是一个专业的电动汽车换电站故障诊断专家。请根据用户描述的故障现象，提供专业的诊断分析和解决方案。回答要包含：1)可能的故障原因 2)诊断步骤 3)解决方案 4)预防措施。'
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
    const analysis = data.choices[0].message.content;

    res.status(200).json({
      success: true,
      analysis: analysis,
      timestamp: new Date().toISOString(),
      mode: 'deepseek-api'
    });

  } catch (error) {
    console.error('DeepSeek API 调用失败:', error);
    
    // 返回备用诊断建议
    const fallbackResponse = `基于您的描述："${text}"

🔧 **专业诊断建议**：

📋 **初步分析**：
根据故障现象，建议按以下步骤进行排查：

🔍 **检查步骤**：
1. **电源系统检查**
   - 检查主电源连接是否牢固
   - 测量各路电压是否在正常范围
   - 检查保险丝和断路器状态

2. **控制系统诊断**
   - 查看控制面板是否有报警信息
   - 检查PLC程序运行状态
   - 验证传感器信号是否正常

3. **机械部件检查**
   - 检查换电机构运动是否顺畅
   - 查看导轨、滑块是否有异常磨损
   - 检查气缸、电机工作状态

4. **通信系统验证**
   - 检查各模块间通信是否正常
   - 验证与车辆通信协议
   - 测试网络连接稳定性

⚡ **可能原因分析**：
- 电气连接松动或接触不良
- 控制程序逻辑错误
- 机械部件老化或损坏
- 环境因素影响（温度、湿度、灰尘）
- 通信干扰或协议不匹配

🛠️ **解决方案**：
1. **立即措施**：停机检查，确保安全
2. **系统诊断**：按检查步骤逐一排查
3. **专业维修**：联系厂家技术支持
4. **预防措施**：制定定期维护计划

⚠️ **注意事项**：
- 操作前务必断电确保安全
- 复杂故障请联系专业技术人员
- 详细记录故障现象和处理过程

---
💡 **API服务状态**：当前使用离线诊断模式
📞 **技术支持**：如需详细诊断，请联系专业工程师`;

    res.status(200).json({
      success: true,
      analysis: fallbackResponse,
      timestamp: new Date().toISOString(),
      mode: 'fallback',
      error: error.message
    });
  }
} 