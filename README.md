# GamePix Arcade PRO (Next.js 14 + SSR + i18n + Filters + Real Leaderboard)

## 功能
- SSR 拉取 GamePix 目录（`GAMEPIX_SID`）
- 前端“加载更多”分页
- 多语言（中/英）
- 每日精选
- 夜间模式
- **排行榜后端：Supabase 或 Firestore（二选一）**
- **筛选：分类、标签、评分（若接口提供）**
- **SEO：sitemap/robots（next-sitemap）**
- **PWA：manifest.json + 图标**
- **埋点：Google Analytics / GTM**

## 1) 安装与运行
```bash
npm i   # 或 yarn / pnpm
npm run dev
```

### 环境变量（.env.local）
```env
GAMEPIX_SID=49715
GAMEPIX_PAGE_SIZE=24
NEXT_PUBLIC_GAMEPIX_PAGE_SIZE=24
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# 选择排行榜后端：supabase 或 firestore
LEADERBOARD_PROVIDER=supabase

# Supabase
SUPABASE_URL=...
SUPABASE_ANON_KEY=...            # 或使用服务密钥 SUPABASE_SERVICE_KEY

# Firestore （可选，若使用）
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...

# Analytics（可选）
NEXT_PUBLIC_GA_ID=G-XXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# 站点（sitemap 用）
SITE_URL=https://your-domain.com
```

## 2) 配置排行榜
### 2.1 Supabase
- 在 Supabase SQL 编辑器执行 `sql/supabase.sql`
- 设置环境变量 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`
- 选择提供方：`LEADERBOARD_PROVIDER=supabase`
- 前端在玩家点击“开始”时调用 `/api/leaderboard/play`，统计 `plays`。
- `/api/leaderboard/top?n=10` 返回榜单。

### 2.2 Firestore
- 新建 Firestore 数据库（Native 模式）
- 设置 `.env.local` 中的 Firebase 配置
- `LEADERBOARD_PROVIDER=firestore`
- API 自动读写 `leaderboard` 集合（文档 ID = 游戏 id）。

## 3) GamePix 更多筛选
- 本项目会尝试读取 `tags`（或 `labels`）与 `rating/quality` 字段。
- 如果接口未提供这些字段，筛选会自动降级（不生效但不报错）。
- 你也可以在前端对 `title/category` 做本地筛选。

## 4) SEO
- 修改 `next-sitemap.config.js` 的 `siteUrl` 或在环境变量 `SITE_URL` 设置
- 生成站点地图：`npm run sitemap`（会输出到 `public/`）
- 可在 `pages/_document.tsx` 中加入更多 `<meta>`

## 5) PWA
- 已包含 `public/manifest.json` 与占位图标
- 若需要离线缓存，可选择引入 `next-pwa` 进一步增强

## 6) 部署
### Vercel
- 导入仓库，设置环境变量，构建命令 `npm run build`
### Netlify（静态导出）
- 设 `STATIC_EXPORT=true`，`npm run export`，发布目录 `out`
### Nginx
- `npm run build && npm start`（监听 3000）
- 使用反向代理转发到 Node 服务

## 7) 自定义域名/图标/埋点
- 图标位于 `public/icon-*.png`
- GA/GTM：设置 `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_GTM_ID`
