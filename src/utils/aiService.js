/**
 * AI 服务适配器
 * 支持两种模式：
 * 1. 客户端模式（原有 localStorage 存储，用于本地开发）
 * 2. Cloudflare Worker 模式（生产环境，通过 Worker 代理 AI 请求，Key 存储于 KV）
 */

const isCloudflare = typeof window !== 'undefined' && window.__CF_PAGES__ !== undefined

// Cloudflare Worker 端点（生产环境）
const WORKER_URL = isCloudflare ? '/api' : 'http://localhost:8787'

/**
 * 获取 AI 配置（客户端仅获取非敏感信息）
 */
export async function getAIConfig() {
  if (isCloudflare) {
    const res = await fetch(`${WORKER_URL}/api/config`)
    const data = await res.json()
    return {
      provider: data.provider || 'qwen',
      models: {
        qwen: {
          name: '通义千问',
          baseUrl: data.baseUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
          model: data.model || 'qwen-plus',
          apiKey: '' // 绝不返回 Key
        },
        openai: {
          name: 'OpenAI',
          baseUrl: 'https://api.openai.com/v1',
          model: 'gpt-4o-mini',
          apiKey: ''
        },
        deepseek: {
          name: 'DeepSeek',
          baseUrl: 'https://api.deepseek.com/v1',
          model: 'deepseek-chat',
          apiKey: ''
        }
      }
    }
  } else {
    // 开发模式：从 localStorage 读取
    const saved = localStorage.getItem('aiConfig')
    if (saved) {
      return JSON.parse(saved)
    }
  }

  return {
    provider: 'qwen',
    models: {
      qwen: { name: '通义千问', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus', apiKey: '' },
      openai: { name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini', apiKey: '' },
      deepseek: { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat', apiKey: '' }
    }
  }
}

/**
 * 保存 AI 配置（生产环境写入 KV，开发环境写入 localStorage）
 */
export async function saveAIConfig(config) {
  if (isCloudflare) {
    // 生产环境：调用 Worker API 保存到 KV
    const res = await fetch(`${WORKER_URL}/api/save-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    if (!res.ok) throw new Error('保存失败')
  } else {
    localStorage.setItem('aiConfig', JSON.stringify(config))
  }
}

/**
 * 测试 AI 连接
 */
export async function testConnection(provider, apiKey, baseUrl, model) {
  try {
    const res = await fetch(`${WORKER_URL}/api/test-connection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, apiKey, baseUrl, model })
    })
    const data = await res.json()
    return data
  } catch (err) {
    return { success: false, message: '网络请求失败' }
  }
}

/**
 * AI 解析题目（通过 Worker 代理）
 */
export async function analyzeQuestion(question, options, userAnswer, correctAnswer, analysis) {
  const optionsText = options.map((opt, idx) => 
    `${String.fromCharCode(65 + idx)}. ${opt}`
  ).join('\n')

  const prompt = `题目：${question}\n\n选项：\n${optionsText}\n\n用户答案：${userAnswer || '未作答'}\n正确答案：${correctAnswer}\n\n用简洁语言回答（不超过200字）：\n1. 考查知识点\n2. 解题关键\n3. 易错点提示\n\n直接回答，不要加序号和标题。`

  const res = await fetch(`${WORKER_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      options,
      userAnswer,
      correctAnswer,
      analysis,
      prompt
    })
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || '请求失败')
  }

  const data = await res.json()
  return data.result
}
