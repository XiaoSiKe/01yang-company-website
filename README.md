# 零一扬网络科技 · 公司官网

福州零一扬网络科技有限公司的官方网站源码，用于公司介绍、服务展示、项目预览与合作联系。

> 从零到一， 让人工智能真正落地！

- 公司全称：福州零一扬网络科技有限公司
- 品牌名称：零一扬网络科技
- 官网域名规划：[www.01yang.space](https://www.01yang.space)
- 合作邮箱：[1241798750@qq.com](mailto:1241798750@qq.com)

本仓库用于官网源码管理与备份。上传 GitHub 不代表网站已部署，当前仍可通过本地开发环境预览。

## 页面与功能

- **首页**：公司名称、品牌 Slogan、动态光束背景，以及服务与合作入口。
- **关于零一**：公司主体、创始人、品牌理念与合作流程。
- **服务与合作**：AI SaaS、AI 模型 API、软件定制开发、网络技术服务、AI 教育与培训。
- **项目实践**：折叠式项目画廊，当前使用占位图片，后续替换为真实项目。
- **联系**：邮件入口、微信二维码和技术栈 LogoLoop。

视觉采用极简黑白风格，包含滚动玻璃导航、文字描边与立体动效、卡片轮换和区块入场动画，并提供移动端布局及减少动态效果支持。

## 技术栈

- React、TypeScript 与 Next.js App Router 结构
- Vinext / Vite 开发与构建
- Tailwind CSS 与组件 CSS
- GSAP 交互和滚动动效
- Three.js、React Three Fiber 与 OGL 图形效果
- Lucide 与 React Icons 图标

## 本地开发

需要 Node.js `>=22.13.0` 和 npm。克隆仓库后，在项目根目录执行：

```bash
npm ci
npm run dev
```

默认访问 [http://localhost:3000/](http://localhost:3000/)，实际地址以终端输出为准。

## 检查与构建

```bash
npm run typecheck
npm run lint
npm run build
```

构建成功后，可以通过以下命令预览生产版本：

```bash
npm run start
```

## 目录说明

```text
app/                  页面、全局样式与 SEO 元数据
components/           导航、按钮、背景与动效组件
public/               公司 Logo、微信二维码与分享图片
design-system/        设计规范和首页规则
docs/PRD.md           产品需求文档
THIRD_PARTY_NOTICES.md 第三方组件与资源说明
```

## 维护说明

- 官网域名在 `app/layout.tsx`、`app/robots.ts` 和 `app/sitemap.ts` 中配置，调整时需保持一致。
- 服务内容、项目占位图与联系方式集中在 `app/page.tsx`，更新时同步核对对应资源。
- 密钥、访问令牌等敏感配置不要写入源码；`.env*`、依赖目录和构建产物已由 `.gitignore` 排除。
- 正式上线前，替换项目占位图片，确认邮箱可收件、微信二维码可识别，并补齐适用的备案及政策信息。
- 第三方组件与资源的来源及使用条件见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)，请保留原有声明。
