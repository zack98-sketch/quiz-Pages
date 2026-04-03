/**
 * XSS 防护工具
 * 对用户生成内容进行转义，防止跨站脚本攻击
 */

/**
 * HTML 转义
 * @param {string} str - 需要转义的字符串
 * @returns {string} 转义后的字符串
 */
export function escapeHtml(str) {
  if (!str) return ''
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  }
  return str.replace(/[&<>"'`=]/g, char => map[char])
}

/**
 * 安全截取字符串（防止通过截断绕过过滤）
 * @param {string} str - 原始字符串
 * @param {number} maxLength - 最大长度
 * @returns {string} 截断后的字符串
 */
export function safeTruncate(str, maxLength = 200) {
  if (!str) return ''
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength) + '...'
}

/**
 * 验证和清理题目数据
 * @param {Object} question - 题目对象
 * @returns {Object} 清理后的题目
 */
export function sanitizeQuestion(question) {
  return {
    ...question,
    question: escapeHtml(question.question),
    options: question.options.map(opt => escapeHtml(opt)),
    analysis: question.analysis ? escapeHtml(question.analysis) : ''
  }
}

/**
 * 批量清理题目数据
 * @param {Array} questions - 题目数组
 * @returns {Array} 清理后的题目数组
 */
export function sanitizeQuestions(questions) {
  return questions.map(q => sanitizeQuestion(q))
}
