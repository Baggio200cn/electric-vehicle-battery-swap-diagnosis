import sys
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                           QHBoxLayout, QLabel, QLineEdit, QComboBox, 
                           QPushButton, QTableWidget, QTableWidgetItem)
from PyQt6.QtCore import Qt
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.models.database import DatabaseManager, Paper, Author, Keyword

class DatabaseViewer(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("论文数据库查询工具")
        self.setGeometry(100, 100, 1200, 800)
        
        # 初始化数据库管理器
        self.db_manager = DatabaseManager('sqlite:///papers.db')
        
        # 创建主窗口部件
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        layout = QVBoxLayout(main_widget)
        
        # 创建搜索区域
        search_layout = QHBoxLayout()
        
        # 搜索类型选择
        self.search_type = QComboBox()
        self.search_type.addItems(['标题', '作者', '关键词', '类别'])
        search_layout.addWidget(QLabel("搜索类型:"))
        search_layout.addWidget(self.search_type)
        
        # 搜索输入框
        self.search_input = QLineEdit()
        search_layout.addWidget(QLabel("搜索内容:"))
        search_layout.addWidget(self.search_input)
        
        # 搜索按钮
        search_button = QPushButton("搜索")
        search_button.clicked.connect(self.perform_search)
        search_layout.addWidget(search_button)
        
        layout.addLayout(search_layout)
        
        # 创建结果表格
        self.table = QTableWidget()
        self.table.setColumnCount(8)
        self.table.setHorizontalHeaderLabels([
            "标题", "作者", "摘要", "发布日期", "来源", "类别", "DOI", "引用数"
        ])
        layout.addWidget(self.table)
        
        # 设置表格列宽
        self.table.setColumnWidth(0, 300)  # 标题
        self.table.setColumnWidth(1, 150)  # 作者
        self.table.setColumnWidth(2, 300)  # 摘要
        self.table.setColumnWidth(3, 100)  # 发布日期
        self.table.setColumnWidth(4, 80)   # 来源
        self.table.setColumnWidth(5, 100)  # 类别
        self.table.setColumnWidth(6, 100)  # DOI
        self.table.setColumnWidth(7, 70)   # 引用数
        
        # 加载初始数据
        self.load_all_papers()
    
    def load_all_papers(self):
        """加载所有论文"""
        session = self.db_manager.Session()
        try:
            papers = session.query(Paper).all()
            self.display_papers(papers)
        finally:
            session.close()
    
    def perform_search(self):
        """执行搜索"""
        search_type = self.search_type.currentText()
        search_text = self.search_input.text().strip()
        
        session = self.db_manager.Session()
        try:
            if search_type == '标题':
                papers = session.query(Paper).filter(
                    Paper.title.ilike(f'%{search_text}%')
                ).all()
            elif search_type == '作者':
                papers = session.query(Paper).join(
                    Paper.authors
                ).filter(
                    Author.name.ilike(f'%{search_text}%')
                ).all()
            elif search_type == '关键词':
                papers = session.query(Paper).join(
                    Paper.keywords
                ).filter(
                    Keyword.word.ilike(f'%{search_text}%')
                ).all()
            elif search_type == '类别':
                papers = session.query(Paper).filter(
                    Paper.category.ilike(f'%{search_text}%')
                ).all()
            
            self.display_papers(papers)
        finally:
            session.close()
    
    def display_papers(self, papers):
        """在表格中显示论文"""
        self.table.setRowCount(len(papers))
        
        for row, paper in enumerate(papers):
            # 标题
            self.table.setItem(row, 0, QTableWidgetItem(paper.title))
            
            # 作者
            authors = [author.name for author in paper.authors]
            self.table.setItem(row, 1, QTableWidgetItem(', '.join(authors)))
            
            # 摘要
            self.table.setItem(row, 2, QTableWidgetItem(paper.abstract))
            
            # 发布日期
            date_str = paper.published_date.strftime('%Y-%m-%d') if paper.published_date else ''
            self.table.setItem(row, 3, QTableWidgetItem(date_str))
            
            # 来源
            self.table.setItem(row, 4, QTableWidgetItem(paper.source))
            
            # 类别
            self.table.setItem(row, 5, QTableWidgetItem(paper.category))
            
            # DOI
            self.table.setItem(row, 6, QTableWidgetItem(paper.doi))
            
            # 引用数
            self.table.setItem(row, 7, QTableWidgetItem(str(paper.citations)))

def main():
    app = QApplication(sys.argv)
    viewer = DatabaseViewer()
    viewer.show()
    sys.exit(app.exec())

if __name__ == '__main__':
    main() 