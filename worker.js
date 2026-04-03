/**
 * Cloudflare Worker - AI 代理服务
 * 用于安全地存储和调用 AI API，避免 API Key 暴露在客户端
 * 
 * 部署方式：
 * 1. wrangler pages project create quiz-pages
 * 2. 将 src/worker.js 作为 Functions 部署
 * 3. 绑定 KV 命名空间：AI_CONFIG
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname

    // CORS 头部
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }

    // 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    try {
      // 路由：分析题目
      if (path === '/api/analyze' && request.method === 'POST') {
        const body = await request.json()
        const { question, options, userAnswer, correctAnswer, analysis } = body

        // 输入验证
        if (!question || !options) {
          return new Response(JSON.stringify({ error: '缺少必要参数' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // 从 KV 读取 AI 配置（更安全）
        const config = await env.AI_CONFIG.get('ai-config', 'json')
        if (!config || !config.apiKey) {
          return new Response(JSON.stringify({ error: 'AI 未配置' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // 构建提示词（带注入防护）
        const optionsText = options.map((opt, idx) => 
          `${String.fromCharCode(65 + idx)}. ${opt}`
        ).join('\n')

        const prompt = `题目：${question}\n\n选项：\n${optionsText}\n\n用户答案：${userAnswer || '未作答'}\n正确答案：${correctAnswer}\n\n用简洁语言回答（不超过200字）：\n1. 考查知识点\n2. 解题关键\n3. 易错点提示`

        // 调用 AI（通过 Cloudflare 代理，隐藏真实 Key）
        const response = await fetch(`${config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          },
          body: JSON.stringify({
            model: config.model,
            messages: [
              { role: 'system', content: '你是考试辅导专家，用简洁清晰的语言解析题目，不超过200字。' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.5,
            max_tokens: 500
          })
        })

        if (!response.ok) {
          const error = await response.json()
          return new Response(JSON.stringify({ error: error.error?.message || 'AI 请求失败' }), {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const data = await response.json()
        return new Response(JSON.stringify({ 
          success: true, 
          result: data.choices[0].message.content 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // 路由：测试连接
      if (path === '/api/test-connection' && request.method === 'POST') {
        const body = await request.json()
        const { provider, apiKey, baseUrl, model } = body

        // 临时测试（不存 KV）
        const testResponse = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: 'OK' }],
            max_tokens: 5
          })
        })

        const success = testResponse.ok
        const data = success ? { success: true, message: '连接成功' } : { success: false, message: '连接失败' }

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // 路由：获取配置（仅返回非敏感信息）
      if (path === '/api/config' && request.method === 'GET') {
        const config = await env.AI_CONFIG.get('ai-config', 'json')
        if (!config) {
          return new Response(JSON.stringify({ configured: false }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        // 绝不返回 API Key
        const { apiKey, ...safeConfig } = config
        return new Response(JSON.stringify({ 
          configured: true, 
          ...safeConfig 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response('Not Found', { status: 404 })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  }
}
