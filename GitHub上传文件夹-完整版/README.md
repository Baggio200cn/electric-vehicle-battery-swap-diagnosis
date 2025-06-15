# 🔋 电动汽车换电站智能诊断系统 / Electric Vehicle Battery Swap Diagnosis System

<div align="center">

![System Preview](https://img.shields.io/badge/React-18.x-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue) ![Material--UI](https://img.shields.io/badge/Material--UI-5.x-purple) ![Python](https://img.shields.io/badge/Python-3.x-green)

基于React + TypeScript开发的智能诊断平台，专为电动汽车换电站设备故障检测与分析而设计。系统集成了多模态诊断、知识管理、智能分析等核心功能。

An intelligent fault diagnosis system for electric vehicle battery swap stations, featuring multi-modal diagnosis, knowledge management, and intelligent analysis capabilities.

[🚀 在线演示 Live Demo](https://baggio200cn.github.io/electric-vehicle-battery-swap-diagnosis) • [📚 文档 Documentation](#documentation) • [🤝 贡献 Contributing](#contributing)

</div>

## 📋 系统概述 / System Overview

本系统是一个基于React + TypeScript开发的智能诊断平台，专为电动汽车换电站设备故障检测与分析而设计。系统集成了多模态诊断、知识管理、智能分析等核心功能。

This system is an intelligent diagnostic platform developed with React + TypeScript, specifically designed for fault detection and analysis of electric vehicle battery swap station equipment.

---

## 🎯 核心功能模块 / Core Features

### 1. 🔍 多模态诊断系统 / Multi-Modal Diagnosis System

#### 📝 文本诊断 / Text Diagnosis
- **功能描述**: 通过文本描述进行故障分析
- **输入方式**: 文本框输入故障现象描述
- **分析能力**: 基于关键词匹配和知识库检索
- **输出结果**: 故障类型、严重程度、解决方案

#### 🖼️ 图片诊断 / Image Diagnosis
- **功能描述**: 上传设备图片进行视觉故障检测
- **支持格式**: JPG、PNG、GIF等主流图片格式
- **检测算法**: 
  - 腐蚀检测（红色像素比例 > 5%）
  - 裂纹检测（暗色区域比例 > 15%）
  - 磨损检测（亮度值 < 120）
  - 过热检测（红色通道异常）
- **批量处理**: 支持多图片同时上传分析
- **知识库集成**: 结合专业知识库提供精准诊断

#### 🎬 视频诊断 / Video Diagnosis
- **功能描述**: 上传设备运行视频进行动态分析
- **支持格式**: MP4、AVI、MOV等视频格式
- **分析维度**: 运行状态、异常行为、性能指标
- **帧级分析**: 逐帧检测异常情况

#### 🎵 音频诊断 / Audio Diagnosis
- **功能描述**: 通过设备运行声音判断故障
- **支持格式**: MP3、WAV、AAC等音频格式
- **分析技术**: 频谱分析、异响检测
- **应用场景**: 机械振动、电机异响等

### 2. 🧠 智能诊断助手 / Intelligent Diagnosis Assistant

#### 🌟 AI驱动分析 / AI-Driven Analysis
- **智能推理**: 基于多源数据综合分析
- **模式识别**: 自动识别常见故障模式
- **预测性维护**: 提前预警潜在问题
- **决策支持**: 提供专业维修建议

#### 🔄 自动状态清理 / Automatic State Management
- **智能切换**: 切换诊断模式时自动清理前一次结果
- **状态隔离**: 不同诊断工具间结果独立
- **数据保护**: 非诊断功能（素材库、知识图谱）状态保持

### 3. 📚 知识管理系统 / Knowledge Management System

#### 📖 专业知识库 / Professional Knowledge Base
- **预置内容**: 6大专业文档覆盖核心领域
  - 机械手臂故障诊断
  - 电池连接器故障分析  
  - 安全系统监控要点
  - BMS电池管理系统
  - 预防性维护流程
  - 环境监控系统
- **动态扩展**: 支持用户添加自定义知识文档
- **智能分类**: 自动标签和分类管理
- **关联分析**: 文档间智能关联推荐

#### 🕸️ 知识图谱可视化 / Knowledge Graph Visualization
- **图形化展示**: D3.js驱动的交互式知识网络
- **关系映射**: 文档间关联关系可视化
- **动态更新**: 知识库变化时图谱自动重构
- **交互探索**: 支持节点点击、拖拽、缩放等操作

### 4. 📁 素材库管理 / Material Library Management

#### 📂 文件管理 / File Management
- **多格式支持**: 文档、图片、视频、音频等
- **智能导入**: 自动识别文件类型和编码
- **编码处理**: GBK/UTF-8自动检测，解决乱码问题
- **元数据提取**: 自动提取文件信息和属性

#### 🔍 网络搜索集成 / Network Search Integration
- **多源搜索**: 集成arXiv、PubMed等学术数据库
- **一键导入**: 搜索结果直接导入素材库
- **自动转换**: 符合条件的素材自动转为知识文档
- **智能筛选**: 基于内容长度和质量自动筛选

#### 📊 诊断日志 / Diagnosis Logs
- **自动记录**: 每次诊断结果自动保存
- **详细信息**: 包含诊断类型、时间、结果、文件等
- **历史追踪**: 完整的诊断历史记录
- **数据统计**: 诊断次数、异常比例等统计信息

### 5. ⚙️ 系统设置 / System Settings

#### 🎨 标识管理 / Logo Management
- **Logo上传**: 支持自定义系统标识
- **格式支持**: JPG、PNG、GIF等图片格式
- **实时预览**: 上传后立即在标题栏显示
- **永久保存**: localStorage持久化存储
- **多Logo管理**: 支持多个自定义Logo切换
- **预设选择**: 提供默认图标选项

#### 🔧 界面定制 / Interface Customization
- **主题设置**: Material-UI主题定制
- **布局调整**: 响应式设计适配不同屏幕
- **用户偏好**: 个性化设置保存

---

## 🛠️ 技术特性 / Technical Features

### 💻 前端技术栈 / Frontend Tech Stack
- **框架**: React 18 + TypeScript
- **UI库**: Material-UI (MUI)
- **状态管理**: React Hooks
- **数据可视化**: D3.js
- **构建工具**: Create React App

### 🔒 数据安全 / Data Security
- **本地存储**: localStorage数据持久化
- **类型安全**: 完整的TypeScript类型定义
- **错误处理**: 全面的异常捕获和处理
- **数据验证**: 输入数据格式验证

### 🚀 性能优化 / Performance Optimization
- **懒加载**: 组件按需加载
- **缓存机制**: 智能数据缓存
- **响应式设计**: 移动端适配
- **代码分割**: 优化加载性能

---

## 📈 系统统计 / System Statistics

### 📊 实时监控 / Real-time Monitoring
- **总帧数**: 视频分析总帧数统计
- **已分析帧数**: 完成分析的帧数
- **异常帧数**: 检测到异常的帧数
- **异常比例**: 异常帧数占比
- **诊断日志**: 历史诊断记录数量

### 📋 数据管理 / Data Management
- **知识文档**: 6个预置 + 用户自定义
- **素材文件**: 支持无限制文件存储
- **诊断记录**: 完整的操作历史
- **自定义Logo**: 多个Logo管理

---

## 🎯 应用场景 / Application Scenarios

### 🏭 工业应用 / Industrial Applications
- **换电站运维**: 设备故障快速诊断
- **预防性维护**: 提前发现潜在问题
- **技术培训**: 知识库辅助培训
- **质量控制**: 设备状态监控

### 👥 用户群体 / Target Users
- **运维工程师**: 日常设备检查和维护
- **技术专家**: 复杂故障分析和解决
- **管理人员**: 设备状态监控和决策
- **培训人员**: 技术知识传授和学习

---

## 🚀 快速开始 / Quick Start

### 环境要求 / Prerequisites
- Node.js >= 14.0.0
- Python >= 3.8
- npm >= 6.0.0

### 安装步骤 / Installation

1. **克隆仓库 / Clone Repository**
   ```bash
   git clone https://github.com/Baggio200cn/electric-vehicle-battery-swap-diagnosis.git
   cd electric-vehicle-battery-swap-diagnosis
   ```

2. **安装前端依赖 / Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **安装Python依赖 / Install Python Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **初始化数据库 / Initialize Database**
   ```bash
   python init_database.py
   ```

### 开发模式 / Development

1. **启动React开发服务器 / Start React Development Server**
   ```bash
   npm start
   ```
   访问 [http://localhost:3000](http://localhost:3000)

2. **启动Python后端 / Start Python Backend** (可选 / Optional)
   ```bash
   python machine_vision_literature_system.py
   ```

### 生产构建 / Production Build

```bash
npm run build
```

---

## 📁 项目结构 / Project Structure

```
src/
├── components/           # React组件 / React Components
│   ├── KnowledgeBase/   # 知识库管理 / Knowledge Base Management
│   ├── KnowledgeGraph/  # 知识图谱可视化 / Knowledge Graph Visualization  
│   ├── SmartDiagnosis/  # 智能诊断 / Smart Diagnosis
│   ├── DecisionTree/    # 决策树诊断 / Decision Tree Diagnosis
│   ├── MaterialLibrary/ # 素材库管理 / Material Library Management
│   ├── TextInput/       # 文本输入组件 / Text Input Component
│   ├── VideoInput/      # 视频输入组件 / Video Input Component
│   ├── ImageInput/      # 图片输入组件 / Image Input Component
│   └── AudioInput/      # 音频输入组件 / Audio Input Component
├── api/                 # API接口 / API Interfaces
├── types/               # TypeScript类型定义 / TypeScript Type Definitions
├── styles/              # 样式文件 / Styling
├── tools/               # 工具函数 / Utilities
├── processors/          # 数据处理 / Data Processing
└── models/              # 机器学习模型 / ML Models
```

---

## ✨ 系统亮点 / System Highlights

1. **🎯 专业性**: 专为电动汽车换电站设计的专业诊断系统
2. **🔄 多模态**: 支持文本、图片、视频、音频多种诊断方式
3. **🧠 智能化**: AI驱动的智能分析和推理能力
4. **📚 知识化**: 完整的知识管理和图谱可视化
5. **🔧 可定制**: 高度可定制的界面和功能设置
6. **💾 数据安全**: 本地化数据存储，保护用户隐私
7. **📱 响应式**: 完美适配桌面和移动设备
8. **🚀 高性能**: 优化的代码结构和加载性能

---

## 🧪 测试 / Testing

```bash
# 运行所有测试 / Run all tests
npm test

# 运行Python测试 / Run Python tests
python -m pytest tests/

# 运行特定测试文件 / Run specific test file
npm test -- TextInput.test.tsx
```

---

## 📈 性能指标 / Performance Metrics

- **加载时间 / Load Time**: < 3s 初始加载
- **图谱渲染 / Graph Rendering**: 1000+ 节点 < 2s
- **分析速度 / Analysis Speed**: < 500ms 文本分析
- **内存使用 / Memory Usage**: < 100MB 平均

---

## 🤝 贡献指南 / Contributing

欢迎贡献代码！请查看我们的 [贡献指南](CONTRIBUTING.md)。

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

1. Fork 仓库 / Fork the repository
2. 创建功能分支 / Create a feature branch: `git checkout -b feature/AmazingFeature`
3. 提交更改 / Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. 推送到分支 / Push to the branch: `git push origin feature/AmazingFeature`
5. 打开Pull Request / Open a Pull Request

---

## 📝 许可证 / License

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 作者 / Authors

- **开发者 / Developer**: [Baggio200cn](https://github.com/Baggio200cn)
- **项目类型 / Project Type**: 机器视觉文献爬虫扩展 / Machine Vision Literature Crawler Extension
- **技术栈 / Tech Stack**: React + TypeScript + Material-UI + Python

---

## 🔮 发展路线图 / Roadmap

- [ ] 集成更多ML模型提高诊断准确性 / Integrate more ML models for improved diagnosis accuracy
- [ ] 多语言国际化支持 / Multi-language internationalization support
- [ ] 实时协作功能 / Real-time collaboration features
- [ ] 移动端APP开发 / Mobile app development
- [ ] 云端数据同步 / Cloud data synchronization
- [ ] 高级数据分析仪表板 / Advanced analytics dashboard
- [ ] 第三方API集成 / API for third-party integrations

---

## 📞 支持 / Support

- 🐛 **Bug报告 / Bug Reports**: [创建Issue / Create an Issue](https://github.com/Baggio200cn/electric-vehicle-battery-swap-diagnosis/issues)
- 💡 **功能请求 / Feature Requests**: [讨论区 / Discussions](https://github.com/Baggio200cn/electric-vehicle-battery-swap-diagnosis/discussions)
- 📧 **联系方式 / Contact**: 创建Issue提问 / Create an issue for questions

---

## 🙏 致谢 / Acknowledgments

- Material-UI团队提供的优秀组件库 / Material-UI team for the excellent component library
- React团队提供的出色框架 / React team for the amazing framework
- 开源社区的灵感和工具 / Open source community for inspiration and tools

---

<div align="center">

⭐ **如果这个项目对您有帮助，请给它一个星标！/ If this project helped you, please give it a star!** ⭐

[![GitHub stars](https://img.shields.io/github/stars/Baggio200cn/electric-vehicle-battery-swap-diagnosis?style=social)](https://github.com/Baggio200cn/electric-vehicle-battery-swap-diagnosis/stargazers)

</div> 