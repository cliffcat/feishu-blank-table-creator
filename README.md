# 飞书空白表格创建器 🚀

一个高效的飞书多维表格边栏插件，支持批量创建空白表格，提升工作效率。

## ✨ 功能特性

- 🔢 **批量创建**：支持一次性创建多个空白表格
- 🏷️ **智能命名**：自动按"空白表1"、"空白表2"格式命名
- 🔍 **重复检测**：自动检测并跳过重复名称
- ✅ **实时验证**：输入内容实时验证，防止错误操作
- 👍 **点赞功能**：支持用户点赞，数据本地持久化
- 📝 **反馈渠道**：集成飞书表单，便于用户反馈
- 📱 **响应式设计**：适配不同屏幕尺寸

## 📋 使用说明

1. 在飞书多维表格中打开插件
2. 输入要创建的表格数量（正整数）
3. 点击"创建表格"按钮
4. 系统自动创建并命名表格
5. 查看创建结果反馈

## 🛠️ 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **样式**：CSS3 + 响应式设计
- **API**：飞书开放平台 API
- **存储**：localStorage（点赞数据持久化）

## 开发指南

### 环境要求

- Node.js >= 16
- npm >= 8

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000 查看开发效果

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录

## 📦 项目结构

```
├── src/
│   ├── App.tsx          # 主应用组件
│   ├── main.tsx         # 应用入口
│   └── index.css        # 全局样式
├── manifest.json        # 插件配置文件
├── icon.svg            # 插件图标
├── index.html          # 插件入口页面
└── dist/               # 构建输出目录
```

## 🚀 快速开始

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建项目
npm run build
```

### 插件安装

1. 下载发布包：`blank_table_creator_v1.0.zip` (994KB)
2. 在飞书开放平台上传插件包
3. 按照飞书插件发布流程进行审核

## 🎯 核心功能

### 批量创建逻辑
- 输入验证：只允许正整数
- 命名规则："空白表" + 数字后缀
- 重复处理：自动跳过已存在的名称
- 进度反馈：实时显示创建状态

### 用户体验优化
- 实时输入验证和错误提示
- 加载状态显示
- 成功/失败反馈
- 点赞功能增强用户参与度

## 📊 发布信息

- **版本**：v1.0
- **发布日期**：2025-01-27
- **文件大小**：994KB（压缩后）
- **兼容性**：现代浏览器

## 🔗 相关链接

- **在线预览**：[https://blank-table-creator-o8c6pwec0-cliffcats-projects.vercel.app](https://blank-table-creator-o8c6pwec0-cliffcats-projects.vercel.app)
- **反馈表单**：[https://haloeffect.feishu.cn/share/base/form/shrcngPFlWQnIGKoepw11C9EJah](https://haloeffect.feishu.cn/share/base/form/shrcngPFlWQnIGKoepw11C9EJah)

## 👨‍💻 开发者

- **作者**：隐公子
- **联系方式**：通过反馈表单联系

## 📄 许可证

MIT License
