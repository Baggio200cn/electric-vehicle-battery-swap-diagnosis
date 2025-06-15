# 🔋 电动汽车换电站智能诊断系统

## 项目简介

这是一个基于React + TypeScript开发的电动汽车换电站智能诊断系统，集成了DeepSeek AI技术，提供多模态故障诊断、知识库管理、智能分析等功能。

## 🚀 主要功能

### 🔍 多模态诊断
- **文本诊断**: 基于故障描述进行智能分析
- **图像诊断**: 上传设备图片进行视觉检测
- **视频诊断**: 分析设备运行视频识别异常
- **音频诊断**: 通过声音特征检测设备故障

### 📚 知识库管理
- **文献搜索**: 集成arXiv、PubMed等学术数据库
- **知识图谱**: 可视化知识关联关系
- **智能推荐**: 基于诊断结果推荐相关文献

### 🛠️ 智能工具
- **决策树**: 结构化故障诊断流程
- **性能监控**: 实时系统状态监控
- **数据分析**: 故障统计与趋势分析
- **部署管理**: 系统部署与配置管理

## 🏗️ 技术架构

### 前端技术栈
- **React 18**: 现代化UI框架
- **TypeScript**: 类型安全的JavaScript
- **Material-UI**: 现代化UI组件库
- **React Router**: 单页应用路由

### 后端集成
- **DeepSeek API**: AI智能分析引擎
- **Node.js**: 后端服务支持
- **RESTful API**: 标准化接口设计

### 部署方案
- **GitHub Pages**: 静态网站托管
- **GitHub Actions**: 自动化CI/CD
- **多层构建策略**: 确保部署成功

## 📦 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- 现代浏览器

### 安装依赖
```bash
npm install --legacy-peer-deps
```

### 开发模式
```bash
npm start
```

### 生产构建
```bash
npm run build
```

### 自定义构建（推荐）
```bash
node build-no-eslint.js
```

## 🌐 在线访问

项目已部署到GitHub Pages，可通过以下地址访问：
- **主页**: https://your-username.github.io/electric-vehicle-battery-swap-diagnosis/

## 📋 功能特性

### 🎯 智能诊断
- 支持文本、图像、视频、音频多种输入方式
- 基于DeepSeek AI的智能分析引擎
- 实时故障检测与预警
- 详细的诊断报告与解决方案

### 📊 数据分析
- 故障统计与趋势分析
- 设备性能监控
- 历史数据对比
- 可视化图表展示

### 🔧 系统管理
- 用户权限管理
- 系统配置管理
- 日志记录与审计
- 自动化部署支持

## 🛠️ 开发指南

### 项目结构
```
src/
├── components/          # React组件
│   ├── TextInput/      # 文本输入组件
│   ├── ImageInput/     # 图像输入组件
│   ├── VideoInput/     # 视频输入组件
│   ├── AudioInput/     # 音频输入组件
│   ├── MaterialLibrary/ # 素材库组件
│   ├── KnowledgeGraph/ # 知识图谱组件
│   └── ...
├── api/                # API接口
├── types/              # TypeScript类型定义
└── styles/             # 样式文件
```

### 构建配置
- 使用Create React App作为基础框架
- 支持TypeScript严格模式
- 集成ESLint代码检查
- 自定义构建脚本处理兼容性问题

## 🚀 部署说明

### GitHub Actions自动部署
项目配置了GitHub Actions工作流，推送到main分支时自动触发部署：

1. 自动安装依赖
2. 执行构建流程
3. 部署到GitHub Pages
4. 更新在线版本

### 手动部署
```bash
# 构建项目
npm run build

# 部署到GitHub Pages
npm run deploy
```

## 🔧 配置说明

### 环境变量
- `REACT_APP_DEEPSEEK_API_KEY`: DeepSeek API密钥
- `REACT_APP_API_BASE_URL`: 后端API基础URL

### 构建配置
- `homepage`: 设置为GitHub Pages路径
- `build-no-eslint.js`: 自定义构建脚本，跳过ESLint错误

## 📝 更新日志

### v1.0.0 (2025-06-15)
- ✅ 完成基础功能开发
- ✅ 集成DeepSeek AI引擎
- ✅ 实现多模态诊断
- ✅ 添加知识库管理
- ✅ 配置GitHub Actions部署
- ✅ 优化构建流程

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- 项目链接: https://github.com/your-username/electric-vehicle-battery-swap-diagnosis
- 问题反馈: https://github.com/your-username/electric-vehicle-battery-swap-diagnosis/issues

## 🙏 致谢

- [React](https://reactjs.org/) - 前端框架
- [Material-UI](https://mui.com/) - UI组件库
- [DeepSeek](https://www.deepseek.com/) - AI分析引擎
- [GitHub Pages](https://pages.github.com/) - 静态网站托管 