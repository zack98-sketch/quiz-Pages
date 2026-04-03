# 部署指南

本文档详细介绍如何将密评题库系统部署到各种平台。

## 目录

- [Cloudflare Pages 部署](#cloudflare-pages-部署)
- [Vercel 部署](#vercel-部署)
- [Netlify 部署](#netlify-部署)
- [GitHub Pages 部署](#github-pages-部署)
- [自有服务器部署](#自有服务器部署)

---

## Cloudflare Pages 部署

### 方式一：Git 自动部署（推荐）

#### 1. Fork 仓库

点击项目右上角的 `Fork` 按钮。

#### 2. 登录 Cloudflare

访问 [Cloudflare Dashboard](https://dash.cloudflare.com/) 并登录。

#### 3. 创建 Pages 项目

1. 点击左侧菜单 **Workers & Pages**
2. 点击 **创建应用程序**
3. 选择 **Pages** 标签
4. 点击 **连接到 Git**

#### 4. 授权 GitHub

1. 点击 **GitHub** 按钮
2. 授权 Cloudflare 访问您的 GitHub
3. 选择 `quiz-Pages` 仓库

#### 5. 配置构建设置

| 设置项 | 值 |
|--------|-----|
| 项目名称 | quiz-Pages（或自定义） |
| 生产分支 | main |
| 构建框架 | None |
| 构建命令 | `npm run build` |
| 输出目录 | `dist` |

#### 6. 部署

点击 **保存并部署**，等待构建完成。

#### 7. 访问网站

部署完成后，您将获得一个 `https://quiz-pages.pages.dev` 域名。

### 方式二：命令行部署

```bash
# 1. 克隆项目
git clone https://github.com/zack98-sketch/quiz-Pages.git
cd quiz-Pages

# 2. 安装依赖
npm install

# 3. 构建
npm run build

# 4. 安装 Wrangler
npm install -g wrangler

# 5. 登录 Cloudflare
wrangler login

# 6. 部署
wrangler pages deploy dist --project-name=quiz-Pages
```

### 绑定自定义域名

1. 在项目页面点击 **自定义域**
2. 点击 **设置自定义域**
3. 输入您的域名
4. 按提示添加 DNS 记录

---

## Vercel 部署

### 方式一：一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/zack98-sketch/quiz-Pages)

### 方式二：手动部署

1. 登录 [Vercel](https://vercel.com)
2. 点击 **Add New** → **Project**
3. 导入 GitHub 仓库 `quiz-Pages`
4. Framework Preset 自动检测为 **Vite**
5. 点击 **Deploy**

### 方式三：CLI 部署

```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
vercel
```

---

## Netlify 部署

### 方式一：一键部署

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/zack98-sketch/quiz-Pages)

### 方式二：手动部署

1. 登录 [Netlify](https://app.netlify.com)
2. 点击 **Add new site** → **Import an existing project**
3. 连接 GitHub 并选择仓库
4. 配置构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
5. 点击 **Deploy site**

### 方式三：CLI 部署

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 部署
netlify deploy --prod
```

---

## GitHub Pages 部署

### 1. 修改 vite.config.js

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/quiz-Pages/', // 替换为您的仓库名
  build: {
    outDir: 'dist'
  }
})
```

### 2. 创建部署脚本

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      
      - uses: actions/deploy-pages@v4
```

### 3. 启用 GitHub Pages

1. 进入仓库 **Settings** → **Pages**
2. Source 选择 **GitHub Actions**
3. 等待部署完成

---

## 自有服务器部署

### 方式一：静态文件部署

```bash
# 构建
npm run build

# 将 dist 目录上传到服务器
scp -r dist/* user@server:/var/www/quiz/
```

### 方式二：Docker 部署

创建 `Dockerfile`：

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

构建和运行：

```bash
docker build -t quiz-app .
docker run -d -p 80:80 quiz-app
```

### 方式三：Node.js 服务器

创建 `server.js`：

```javascript
import express from 'express'
import path from 'path'

const app = express()
const port = process.env.PORT || 3000

app.use(express.static('dist'))

app.get('*', (req, res) => {
  res.sendFile(path.resolve('dist/index.html'))
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
```

---

## 环境变量（可选）

如果需要配置 AI 服务，可以设置环境变量：

| 变量名 | 描述 |
|--------|------|
| `VITE_AI_PROVIDER` | 默认 AI 提供商 |
| `VITE_AI_API_KEY` | 默认 API Key |

创建 `.env` 文件：

```
VITE_AI_PROVIDER=qwen
VITE_AI_API_KEY=your-api-key
```

---

## 故障排查

### 页面空白

1. 检查构建输出目录是否为 `dist`
2. 检查 `vite.config.js` 中的 `base` 配置

### 404 错误

确保服务器配置了 SPA 路由重定向：

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache (.htaccess):**
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### 构建失败

1. 检查 Node.js 版本（推荐 18+）
2. 删除 `node_modules` 重新安装
3. 检查依赖版本兼容性

---

## 性能优化建议

1. **启用 Gzip 压缩**：服务器配置 Gzip
2. **启用 CDN**：使用 Cloudflare 等 CDN 加速
3. **缓存策略**：配置静态资源缓存

---

## 更新部署

```bash
# 拉取最新代码
git pull

# 安装依赖
npm install

# 重新构建
npm run build

# 重新部署（根据平台选择）
```
