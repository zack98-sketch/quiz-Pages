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

// 构建解析提示词
function buildAnalysisPrompt(question, options, userAnswer, correctAnswer, analysis) {
  const optionsText = options.map((opt, idx) => 
    `${String.fromCharCode(65 + idx)}. ${opt}`
  ).join('\n')

  return `你是一位专业的密码学和信息安全考试辅导专家。请对以下题目进行详细解析：

【题目】
${question}

【选项】
${optionsText}

【用户答案】
${userAnswer || '未作答'}

【正确答案】
${correctAnswer}

【原始解析】
${analysis || '暂无'}

请提供：
1. **知识点分析**：本题考查的核心知识点是什么？
2. **解题思路**：如何分析这道题？解题的关键是什么？
3. **选项分析**：逐个分析每个选项，说明为什么对或错
4. **记忆技巧**：有什么好的记忆方法或口诀？
5. **扩展知识**：相关的拓展知识点有哪些？
6. **易错点**：这道题容易出错的地方在哪里？

请用清晰、易懂的语言回答，适合学习和记忆。`
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
          content: '你是一位专业的密码学和信息安全考试辅导专家，擅长解析各类密码学、密评相关的考试题目。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
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
          { role: 'user', content: '你好，请回复"连接成功"' }
        ],
        max_tokens: 50
      })
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        message: '连接成功',
        response: data.choices[0].message.content
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
