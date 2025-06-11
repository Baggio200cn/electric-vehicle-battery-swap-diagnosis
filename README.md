# 🔋 Electric Vehicle Battery Swap Diagnosis System

<div align="center">

![System Preview](https://img.shields.io/badge/React-18.x-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue) ![Material--UI](https://img.shields.io/badge/Material--UI-5.x-purple) ![Python](https://img.shields.io/badge/Python-3.x-green)

An intelligent fault diagnosis system for electric vehicle battery swap stations, featuring knowledge graph visualization, decision tree diagnosis, and multi-modal input analysis.

[🚀 Live Demo](https://baggio200cn.github.io/electric-vehicle-battery-swap-diagnosis) • [📚 Documentation](#documentation) • [🤝 Contributing](#contributing)

</div>

## ✨ Key Features

### 🧠 Intelligent Diagnosis Modules
- **Knowledge Graph Diagnosis**: Multi-dimensional semantic similarity analysis
- **Decision Tree Diagnosis**: Structured Q&A workflow for rapid fault localization
- **Smart Fault Diagnosis**: Hybrid diagnostic algorithms with professional solutions

### 📚 Knowledge Management
- **Auto-Generated Knowledge Base**: One-click generation of 20 professional fault diagnosis documents
- **Interactive Knowledge Graph**: HTML5 Canvas-based visualization with node relationships
- **Material Library**: Support for multimedia resources (documents, audio, video, images)

### 🔧 Multi-Modal Input Support
- **Text Diagnosis**: Natural language fault description analysis
- **Video Diagnosis**: Video frame analysis and anomaly detection
- **Audio Diagnosis**: Voice input processing and analysis

### 🎨 Modern UI/UX
- Material Design 3.0 components
- Responsive layout supporting multiple devices
- Intuitive data visualization
- Dark/Light theme support

## 🏗️ Technical Architecture

```
┌─────────────────┬────────────────────┬──────────────────┐
│   Frontend      │     Backend        │   Data Layer     │
├─────────────────┼────────────────────┼──────────────────┤
│ React 18        │ Python FastAPI     │ SQLite Database  │
│ TypeScript      │ Machine Learning   │ LocalStorage     │
│ Material-UI 5   │ NLP Processing     │ IndexedDB        │
│ Canvas Renderer │ Video Analysis     │ File System      │
└─────────────────┴────────────────────┴──────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 14.0.0
- Python >= 3.8
- npm >= 6.0.0

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Baggio200cn/electric-vehicle-battery-swap-diagnosis.git
   cd electric-vehicle-battery-swap-diagnosis
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Python Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize Database**
   ```bash
   python init_database.py
   ```

### Development

1. **Start the React Development Server**
   ```bash
   npm start
   ```
   Visit [http://localhost:3000](http://localhost:3000)

2. **Start the Python Backend** (Optional)
   ```bash
   python machine_vision_literature_system.py
   ```

### Production Build

```bash
npm run build
```

## 📖 User Guide

### 1. Knowledge Base Initialization
1. Click "知识库" (Knowledge Base) tab
2. Click "生成知识库文档" (Generate Knowledge Base)
3. System auto-generates 20 professional documents

### 2. Knowledge Graph Visualization
1. Complete knowledge base initialization
2. Click "查看知识图谱" (View Knowledge Graph)
3. Interactive exploration of node relationships

### 3. Fault Diagnosis
- **Smart Diagnosis**: Input fault description for AI recommendations
- **Decision Tree**: Structured Q&A for quick problem identification

### 4. Material Library Management
1. Upload technical documents, images, videos
2. Automatic categorization and smart tagging
3. One-click integration to knowledge base

## 🎯 System Highlights

### 🔗 Dual Diagnosis Engine
- **Knowledge Graph**: Handles complex associative faults with semantic understanding
- **Decision Tree**: Standardized workflow for rapid response

### 📊 Intelligent Analysis
- Multi-dimensional similarity algorithms
- Automatic relationship discovery
- Confidence evaluation and source tracking

### 🎨 Professional UI Design
- Modern Material Design principles
- Responsive layout for all devices
- Intuitive data visualization

## 📁 Project Structure

```
src/
├── components/           # React Components
│   ├── KnowledgeBase/   # Knowledge Base Management
│   ├── KnowledgeGraph/  # Knowledge Graph Visualization  
│   ├── SmartDiagnosis/  # Smart Diagnosis
│   ├── DecisionTree/    # Decision Tree Diagnosis
│   ├── MaterialLibrary/ # Material Library Management
│   ├── TextInput/       # Text Input Component
│   ├── VideoInput/      # Video Input Component
│   └── AudioInput/      # Audio Input Component
├── api/                 # API Interfaces
├── types/               # TypeScript Type Definitions
├── styles/              # Styling
├── tools/               # Utilities
├── processors/          # Data Processing
└── models/              # ML Models
```

## 🛠️ Core Algorithms

### Similarity Calculation
```python
# TF-IDF + Semantic Vector based similarity
def calculate_similarity(query, documents):
    tfidf_scores = tfidf_vectorizer.transform([query])
    semantic_scores = semantic_model.encode([query])
    return weighted_similarity(tfidf_scores, semantic_scores)
```

### Relationship Mining
```python
# Multi-dimensional feature matching
def discover_relationships(documents):
    features = extract_features(documents)
    relationships = find_associations(features, threshold=0.7)
    return build_graph(relationships)
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run Python tests
python -m pytest tests/

# Run specific test file
npm test -- TextInput.test.tsx
```

## 📈 Performance

- **Load Time**: < 3s initial load
- **Graph Rendering**: 1000+ nodes in < 2s
- **Analysis Speed**: < 500ms for text analysis
- **Memory Usage**: < 100MB average

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Authors

- **Developer**: [Baggio200cn](https://github.com/Baggio200cn)
- **Project Type**: Machine Vision Literature Crawler Extension
- **Tech Stack**: React + TypeScript + Material-UI + Python

## 🔮 Roadmap

- [ ] Integrate ML models for improved diagnosis accuracy
- [ ] Multi-language internationalization support
- [ ] Real-time collaboration features
- [ ] Mobile app development
- [ ] Cloud data synchronization
- [ ] Advanced analytics dashboard
- [ ] API for third-party integrations

## 📞 Support

- 🐛 **Bug Reports**: [Create an Issue](https://github.com/Baggio200cn/electric-vehicle-battery-swap-diagnosis/issues)
- 💡 **Feature Requests**: [Discussions](https://github.com/Baggio200cn/electric-vehicle-battery-swap-diagnosis/discussions)
- 📧 **Contact**: Create an issue for questions

## 🙏 Acknowledgments

- Material-UI team for the excellent component library
- React team for the amazing framework
- Open source community for inspiration and tools

---

<div align="center">

⭐ **If this project helped you, please give it a star!** ⭐

[![GitHub stars](https://img.shields.io/github/stars/Baggio200cn/electric-vehicle-battery-swap-diagnosis?style=social)](https://github.com/Baggio200cn/electric-vehicle-battery-swap-diagnosis/stargazers)

</div> 