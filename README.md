# 🎯 密评题库练习系统

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/zack98-sketch/quiz-Pages)

> 基于 Vue 3 + Vite 构建的在线题库练习系统，支持部署到 Cloudflare Pages、Vercel、Netlify 等平台。

## 📋 项目简介

本项目是一个功能完整的在线题库练习系统，包含 **5075道** 密评相关题目，支持多种练习模式和AI智能解析功能。

### ✨ 核心功能

| 功能模块 | 描述 |
|---------|------|
| 🎲 **随机练习** | 系统随机抽取10道题进行练习 |
| 📖 **章节练习** | 按章节分类，针对性练习薄弱环节 |
| 📝 **题型练习** | 单选题、多选题、判断题专项训练 |
| 🔍 **搜索功能** | 关键词快速搜索相关题目 |
| ⭐ **收藏练习** | 收藏错题和重点题目，反复练习 |
| 📚 **背诵模式** | 逐题浏览，适合学习和背诵 |
| 📋 **模拟考试** | 计时考试模式，真实模拟考试环境 |
| 🤖 **AI智能解析** | 支持通义千问、DeepSeek、OpenAI 等模型 |

### 📊 题库统计

| 题型 | 数量 |
|------|------|
| 单选题 | 1747 道 |
| 多选题 | 1738 道 |
| 判断题 | 1590 道 |
| **总计** | **5075 道** |

---

## 🚀 快速部署

### 方式一：Cloudflare Pages（推荐）

#### 步骤1：Fork 本仓库

点击右上角 `Fork` 按钮，将项目 Fork 到您的账户。

#### 步骤2：连接 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **创建应用程序**
3. 选择 **Pages** → **连接到 Git**
4. 授权 GitHub 并选择 `quiz-Pages` 仓库
5. 配置构建设置：

| 配置项 | 值 |
|--------|-----|
| 生产分支 | `main` |
| 构建命令 | `npm run build` |
| 输出目录 | `dist` |

6. 点击 **保存并部署**

#### 步骤3：等待部署完成

部署完成后，您将获得一个 `*.pages.dev` 域名，可直接访问。

#### 步骤4：绑定自定义域名（可选）

在项目设置中可以绑定您自己的域名。

---

### 方式二：Vercel 部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/zack98-sketch/quiz-Pages)

1. 点击上方按钮或登录 [Vercel](https://vercel.com)
2. 导入 GitHub 仓库
3. Framework Preset 选择 `Vite`
4. 点击 Deploy

---

### 方式三：Netlify 部署

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/zack98-sketch/quiz-Pages)

1. 点击上方按钮或登录 [Netlify](https://netlify.com)
2. 连接 GitHub 并选择仓库
3. 构建命令：`npm run build`
4. 发布目录：`dist`
5. 点击 Deploy site

---

### 方式四：手动部署

```bash
# 克隆仓库
git clone https://github.com/zack98-sketch/quiz-Pages.git
cd quiz-Pages

# 安装依赖
npm install

# 构建
npm run build

# 本地预览
npm run preview

# 使用 Wrangler 部署到 Cloudflare Pages
npx wrangler pages deploy dist
```

---

## 🛠️ 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

---

## 🤖 AI 配置

系统支持多种 AI 模型进行题目解析：

### 支持的 AI 模型

| 模型 | API 地址 | 特点 |
|------|----------|------|
| 通义千问 | dashscope.aliyuncs.com | 中文效果好，性价比高 |
| DeepSeek | api.deepseek.com | 价格便宜，速度快 |
| OpenAI | api.openai.com | 效果最好，价格较高 |

### 配置步骤

1. 进入「AI设置」页面
2. 选择 AI 模型提供商
3. 输入对应的 API Key
4. 点击「测试连接」验证
5. 保存设置

### 获取 API Key

- **通义千问**: https://dashscope.console.aliyun.com/
- **DeepSeek**: https://platform.deepseek.com/
- **OpenAI**: https://platform.openai.com/

---

## 📁 项目结构

```
quiz-Pages/
├── src/
│   ├── views/           # 页面组件
│   │   ├── Home.vue     # 首页
│   │   ├── Practice.vue # 练习页面
│   │   ├── Chapter.vue  # 章节选择
│   │   ├── Type.vue     # 题型选择
│   │   ├── Search.vue   # 搜索页面
│   │   ├── Favorite.vue # 收藏页面
│   │   ├── Memorize.vue # 背诵模式
│   │   ├── Exam.vue     # 模拟考试
│   │   └── AISettings.vue # AI设置
│   ├── utils/           # 工具函数
│   │   ├── aiService.js # AI服务
│   │   └── quizUtils.js # 题库工具
│   ├── data/            # 数据文件
│   │   └── quizData.js  # 题库数据(5075题)
│   ├── App.vue          # 根组件
│   ├── main.js          # 入口文件
│   └── style.css        # 全局样式
├── public/              # 静态资源
├── index.html           # HTML模板
├── vite.config.js       # Vite配置
├── package.json         # 项目配置
├── wrangler.toml        # Cloudflare配置
└── README.md            # 项目说明
```

---

## 🔧 技术栈

- **前端框架**: Vue 3 (Composition API)
- **路由**: Vue Router 4
- **构建工具**: Vite 5
- **部署平台**: Cloudflare Pages / Vercel / Netlify

---

## 📱 响应式设计

项目采用响应式设计，完美适配：

- 📱 手机端 (375px+)
- 📱 平板端 (768px+)
- 💻 桌面端 (1024px+)

---

## 💾 数据存储

所有用户数据存储在浏览器 LocalStorage 中：

- `favorites` - 收藏的题目ID列表
- `progress` - 答题进度和统计
- `history` - 练习历史记录
- `aiConfig` - AI配置信息

---

## 🔄 更新日志

### v1.0.0 (2025-04-03)

- ✅ 初始版本发布
- ✅ 5075道题库完整数据
- ✅ 7种练习模式
- ✅ AI智能解析功能
- ✅ 响应式设计

---

## 📄 License

MIT License

---

## 🙋 常见问题

### Q: 如何更新题库数据？

A: 修改 `src/data/quizData.js` 文件中的数据即可。

### Q: 部署后页面空白怎么办？

A: 检查构建输出目录是否正确设置为 `dist`，并确保构建命令为 `npm run build`。

### Q: AI解析不工作？

A: 请确保已在「AI设置」页面正确配置 API Key，并测试连接成功。

### Q: 如何修改主题颜色？

A: 编辑 `src/style.css` 文件中的 CSS 变量：

```css
:root {
  --primary-color: #2196f3;  /* 主色调 */
  --success-color: #4caf50;  /* 成功色 */
  --warning-color: #ff9800;  /* 警告色 */
  --danger-color: #f44336;   /* 危险色 */
}
```

---

## 📧 联系方式

如有问题或建议，请提交 [Issue](https://github.com/zack98-sketch/quiz-Pages/issues)。
