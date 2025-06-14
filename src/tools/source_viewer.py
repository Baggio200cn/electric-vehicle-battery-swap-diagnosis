import sys
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                           QHBoxLayout, QLabel, QLineEdit, QComboBox, 
                           QPushButton, QTableWidget, QTableWidgetItem,
                           QTabWidget, QTextBrowser)
from PyQt6.QtCore import Qt
import os
from sqlalchemy import func
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.models.database import DatabaseManager, Paper, Author, Keyword

class SourceViewer(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("文献数据源查询工具")
        self.setGeometry(100, 100, 1200, 800)
        
        # 初始化数据库管理器
        self.db_manager = DatabaseManager('sqlite:///papers.db')
        
        # 创建主窗口部件
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        layout = QVBoxLayout(main_widget)
        
        # 创建数据源选择区域
        source_layout = QHBoxLayout()
        
        # 数据源选择
        self.source_combo = QComboBox()
        self.source_combo.addItems(['全部', 'arXiv', 'IEEE', 'Google Scholar', 'CNKI'])
        source_layout.addWidget(QLabel("数据源:"))
        source_layout.addWidget(self.source_combo)
        
        # 时间范围选择
        self.year_combo = QComboBox()
        current_year = 2024
        years = [str(year) for year in range(current_year, current_year-10, -1)]
        self.year_combo.addItems(['全部'] + years)
        source_layout.addWidget(QLabel("年份:"))
        source_layout.addWidget(self.year_combo)
        
        # 搜索按钮
        search_button = QPushButton("查询")
        search_button.clicked.connect(self.perform_search)
        source_layout.addWidget(search_button)
        
        # 添加统计按钮
        stats_button = QPushButton("统计分析")
        stats_button.clicked.connect(self.show_statistics)
        source_layout.addWidget(stats_button)
        
        source_layout.addStretch()
        layout.addLayout(source_layout)
        
        # 创建标签页
        self.tab_widget = QTabWidget()
        
        # 论文列表标签页
        self.papers_table = QTableWidget()
        self.papers_table.setColumnCount(7)
        self.papers_table.setHorizontalHeaderLabels([
            "标题", "作者", "发布日期", "来源", "DOI", "引用数", "本地路径"
        ])
        self.papers_table.setColumnWidth(0, 300)  # 标题
        self.papers_table.setColumnWidth(1, 200)  # 作者
        self.papers_table.setColumnWidth(2, 100)  # 发布日期
        self.papers_table.setColumnWidth(3, 80)   # 来源
        self.papers_table.setColumnWidth(4, 150)  # DOI
        self.papers_table.setColumnWidth(5, 70)   # 引用数
        self.papers_table.setColumnWidth(6, 200)  # 本地路径
        
        # 统计信息标签页
        self.stats_browser = QTextBrowser()
        
        self.tab_widget.addTab(self.papers_table, "论文列表")
        self.tab_widget.addTab(self.stats_browser, "统计信息")
        
        layout.addWidget(self.tab_widget)
        
        # 加载初始数据
        self.perform_search()
    
    def perform_search(self):
        """执行搜索"""
        source = self.source_combo.currentText()
        year = self.year_combo.currentText()
        
        session = self.db_manager.Session()
        try:
            query = session.query(Paper)
            
            if source != '全部':
                query = query.filter(Paper.source == source)
            
            if year != '全部':
                from datetime import datetime
                start_date = datetime(int(year), 1, 1)
                end_date = datetime(int(year), 12, 31)
                query = query.filter(Paper.published_date.between(start_date, end_date))
            
            papers = query.all()
            self.display_papers(papers)
            
        finally:
            session.close()
    
    def display_papers(self, papers):
        """在表格中显示论文"""
        self.papers_table.setRowCount(len(papers))
        
        for row, paper in enumerate(papers):
            # 标题
            self.papers_table.setItem(row, 0, QTableWidgetItem(paper.title))
            
            # 作者
            authors = [author.name for author in paper.authors]
            self.papers_table.setItem(row, 1, QTableWidgetItem(', '.join(authors)))
            
            # 发布日期
            date_str = paper.published_date.strftime('%Y-%m-%d') if paper.published_date else ''
            self.papers_table.setItem(row, 2, QTableWidgetItem(date_str))
            
            # 来源
            self.papers_table.setItem(row, 3, QTableWidgetItem(paper.source))
            
            # DOI
            self.papers_table.setItem(row, 4, QTableWidgetItem(paper.doi))
            
            # 引用数
            self.papers_table.setItem(row, 5, QTableWidgetItem(str(paper.citations)))
            
            # 本地路径
            self.papers_table.setItem(row, 6, QTableWidgetItem(paper.local_path or ''))
    
    def show_statistics(self):
        """显示统计信息"""
        session = self.db_manager.Session()
        try:
            # 获取总论文数
            total_papers = session.query(Paper).count()
            
            # 按来源统计
            source_stats = session.query(
                Paper.source, 
                func.count(Paper.id)
            ).group_by(Paper.source).all()
            
            # 按年份统计
            year_stats = session.query(
                func.strftime('%Y', Paper.published_date).label('year'),
                func.count(Paper.id)
            ).group_by('year').order_by('year').all()
            
            # 生成统计报告
            stats_text = f"文献统计报告\n{'='*50}\n\n"
            stats_text += f"总论文数：{total_papers}\n\n"
            
            stats_text += "按数据源统计：\n"
            for source, count in source_stats:
                stats_text += f"{source or '未知'}: {count}篇\n"
            
            stats_text += "\n按年份统计：\n"
            for year, count in year_stats:
                if year:
                    stats_text += f"{year}年: {count}篇\n"
            
            self.stats_browser.setText(stats_text)
            self.tab_widget.setCurrentIndex(1)  # 切换到统计信息标签页
            
        finally:
            session.close()

def main():
    app = QApplication(sys.argv)
    viewer = SourceViewer()
    viewer.show()
    sys.exit(app.exec())

if __name__ == '__main__':
    main() 