# 密评题库练习系统

基于 Vue 3 + Vite 构建的在线题库练习系统，支持部署到 Cloudflare Pages。

## 功能特性

- **7种练习模式**：随机练习、章节练习、题型练习、搜索、收藏、背诵、模拟考试
- **AI智能解析**：支持通义千问、DeepSeek、OpenAI等模型
- **数据统计**：答题进度、正确率、历史记录
- **响应式设计**：适配手机和电脑

## 快速部署到 Cloudflare Pages

### 方法一：Fork 后自动部署

1. Fork 本仓库
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. 进入 Pages → 创建项目 → 连接 Git
4. 选择 Fork 的仓库
5. 配置构建设置：
   - 构建命令：`npm run build`
   - 输出目录：`dist`
6. 点击保存并部署

### 方法二：手动部署

```bash
# 安装依赖
npm install

# 构建
npm run build

# 使用 Wrangler 部署
npx wrangler pages deploy dist
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build
```

## 题库数据

包含 **5075道** 密评相关题目：
- 单选题：1747道
- 多选题：1738道
- 判断题：1590道

## AI 配置

在「AI设置」页面配置您的 API Key：
- 通义千问：https://dashscope.aliyuncs.com
- DeepSeek：https://api.deepseek.com
- OpenAI：https://api.openai.com

## 技术栈

- Vue 3
- Vue Router
- Vite
- Cloudflare Pages

## License

MIT
