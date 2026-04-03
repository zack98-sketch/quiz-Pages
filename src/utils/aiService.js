// AI服务模块

const defaultConfig = {
  provider: 'qwen',
  models: {
    qwen: {
      name: '通义千问',
      apiKey: '',
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      model: 'qwen-plus'
    },
    openai: {
      name: 'OpenAI',
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini'
    },
    deepseek: {
      name: 'DeepSeek',
      apiKey: '',
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat'
    }
  }
}

// 获取配置
export function getAIConfig() {
  const saved = localStorage.getItem('aiConfig')
  if (saved) {
    return JSON.parse(saved)
  }
  return defaultConfig
}

// 保存配置
export function saveAIConfig(config) {
  localStorage.setItem('aiConfig', JSON.stringify(config))
}

// 获取当前激活的模型配置
export function getActiveModelConfig() {
  const config = getAIConfig()
  const provider = config.provider
  return {
    provider,
    ...config.models[provider]
  }
}

// 构建简洁的解析提示词
function buildAnalysisPrompt(question, options, userAnswer, correctAnswer, analysis) {
  const optionsText = options.map((opt, idx) => 
    `${String.fromCharCode(65 + idx)}. ${opt}`
  ).join('\n')

  return `题目：${question}

选项：
${optionsText}

用户答案：${userAnswer || '未作答'}
正确答案：${correctAnswer}

请用简洁的语言回答（不超过200字）：
1. 考查知识点（一句话）
2. 解题关键（为什么选这个答案）
3. 易错点提示

直接回答，不要加序号和标题。`
}

// AI解析
export async function analyzeQuestion(question, options, userAnswer, correctAnswer, analysis) {
  const modelConfig = getActiveModelConfig()
  
  if (!modelConfig.apiKey) {
    throw new Error('请先在AI设置中配置API Key')
  }

  const prompt = buildAnalysisPrompt(question, options, userAnswer, correctAnswer, analysis)

  const response = await fetch(`${modelConfig.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${modelConfig.apiKey}`
    },
    body: JSON.stringify({
      model: modelConfig.model,
      messages: [
        {
          role: 'system',
          content: '你是考试辅导专家，请用简洁清晰的语言解析题目，回答控制在200字以内。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 500
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || '请求失败')
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// 测试连接
export async function testConnection(provider, apiKey, baseUrl, model) {
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'user', content: '回复OK' }
        ],
        max_tokens: 10
      })
    })

    if (response.ok) {
      return {
        success: true,
        message: '连接成功'
      }
    } else {
      const error = await response.json()
      return {
        success: false,
        message: error.error?.message || '连接失败'
      }
    }
  } catch (err) {
    return {
      success: false,
      message: '网络请求失败'
    }
  }
}
