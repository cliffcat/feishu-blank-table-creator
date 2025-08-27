# 飞书多维表格批量创建空白表插件

一个用于飞书多维表格的边栏插件，可以快速批量创建空白表格。

## 功能特性

- 🚀 **批量创建**: 一次性创建多个空白表格
- 📝 **智能命名**: 自动按照"空白表1"、"空白表2"格式命名
- 🔍 **重名检测**: 自动跳过已存在的表格名称
- ✅ **输入验证**: 实时验证输入数量的合法性
- 📊 **进度反馈**: 显示创建进度和结果状态
- 🎨 **现代界面**: 简洁美观的用户界面

## 使用方法

1. 在飞书多维表格中打开插件
2. 输入要创建的表格数量（1-100）
3. 点击"创建表格"按钮
4. 等待创建完成，查看结果反馈

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **SDK**: @lark-base-open/js-sdk ^0.5.0 <mcreference link="https://www.npmjs.com/package/@lark-base-open/js-sdk" index="1">1</mcreference>
- **样式**: 原生CSS（飞书设计规范）

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

### 项目结构

```
├── src/
│   ├── App.tsx          # 主应用组件
│   ├── main.tsx         # 应用入口
│   └── index.css        # 全局样式
├── dist/                # 构建输出目录
├── manifest.json        # 插件配置文件
├── icon.png            # 插件图标
├── package.json        # 项目配置
├── vite.config.ts      # Vite配置
└── tsconfig.json       # TypeScript配置
```

## 插件配置

### 权限设置

插件需要以下权限：
- `base:read` - 读取多维表格信息
- `base:write` - 创建新表格
- `table:read` - 读取表格元数据
- `table:write` - 写入表格数据

### 部署到飞书

1. 构建生产版本：`npm run build`
2. 将 `dist` 目录和 `manifest.json` 打包
3. 在飞书开放平台上传插件包
4. 配置插件权限和发布设置

## 核心功能实现

### 表格命名逻辑

```typescript
const generateUniqueTableNames = (count: number, existingNames: Set<string>): string[] => {
  const names: string[] = [];
  let index = 1;
  
  while (names.length < count) {
    const candidateName = `空白表${index}`;
    if (!existingNames.has(candidateName)) {
      names.push(candidateName);
    }
    index++;
  }
  
  return names;
};
```

### 批量创建表格

```typescript
const createTables = async () => {
  const existingNames = await getExistingTableNames();
  const tableNames = generateUniqueTableNames(tableCount, existingNames);
  
  const results = await Promise.allSettled(
    tableNames.map(name => createSingleTable(name))
  );
  
  // 处理创建结果...
};
```

## 注意事项

- 每次最多创建100个表格
- 表格名称遇到重复会自动跳过序号
- 每个新建表格默认包含一个文本字段
- 需要在飞书多维表格环境中运行

## 许可证

MIT License

## 更新日志

### v1.0.0
- 初始版本发布
- 支持批量创建空白表格
- 实现智能命名和重名检测
- 添加输入验证和错误处理