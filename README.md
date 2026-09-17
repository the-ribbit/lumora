# 澄境 · Lumora

一个面向电脑浏览器的正念与专注应用单页网站。电影感的全屏首屏配合四种动态风景（金色时刻、静水、深林、静谧黎明），引导用户在嘈杂世界里找回宁静。

## 技术栈

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 3
- lucide-react

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

构建产物输出到 `dist/`。本项目已配置 `base: '/lumora/'`，适配 GitHub Pages 子路径部署。

## 素材

所有视觉素材均存放在 `input_assets/`，由 Vite 打包，不依赖任何 CDN、在线字体或远程资源。

## 部署

部署到 GitHub Pages 后可通过 `https://the-ribbit.github.io/lumora/` 访问。
