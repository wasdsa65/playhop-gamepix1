# Vercel 部署指南

## 问题解决

如果你的 Vercel 部署失败，通常是因为以下原因：

### 1. 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

```env
# GamePix 配置
GAMEPIX_SID=49715
GAMEPIX_PAGE_SIZE=24
NEXT_PUBLIC_GAMEPIX_PAGE_SIZE=24
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# 选择排行榜后端：supabase 或 firestore
LEADERBOARD_PROVIDER=supabase

# Supabase 配置（如果使用 supabase）
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Firebase 配置（如果使用 firestore）
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
```

### 2. 构建命令

确保 Vercel 使用以下构建命令：
```bash
npm run build
```

### 3. 输出目录

输出目录应该是：`.next`

### 4. Node.js 版本

建议使用 Node.js 18.x 或更高版本

## 部署步骤

1. 在 Vercel 中导入你的 GitHub 仓库
2. 设置环境变量
3. 选择 Next.js 框架
4. 部署

## 常见问题

### 模块找不到错误
如果遇到 `Cannot find module` 错误，请检查：
- 所有依赖是否已安装
- 环境变量是否正确配置
- 文件路径是否正确

### 构建失败
如果构建失败，请检查：
- TypeScript 配置
- 环境变量
- 依赖版本兼容性

## 本地测试

在部署前，建议先在本地测试：

```bash
npm install
npm run build
npm start
```

如果本地构建成功，Vercel 部署通常也会成功。


