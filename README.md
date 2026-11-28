# Glyvia

Glyvia 是康莱德挑战赛（Conrad Challenge）2026–2027 的学生研究项目：用口内唾液传感器做免扎针的葡萄糖监测。本仓库是面向评委和投资人的单页静态网站，默认英文，可切换中文。网址：https://glyvia.us/

## 本地预览

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

- English: http://127.0.0.1:4173/
- 中文：http://127.0.0.1:4173/?lang=zh

## 文件

- `dist/index.html`：全部内容。英文写在标签里，中文写在 `data-zh` 属性里。
- `dist/style.css`：样式，深色主题，包含打印样式。
- `dist/site.js`：语言切换、移动端菜单、导航高亮、研究计划图上的"今天"标记。
- `dist/assets/`：概念渲染图和 logo。

## 修改文字

改英文就改标签里的文字，改中文就改同一标签的 `data-zh`。带 `data-zh` 的标签里面不要再嵌套别的标签，否则切换语言时里面的标签会被清掉。

## 部署

没有构建步骤，直接发布 `dist/` 目录。用 Cloudflare Pages 时，构建命令留空，输出目录填 `dist`。
