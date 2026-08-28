# 零一扬网络科技 · 公司官网

福州零一扬网络科技有限公司的官方网站源码，用于公司介绍、服务展示、项目预览与合作联系。

> 从零到一， 让人工智能真正落地！

- 公司全称：福州零一扬网络科技有限公司
- 品牌名称：零一扬网络科技
- 正式官网域名：[www.01yang.space](https://www.01yang.space)
- 合作邮箱：[1241798750@qq.com](mailto:1241798750@qq.com)
- GitHub 源码仓库：[XiaoSiKe/01yang-company-website](https://github.com/XiaoSiKe/01yang-company-website)

官网已于2026-08-28开放域名访问，裸域自动跳转到上述正式地址。源码已迁入公开仓库，完整提交历史保留；GitHub CI、主分支保护、云效自动发布与官网回滚均已验证。网站采用静态构建与阿里云 ECS 独立目录部署，备案网站名称待更新等运维事项统一见手册的交付记录。

## 页面与功能

- **首页**：公司名称、品牌 Slogan、动态光束背景，以及服务与合作入口。
- **关于零一**：公司主体、创始人、品牌理念与合作流程。
- **服务与合作**：AI SaaS、AI 模型 API、软件定制开发、网络技术服务、AI 教育与培训。
- **项目实践**：折叠式项目画廊，当前使用占位图片，后续替换为真实项目。
- **联系**：邮件入口、微信二维码和技术栈 LogoLoop。

视觉采用极简黑白风格，包含滚动玻璃导航、文字描边与立体动效、卡片轮换和区块入场动画，并提供移动端布局及减少动态效果支持。

## 技术栈

- React、TypeScript 与 Next.js App Router 结构
- Vinext / Vite 开发与静态导出，Nginx 提供生产静态资源
- Tailwind CSS 与组件 CSS
- GSAP 交互和滚动动效
- Three.js、React Three Fiber 与 OGL 图形效果
- Lucide 与 React Icons 图标

## 本地开发

使用 `.nvmrc` 固定的 Node.js `24.16.0` 和 npm。克隆仓库后，在项目根目录执行：

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
npm run verify:static
```

也可运行 `npm run ci:verify` 完成上述检查。静态制品位于 `dist/client/`，不是 `out/`。构建成功后，可以通过以下命令预览静态版本：

```bash
npm run start
```

静态预览不使用热更新；重新构建后请重启预览进程并刷新浏览器。

## 目录说明

```text
app/                  页面、全局样式与 SEO 元数据
components/           导航、按钮、背景与动效组件
public/               品牌、二维码、占位图片、字体许可及 robots/sitemap
design-system/        设计规范和首页规则
docs/PRD.md           产品需求文档
docs/运维手册.md       环境、发布、备案信息与恢复方法
deploy/               云效 YAML、专用 SSH 发布工具及 Nginx/TLS 模板
scripts/              静态制品检查与本地运维助手
tests/                制品安全检查器测试
THIRD_PARTY_NOTICES.md 第三方组件与资源说明
```

## 维护说明

- 官网域名在 `app/layout.tsx`、`public/robots.txt` 和 `public/sitemap.xml` 中配置，调整时需保持一致。
- 服务内容、项目占位图与联系方式集中在 `app/page.tsx`，更新时同步核对对应资源。
- 运维统一入口见 [中文运维手册](docs/运维手册.md)，包含 GitHub CI、云效构建与专用 SSH 发布、凭据轮换、备份恢复及实际验收状态；真实配置保存在项目之外，网站开发与构建不读取运维令牌。
- 官网GitHub操作使用`npm run github -- <gh参数>`，读取官网专用认证目录，不切换其它项目的全局GitHub账号。
- 当前画廊仍为占位展示。正式展示项目案例前应替换真实素材；上线前核对邮箱、二维码和备案信息。
- 第三方组件与资源的来源及使用条件见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。构建会发布 `/THIRD_PARTY_NOTICES.txt` 和 `/licenses/Geist-OFL.txt`，请保留原有声明。
