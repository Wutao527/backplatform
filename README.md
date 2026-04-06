# 量化回测平台

一个简洁的量化投资策略回测平台，支持数据管理、策略回测和结果报告。

## 技术栈

- **前端**: React + TypeScript + Tailwind CSS
- **UI组件**: shadcn/ui (40+ 组件)
- **构建工具**: Vite v7.2.4
- **部署**: Vercel

## 功能模块

| 模块 | 功能 |
|:---|:---|
| 📥 数据管理 | 基金/ETF/股票/债券数据下载 |
| 📈 回测 | 策略回测配置与运行 |
| 📋 报告 | 回测结果可视化展示 |
| ⚙️ 设置 | 系统配置 |

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 部署到 Vercel

1. Fork 或克隆本仓库到 GitHub
2. 登录 [Vercel](https://vercel.com)
3. 点击 "Add New Project"
4. 导入 GitHub 仓库
5. 框架预设选择 "Vite"
6. 点击 Deploy

## 项目结构

```
src/
├── sections/          # 页面区块组件
│   ├── DataDownload.tsx    # 数据下载
│   ├── BacktestPanel.tsx   # 回测面板
│   └── ReportPanel.tsx     # 报告面板
├── components/        # UI 组件
├── hooks/            # 自定义 Hooks
├── lib/              # 工具函数
├── App.tsx           # 主组件
└── index.css         # 全局样式
```

## 响应式设计

- ✅ 桌面端：顶部导航 + 横向布局
- ✅ 移动端：底部导航 + 卡片式布局

## 许可证

MIT
