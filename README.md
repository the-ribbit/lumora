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

构建产物输出到 `dist/`。本项目配置 `base: '/'`，适配自定义域名根路径部署；`public/CNAME` 会在构建时自动拷贝到 `dist/` 根目录。

## 素材

所有视觉素材均存放在 `input_assets/`，由 Vite 打包，不依赖任何 CDN、在线字体或远程资源。

## 部署

GitHub Pages 从 `gh-pages` 分支根目录部署（内容为 `dist/` 构建产物），绑定自定义域名，可通过 `https://enterlumora.top/` 访问。
