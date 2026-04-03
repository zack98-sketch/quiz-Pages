/**
 * 题库数据预处理器
 * 在构建时清理和验证题库数据，防止 XSS 攻击
 */

import { sanitizeQuestions, escapeHtml } from './security.js'

/**
 * 验证单道题目的完整性
 * @param {Object} question - 题目对象
 * @returns {Object} 验证结果 {valid: boolean, errors: string[]}
 */
export function validateQuestion(question) {
  const errors = []

  if (!question.id) errors.push('缺少 id')
  if (!question.question) errors.push('缺少题目内容')
  if (!question.options || !Array.isArray(question.options)) errors.push('选项格式错误')
  if (!question.answer) errors.push('缺少答案')
  if (!question.type) errors.push('缺少题型')

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 批量验证题库
 * @param {Array} questions - 题目数组
 * @returns {Object} 统计信息
 */
export function validateQuizData(questions) {
  let validCount = 0
  let invalidCount = 0
  const errors = []

  questions.forEach((q, index) => {
    const result = validateQuestion(q)
    if (result.valid) {
      validCount++
    } else {
      invalidCount++
      errors.push(`题目 ${q.id || index + 1}: ${result.errors.join(', ')}`)
    }
  })

  return {
    total: questions.length,
    valid: validCount,
    invalid: invalidCount,
    errors
  }
}

/**
 * 预处理题库（构建时调用）
 * 1. 清理 HTML 特殊字符（防 XSS）
 * 2. 验证数据完整性
 * 3. 按章节和题型建立索引
 */
export function processQuizData(rawData) {
  console.log('🔍 开始预处理题库数据...')

  // 1. 清理数据
  const cleaned = sanitizeQuestions(rawData)
  console.log(`✅ XSS 清理完成，处理 ${cleaned.length} 道题`)

  // 2. 验证数据
  const validation = validateQuizData(cleaned)
  if (validation.invalid > 0) {
    console.warn('⚠️  发现无效题目：', validation.errors.slice(0, 10))
  }
  console.log(`✅ 数据验证：${validation.valid}/${validation.total} 道题有效`)

  // 3. 建立索引（优化搜索性能）
  const index = {
    byId: new Map(),
    byChapter: new Map(),
    byType: new Map(),
    searchIndex: new Map() // 关键词搜索索引
  }

  cleaned.forEach(q => {
    index.byId.set(q.id, q)

    // 章节索引
    const chapterKey = `${q.chapterId}_${q.chapter}`
    if (!index.byChapter.has(chapterKey)) {
      index.byChapter.set(chapterKey, [])
    }
    index.byChapter.get(chapterKey).push(q)

    // 题型索引
    const typeKey = `${q.typeId}_${q.type}`
    if (!index.byType.has(typeKey)) {
      index.byType.set(typeKey, [])
    }
    index.byType.get(typeKey).push(q)

    // 搜索索引（标题和关键词）
    const keywords = [
      q.question,
      ...q.options,
      q.analysis || ''
    ].join(' ').toLowerCase().split(/\s+/)

    keywords.forEach(word => {
      if (word.length > 1) { // 忽略单字符
        if (!index.searchIndex.has(word)) {
          index.searchIndex.set(word, new Set())
        }
        index.searchIndex.get(word).add(q.id)
      }
    })
  })

  console.log(`✅ 索引建立：${index.byChapter.size} 章节，${index.byType.size} 题型`)

  return {
    data: cleaned,
    index
  }
}
