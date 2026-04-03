<template>
  <div class="container settings-page">
    <h2 class="page-title">AI设置</h2>
    
    <div class="settings-card card">
      <div class="form-item">
        <label>AI模型</label>
        <select v-model="provider" @change="onProviderChange">
          <option v-for="(model, key) in models" :key="key" :value="key">
            {{ model.name }}
          </option>
        </select>
      </div>
      
      <div class="form-item">
        <label>API Key</label>
        <input 
          type="password" 
          v-model="apiKey" 
          placeholder="请输入API Key"
        >
      </div>
      
      <div class="form-item">
        <label>API地址</label>
        <input type="text" v-model="baseUrl" placeholder="API Base URL">
      </div>
      
      <div class="form-item">
        <label>模型名称</label>
        <input type="text" v-model="model" placeholder="Model ID">
      </div>
      
      <button class="btn btn-primary btn-block" @click="saveConfig">保存设置</button>
      <button class="btn btn-outline btn-block" @click="testConnection" :disabled="testing">
        {{ testing ? '测试中...' : '测试连接' }}
      </button>
    </div>
    
    <div class="help-card card">
      <h3>使用说明</h3>
      <p>1. 选择AI模型提供商</p>
      <p>2. 输入对应平台的API Key</p>
      <p>3. 点击测试连接验证配置</p>
      <p>4. 保存设置后可在答题时使用AI解析</p>
      
      <h4>推荐配置</h4>
      <ul>
        <li><strong>通义千问</strong>：性价比高，中文效果好</li>
        <li><strong>DeepSeek</strong>：价格便宜，速度快</li>
        <li><strong>OpenAI</strong>：效果最好，价格较高</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAIConfig, saveAIConfig, testConnection as testAI } from '../utils/aiService.js'

const provider = ref('qwen')
const apiKey = ref('')
const baseUrl = ref('')
const model = ref('')
const models = ref({})
const testing = ref(false)

function onProviderChange() {
  const config = models.value[provider.value]
  apiKey.value = config.apiKey || ''
  baseUrl.value = config.baseUrl
  model.value = config.model
}

function saveConfig() {
  const config = getAIConfig()
  config.provider = provider.value
  config.models[provider.value] = {
    ...config.models[provider.value],
    apiKey: apiKey.value,
    baseUrl: baseUrl.value,
    model: model.value
  }
  saveAIConfig(config)
  alert('设置已保存')
}

async function testConnection() {
  testing.value = true
  try {
    const result = await testAI(provider.value, apiKey.value, baseUrl.value, model.value)
    alert(result.message)
  } finally {
    testing.value = false
  }
}

onMounted(() => {
  const config = getAIConfig()
  models.value = config.models
  provider.value = config.provider
  onProviderChange()
})
</script>

<style scoped>
.settings-page {
  padding-top: 20px;
}

.settings-card {
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.form-item input,
.form-item select {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

.form-item input:focus,
.form-item select:focus {
  border-color: var(--primary-color);
}

.form-item + .btn {
  margin-top: 8px;
}

.help-card h3 {
  font-size: 16px;
  margin-bottom: 12px;
}

.help-card h4 {
  font-size: 14px;
  margin: 16px 0 8px;
}

.help-card p {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.help-card ul {
  padding-left: 20px;
  font-size: 13px;
  color: var(--text-secondary);
}

.help-card li {
  margin-bottom: 8px;
}
</style>
