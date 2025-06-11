import sys
import yaml
import asyncio
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QComboBox, QTextEdit, QProgressBar,
    QMessageBox, QFileDialog
)
from PyQt6.QtCore import Qt, QThread, pyqtSignal
from datetime import datetime, timedelta
from pathlib import Path
from loguru import logger

from crawlers.arxiv_crawler import ArxivCrawler
# 导入其他爬虫...

class CrawlerWorker(QThread):
    """爬虫工作线程"""
    progress = pyqtSignal(int)
    status = pyqtSignal(str)
    finished = pyqtSignal()
    
    def __init__(self, config, keywords, sources, days):
        super().__init__()
        self.config = config
        self.keywords = keywords
        self.sources = sources
        self.days = days
        
    def run(self):
        """运行爬虫"""
        try:
            asyncio.run(self._run_crawler())
        except Exception as e:
            self.status.emit(f"Error: {str(e)}")
        finally:
            self.finished.emit()
    
    async def _run_crawler(self):
        """异步运行爬虫"""
        # 初始化爬虫
        crawlers = {
            "arxiv": ArxivCrawler(self.config),
            # 添加其他爬虫...
        }
        
        total_papers = 0
        from_date = datetime.now() - timedelta(days=self.days)
        to_date = datetime.now()
        
        for source in self.sources:
            if source not in crawlers:
                continue
                
            crawler = crawlers[source]
            self.status.emit(f"正在从 {source} 获取论文...")
            
            for keyword in self.keywords:
                papers = await crawler.search(keyword, from_date, to_date)
                total_papers += len(papers)
                
                for i, paper in enumerate(papers):
                    save_path = Path(self.config["download"]["path"]) / source / paper.category
                    await crawler.process_paper(paper, str(save_path))
                    progress = int((i + 1) / len(papers) * 100)
                    self.progress.emit(progress)
                    
        self.status.emit(f"完成！共获取 {total_papers} 篇论文")

class MainWindow(QMainWindow):
    """主窗口"""
    def __init__(self):
        super().__init__()
        self.init_ui()
        self.load_config()
        
    def init_ui(self):
        """初始化UI"""
        self.setWindowTitle("机器视觉文献获取系统")
        self.setMinimumSize(800, 600)
        
        # 主布局
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        layout = QVBoxLayout(main_widget)
        
        # 配置区域
        config_layout = QHBoxLayout()
        
        # 关键词选择
        keyword_layout = QVBoxLayout()
        keyword_layout.addWidget(QLabel("选择领域："))
        self.keyword_combo = QComboBox()
        self.keyword_combo.addItems([
            "计算机视觉基础",
            "深度学习视觉",
            "工业视觉检测",
            "医学图像分析"
        ])
        keyword_layout.addWidget(self.keyword_combo)
        config_layout.addLayout(keyword_layout)
        
        # 数据源选择
        source_layout = QVBoxLayout()
        source_layout.addWidget(QLabel("选择数据源："))
        self.source_combo = QComboBox()
        self.source_combo.addItems([
            "arxiv",
            "ieee",
            "google_scholar",
            "researchgate",
            "cnki"
        ])
        source_layout.addWidget(self.source_combo)
        config_layout.addLayout(source_layout)
        
        # 时间范围选择
        time_layout = QVBoxLayout()
        time_layout.addWidget(QLabel("选择时间范围（天）："))
        self.time_combo = QComboBox()
        self.time_combo.addItems(["7", "30", "90", "180", "365"])
        time_layout.addWidget(self.time_combo)
        config_layout.addLayout(time_layout)
        
        layout.addLayout(config_layout)
        
        # 状态显示
        self.status_text = QTextEdit()
        self.status_text.setReadOnly(True)
        layout.addWidget(self.status_text)
        
        # 进度条
        self.progress_bar = QProgressBar()
        layout.addWidget(self.progress_bar)
        
        # 控制按钮
        button_layout = QHBoxLayout()
        self.start_button = QPushButton("开始获取")
        self.start_button.clicked.connect(self.start_crawler)
        button_layout.addWidget(self.start_button)
        
        self.stop_button = QPushButton("停止")
        self.stop_button.clicked.connect(self.stop_crawler)
        self.stop_button.setEnabled(False)
        button_layout.addWidget(self.stop_button)
        
        layout.addLayout(button_layout)
    
    def load_config(self):
        """加载配置文件"""
        try:
            with open("config/config.yaml", "r", encoding="utf-8") as f:
                self.config = yaml.safe_load(f)
        except Exception as e:
            QMessageBox.critical(self, "错误", f"无法加载配置文件：{str(e)}")
            sys.exit(1)
    
    def start_crawler(self):
        """开始爬虫"""
        self.start_button.setEnabled(False)
        self.stop_button.setEnabled(True)
        self.progress_bar.setValue(0)
        self.status_text.clear()
        
        # 获取选择的参数
        keyword = self.keyword_combo.currentText()
        source = self.source_combo.currentText()
        days = int(self.time_combo.currentText())
        
        # 创建工作线程
        self.worker = CrawlerWorker(
            self.config,
            [keyword],
            [source],
            days
        )
        
        # 连接信号
        self.worker.progress.connect(self.progress_bar.setValue)
        self.worker.status.connect(self.update_status)
        self.worker.finished.connect(self.crawler_finished)
        
        # 启动线程
        self.worker.start()
    
    def stop_crawler(self):
        """停止爬虫"""
        if hasattr(self, "worker"):
            self.worker.terminate()
            self.worker.wait()
            self.crawler_finished()
    
    def update_status(self, message):
        """更新状态信息"""
        self.status_text.append(message)
    
    def crawler_finished(self):
        """爬虫完成"""
        self.start_button.setEnabled(True)
        self.stop_button.setEnabled(False)
        self.progress_bar.setValue(100)

def main():
    """主函数"""
    # 配置日志
    logger.add(
        "logs/crawler.log",
        rotation="1 day",
        retention="30 days",
        level="INFO"
    )
    
    # 启动应用
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec()) 