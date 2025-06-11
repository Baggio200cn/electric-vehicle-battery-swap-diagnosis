import sys
import requests
import json
import os
from datetime import datetime, timedelta
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QVBoxLayout, QHBoxLayout, QWidget, 
    QLabel, QPushButton, QComboBox, QTextEdit, QProgressBar, QMessageBox
)
from PyQt6.QtCore import QThread, pyqtSignal, QTimer
import xml.etree.ElementTree as ET

class ArxivCrawler:
    """简化的ArXiv爬虫"""
    def __init__(self):
        self.base_url = "http://export.arxiv.org/api/query"
        
    def search(self, keywords, max_results=10):
        """搜索论文"""
        try:
            # 构建查询
            query = f"all:{keywords}"
            params = {
                'search_query': query,
                'start': 0,
                'max_results': max_results,
                'sortBy': 'submittedDate',
                'sortOrder': 'descending'
            }
            
            response = requests.get(self.base_url, params=params, timeout=30)
            if response.status_code == 200:
                return self.parse_results(response.text)
            else:
                return []
        except Exception as e:
            print(f"搜索错误: {e}")
            return []
    
    def parse_results(self, xml_text):
        """解析XML结果"""
        papers = []
        try:
            root = ET.fromstring(xml_text)
            
            # 找到所有entry元素
            for entry in root.findall('{http://www.w3.org/2005/Atom}entry'):
                paper = {}
                
                # 标题
                title_elem = entry.find('{http://www.w3.org/2005/Atom}title')
                paper['title'] = title_elem.text.strip() if title_elem is not None else "未知标题"
                
                # 作者
                authors = []
                for author in entry.findall('{http://www.w3.org/2005/Atom}author'):
                    name_elem = author.find('{http://www.w3.org/2005/Atom}name')
                    if name_elem is not None:
                        authors.append(name_elem.text)
                paper['authors'] = ', '.join(authors) if authors else "未知作者"
                
                # 摘要
                summary_elem = entry.find('{http://www.w3.org/2005/Atom}summary')
                paper['abstract'] = summary_elem.text.strip() if summary_elem is not None else "无摘要"
                
                # 发布日期
                published_elem = entry.find('{http://www.w3.org/2005/Atom}published')
                paper['published'] = published_elem.text[:10] if published_elem is not None else "未知日期"
                
                # PDF链接
                pdf_link = None
                for link in entry.findall('{http://www.w3.org/2005/Atom}link'):
                    if link.get('type') == 'application/pdf':
                        pdf_link = link.get('href')
                        break
                paper['pdf_url'] = pdf_link
                
                papers.append(paper)
                
        except Exception as e:
            print(f"解析错误: {e}")
            
        return papers

class CrawlerWorker(QThread):
    """爬虫工作线程"""
    progress = pyqtSignal(int)
    status = pyqtSignal(str)
    result = pyqtSignal(list)
    finished = pyqtSignal()
    
    def __init__(self, domain, source, max_results):
        super().__init__()
        self.domain = domain
        self.source = source
        self.max_results = max_results
        
    def run(self):
        """运行爬虫"""
        try:
            self.status.emit(f"正在从 {self.source} 搜索 {self.domain} 相关论文...")
            
            # 关键词映射
            keywords_map = {
                "计算机视觉基础": "computer vision",
                "深度学习视觉": "deep learning computer vision",
                "工业视觉检测": "industrial vision inspection",
                "医学图像分析": "medical image analysis"
            }
            
            keywords = keywords_map.get(self.domain, "computer vision")
            
            if self.source == "arXiv":
                crawler = ArxivCrawler()
                papers = crawler.search(keywords, self.max_results)
                
                self.status.emit(f"找到 {len(papers)} 篇相关论文")
                self.result.emit(papers)
                
                # 模拟处理进度
                for i in range(101):
                    self.progress.emit(i)
                    self.msleep(20)  # 暂停20毫秒
                    
            else:
                self.status.emit(f"{self.source} 数据源暂未实现")
                self.result.emit([])
                
        except Exception as e:
            self.status.emit(f"搜索出错: {str(e)}")
            self.result.emit([])
        finally:
            self.finished.emit()

class MachineVisionLiteratureApp(QMainWindow):
    """机器视觉文献获取系统主窗口"""
    
    def __init__(self):
        super().__init__()
        self.init_ui()
        self.crawler_worker = None
        
    def init_ui(self):
        """初始化用户界面"""
        self.setWindowTitle("机器视觉文献获取系统")
        self.setGeometry(100, 100, 900, 700)
        
        # 主窗口部件
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        
        # 主布局
        main_layout = QVBoxLayout(main_widget)
        
        # 标题
        title_label = QLabel("机器视觉文献获取系统")
        title_label.setStyleSheet("font-size: 24px; font-weight: bold; padding: 20px; text-align: center;")
        main_layout.addWidget(title_label)
        
        # 控制面板
        control_panel = self.create_control_panel()
        main_layout.addLayout(control_panel)
        
        # 状态显示区
        self.status_text = QTextEdit()
        self.status_text.setReadOnly(True)
        self.status_text.setMaximumHeight(150)
        self.status_text.append("系统已启动，请选择搜索参数后点击开始获取")
        main_layout.addWidget(QLabel("状态信息:"))
        main_layout.addWidget(self.status_text)
        
        # 进度条
        self.progress_bar = QProgressBar()
        main_layout.addWidget(QLabel("进度:"))
        main_layout.addWidget(self.progress_bar)
        
        # 结果显示区
        self.result_text = QTextEdit()
        self.result_text.setReadOnly(True)
        main_layout.addWidget(QLabel("搜索结果:"))
        main_layout.addWidget(self.result_text)
        
    def create_control_panel(self):
        """创建控制面板"""
        layout = QHBoxLayout()
        
        # 领域选择
        domain_layout = QVBoxLayout()
        domain_layout.addWidget(QLabel("选择研究领域:"))
        self.domain_combo = QComboBox()
        self.domain_combo.addItems([
            "计算机视觉基础",
            "深度学习视觉", 
            "工业视觉检测",
            "医学图像分析"
        ])
        domain_layout.addWidget(self.domain_combo)
        layout.addLayout(domain_layout)
        
        # 数据源选择
        source_layout = QVBoxLayout()
        source_layout.addWidget(QLabel("选择数据源:"))
        self.source_combo = QComboBox()
        self.source_combo.addItems([
            "arXiv",
            "IEEE Xplore (待实现)",
            "Google Scholar (待实现)"
        ])
        source_layout.addWidget(self.source_combo)
        layout.addLayout(source_layout)
        
        # 结果数量
        count_layout = QVBoxLayout()
        count_layout.addWidget(QLabel("获取数量:"))
        self.count_combo = QComboBox()
        self.count_combo.addItems(["10", "20", "50", "100"])
        count_layout.addWidget(self.count_combo)
        layout.addLayout(count_layout)
        
        # 控制按钮
        button_layout = QVBoxLayout()
        self.start_button = QPushButton("开始获取")
        self.start_button.clicked.connect(self.start_search)
        self.start_button.setStyleSheet("QPushButton { background-color: #4CAF50; color: white; font-size: 14px; padding: 10px; }")
        
        self.stop_button = QPushButton("停止")
        self.stop_button.clicked.connect(self.stop_search)
        self.stop_button.setEnabled(False)
        self.stop_button.setStyleSheet("QPushButton { background-color: #f44336; color: white; font-size: 14px; padding: 10px; }")
        
        button_layout.addWidget(self.start_button)
        button_layout.addWidget(self.stop_button)
        layout.addLayout(button_layout)
        
        return layout
    
    def start_search(self):
        """开始搜索"""
        domain = self.domain_combo.currentText()
        source = self.source_combo.currentText().split('(')[0].strip()
        max_results = int(self.count_combo.currentText())
        
        if source != "arXiv":
            QMessageBox.warning(self, "提示", "目前只支持arXiv数据源，其他数据源正在开发中")
            return
            
        # 重置界面
        self.result_text.clear()
        self.progress_bar.setValue(0)
        self.start_button.setEnabled(False)
        self.stop_button.setEnabled(True)
        
        # 创建并启动工作线程
        self.crawler_worker = CrawlerWorker(domain, source, max_results)
        self.crawler_worker.progress.connect(self.progress_bar.setValue)
        self.crawler_worker.status.connect(self.update_status)
        self.crawler_worker.result.connect(self.display_results)
        self.crawler_worker.finished.connect(self.search_finished)
        self.crawler_worker.start()
    
    def stop_search(self):
        """停止搜索"""
        if self.crawler_worker and self.crawler_worker.isRunning():
            self.crawler_worker.terminate()
            self.crawler_worker.wait()
        self.search_finished()
    
    def update_status(self, message):
        """更新状态信息"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.status_text.append(f"[{timestamp}] {message}")
    
    def display_results(self, papers):
        """显示搜索结果"""
        if not papers:
            self.result_text.append("未找到相关论文")
            return
            
        self.result_text.clear()
        for i, paper in enumerate(papers, 1):
            self.result_text.append(f"=== 论文 {i} ===")
            self.result_text.append(f"标题: {paper['title']}")
            self.result_text.append(f"作者: {paper['authors']}")
            self.result_text.append(f"发布日期: {paper['published']}")
            self.result_text.append(f"摘要: {paper['abstract'][:200]}...")
            if paper['pdf_url']:
                self.result_text.append(f"PDF链接: {paper['pdf_url']}")
            self.result_text.append("")
    
    def search_finished(self):
        """搜索完成"""
        self.start_button.setEnabled(True)
        self.stop_button.setEnabled(False)
        self.progress_bar.setValue(100)
        self.update_status("搜索完成")

def main():
    """主函数"""
    app = QApplication(sys.argv)
    
    # 设置应用信息
    app.setApplicationName("机器视觉文献获取系统")
    app.setApplicationVersion("1.0")
    
    # 创建主窗口
    window = MachineVisionLiteratureApp()
    window.show()
    
    # 运行应用
    sys.exit(app.exec())

if __name__ == "__main__":
    main()