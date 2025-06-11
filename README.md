# 🔋 电车换电故障排除知识图谱系统

一个基于React和TypeScript开发的智能故障诊断系统，集成了知识图谱可视化、决策树诊断、材料库管理等多种功能，专门用于电动车换电站的故障排除。

![系统预览](https://img.shields.io/badge/React-18.x-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue) ![Material--UI](https://img.shields.io/badge/Material--UI-5.x-purple)

## ✨ 核心功能

### 🧠 智能诊断模块
- **知识图谱诊断**: 基于语义相似性的多维关联分析
- **决策树诊断**: 结构化问答流程，快速定位常见故障
- **智能故障诊断**: 混合诊断算法，提供专业解决方案

### 📚 知识管理
- **自动生成知识库**: 一键生成20个专业故障排除文档
- **知识图谱可视化**: HTML5 Canvas渲染的交互式图谱
- **材料库管理**: 支持文档、音频、视频、图片等多媒体资源

### 🔧 多模态输入
- **文字诊断**: 自然语言故障描述分析
- **视频诊断**: 视频帧分析和异常检测
- **语音诊断**: 音频输入处理

## 🏗️ 技术架构

```
├── 前端框架: React 18 + TypeScript
├── UI组件库: Material-UI 5
├── 知识图谱: 自研Canvas渲染引擎
├── 状态管理: React Hooks
├── 数据存储: LocalStorage + IndexedDB
└── 构建工具: Create React App
```

## 🚀 快速开始

### 环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm start
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用

### 构建生产版本
```bash
npm run build
```

## 📖 使用指南

### 1. 知识库初始化
1. 点击"知识库"选项卡
2. 点击"生成知识库文档"
3. 系统自动生成20个专业文档

### 2. 知识图谱可视化
1. 完成知识库初始化后
2. 点击"查看知识图谱"
3. 交互式浏览节点关系

### 3. 故障诊断
- **智能诊断**: 输入故障描述，获得AI推荐方案
- **决策树诊断**: 通过结构化问答快速定位问题

### 4. 材料库管理
1. 上传相关技术文档、图片、视频
2. 自动分类和智能标签
3. 一键集成到知识库

## 🎯 系统特色

### 🔗 双重诊断引擎
- **知识图谱**: 处理复杂关联故障，语义理解
- **决策树**: 标准化流程，快速响应

### 🎨 专业UI设计
- 现代化Material Design风格
- 响应式布局，支持多设备
- 直观的数据可视化

### 📊 智能分析
- 多维度相似性算法
- 自动关联关系发现
- 置信度评估和来源追踪

## 📁 项目结构

```
src/
├── components/           # React组件
│   ├── KnowledgeBase/   # 知识库管理
│   ├── KnowledgeGraph/  # 知识图谱可视化
│   ├── SmartDiagnosis/  # 智能诊断
│   ├── DecisionTree/    # 决策树诊断
│   ├── MaterialLibrary/ # 材料库管理
│   ├── TextInput/       # 文字输入
│   ├── VideoInput/      # 视频输入
│   └── AudioInput/      # 音频输入
├── api/                 # API接口
├── types/               # TypeScript类型定义
└── utils/               # 工具函数
```

## 🛠️ 开发说明

### 核心算法
1. **相似性计算**: 基于TF-IDF和语义向量
2. **关系挖掘**: 多维度特征匹配
3. **图谱布局**: 力导向算法优化

### 数据流
```
用户输入 → 预处理 → 特征提取 → 算法匹配 → 结果排序 → 可视化展示
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支: `git checkout -b feature/AmazingFeature`
3. 提交更改: `git commit -m 'Add some AmazingFeature'`
4. 推送分支: `git push origin feature/AmazingFeature`
5. 提交Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👨‍💻 作者

- **开发者**: Zhaol
- **项目类型**: 机器视觉文献爬虫扩展应用
- **技术栈**: React + TypeScript + Material-UI

## 🔮 未来规划

- [ ] 集成机器学习模型提升诊断准确率
- [ ] 支持多语言国际化
- [ ] 添加实时协作功能
- [ ] 移动端APP开发
- [ ] 云端数据同步

## 📞 联系方式

如有问题或建议，请提交Issue或联系项目维护者。

---

⭐ 如果这个项目对您有帮助，请给它一个Star！ 