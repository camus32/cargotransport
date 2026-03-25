# 货物运输分配工具

一个用于货物运输分配的网页应用，支持导入Excel货物数据、添加车辆、分配货物、实时统计剩余货物，并导出分配结果。

## 功能特性

- 📦 **货物管理**：导入Excel货物清单，支持手动添加货物
- 🚛 **车辆管理**：添加多辆运输车，记录车型、占长、占宽、重量、运费
- 📊 **货物分配**：为每辆车选择货物并设置数量，实时验证库存
- 📈 **实时统计**：显示剩余货物、分配进度、总重量等统计信息
- 📥 **导出Excel**：导出车辆分配结果到Excel表格
- 🔍 **搜索筛选**：支持按货物名称、编号搜索

## 技术栈

- React 18 + TypeScript
- Tailwind CSS
- shadcn/ui 组件库
- xlsx (Excel读写)
- Vite (构建工具)

## 本地使用

### 1. 克隆/下载项目

```bash
git clone <仓库地址>
cd 货物运输分配工具
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 即可使用

### 4. 构建生产版本

```bash
npm run build
```

构建后的文件在 `dist` 目录中

## 部署到 GitHub Pages

### 方法一：使用 GitHub Actions 自动部署

1. 在 GitHub 创建新仓库，上传项目代码

2. 修改 `vite.config.ts`，设置你的仓库名称：

```typescript
export default defineConfig({
  base: '/你的仓库名/',
  // ...
});
```

3. 创建 `.github/workflows/deploy.yml` 文件：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

4. 在 GitHub 仓库设置中启用 Pages：
   - Settings → Pages → Source 选择 "GitHub Actions"

5. 推送代码到 main 分支，自动部署

### 方法二：手动部署

1. 构建项目：

```bash
npm run build
```

2. 将 `dist` 目录中的文件上传到 GitHub 仓库的 `gh-pages` 分支

3. 在仓库设置中启用 Pages，选择 `gh-pages` 分支

## Excel导入格式

导入的Excel文件需要包含以下列：

| 列名 | 说明 |
|------|------|
| 序号 | 货物序号 |
| 名称 | 货物名称 |
| 总编号 | 货物编号 |
| 部位 | 货物类别 |
| 数量(件) | 总数量 |
| 长度Length(m) | 长度(m) |
| 宽度Width(m) | 宽度(m) |
| 高度height(m) | 高度(m) |
| 单件净重(t) | 净重(t) |
| 单件毛重（t） | 毛重(t) |
| 总重量（t） | 总重量(t) |
| 备注 | 备注信息 |
| 所在地 | 存放位置 |

## 导出格式

导出的Excel包含以下列：

- 序号、车辆名称、车型、占长(m)、占宽(m)、重量(t)、运费(元)
- 货物序号、货物名称、货物编号、数量(件)
- 长度(m)、宽度(m)、高度(m)
- 单件毛重(t)、货物总重(t)、货物备注

## 使用流程

1. **导入货物**：点击顶部"点击或拖拽上传Excel"导入货物数据
2. **添加车辆**：点击"添加车辆"创建运输车，填写车辆信息
3. **分配货物**：在车辆卡片中点击"添加货物"，选择货物并设置数量
4. **查看统计**：底部面板实时显示分配进度和剩余货物
5. **导出结果**：点击"导出Excel"下载分配结果

## 许可证

MIT License
