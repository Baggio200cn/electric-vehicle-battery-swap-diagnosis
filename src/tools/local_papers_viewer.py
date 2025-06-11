import sys
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                           QHBoxLayout, QLabel, QLineEdit, QPushButton, 
                           QTableWidget, QTableWidgetItem, QHeaderView,
                           QFileDialog, QMessageBox)
from PyQt6.QtCore import Qt
import os
from datetime import datetime
from pathlib import Path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.models.database import DatabaseManager, Paper, Author, Keyword

class LocalPapersViewer(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("本地论文管理器")
        self.setGeometry(100, 100, 1400, 800)
        
        # 初始化数据库管理器
        db_path = os.path.join(os.getcwd(), 'papers.db')
        if not os.path.exists(db_path):
            QMessageBox.warning(self, "错误", f"数据库文件不存在: {db_path}")
            print(f"数据库文件不存在: {db_path}")
            print(f"当前工作目录: {os.getcwd()}")
            print(f"可用文件列表:")
            for file in os.listdir(os.getcwd()):
                print(f"- {file}")
        
        self.db_manager = DatabaseManager(f'sqlite:///{db_path}')
        
        # 创建主窗口部件
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        layout = QVBoxLayout(main_widget)
        
        # 创建搜索区域
        search_layout = QHBoxLayout()
        
        # 搜索输入框
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("输入标题或作者名搜索...")
        search_layout.addWidget(QLabel("搜索:"))
        search_layout.addWidget(self.search_input)
        
        # 搜索按钮
        search_button = QPushButton("搜索")
        search_button.clicked.connect(self.perform_search)
        search_layout.addWidget(search_button)
        
        # 刷新按钮
        refresh_button = QPushButton("刷新")
        refresh_button.clicked.connect(self.load_papers)
        search_layout.addWidget(refresh_button)
        
        # 打开文件夹按钮
        open_folder_button = QPushButton("打开下载目录")
        open_folder_button.clicked.connect(self.open_download_folder)
        search_layout.addWidget(open_folder_button)
        
        # 统计信息标签
        self.stats_label = QLabel()
        search_layout.addWidget(self.stats_label)
        
        layout.addLayout(search_layout)
        
        # 创建表格
        self.table = QTableWidget()
        self.table.setColumnCount(9)
        self.table.setHorizontalHeaderLabels([
            "标题", "作者", "发布日期", "来源", "类别", "DOI", 
            "引用数", "本地路径", "操作"
        ])
        
        # 设置表格列宽
        self.table.setColumnWidth(0, 300)  # 标题
        self.table.setColumnWidth(1, 200)  # 作者
        self.table.setColumnWidth(2, 100)  # 发布日期
        self.table.setColumnWidth(3, 80)   # 来源
        self.table.setColumnWidth(4, 100)  # 类别
        self.table.setColumnWidth(5, 150)  # DOI
        self.table.setColumnWidth(6, 70)   # 引用数
        self.table.setColumnWidth(7, 250)  # 本地路径
        self.table.setColumnWidth(8, 100)  # 操作
        
        # 允许表格自动调整最后一列宽度
        header = self.table.horizontalHeader()
        header.setSectionResizeMode(7, QHeaderView.ResizeMode.Stretch)
        
        layout.addWidget(self.table)
        
        # 加载论文数据
        self.load_papers()
    
    def load_papers(self):
        """加载所有论文"""
        session = self.db_manager.Session()
        try:
            papers = session.query(Paper).all()
            print(f"找到 {len(papers)} 篇论文")
            
            self.display_papers(papers)
            
            # 更新统计信息
            total_papers = len(papers)
            total_size = sum(os.path.getsize(p.local_path) for p in papers if p.local_path and os.path.exists(p.local_path))
            self.stats_label.setText(f"共 {total_papers} 篇论文 | 已下载: {self.format_size(total_size)}")
            
        except Exception as e:
            print(f"加载论文时出错: {str(e)}")
            QMessageBox.warning(self, "错误", f"加载论文时出错: {str(e)}")
        finally:
            session.close()
    
    def perform_search(self):
        """执行搜索"""
        search_text = self.search_input.text().strip()
        if not search_text:
            self.load_papers()
            return
        
        session = self.db_manager.Session()
        try:
            # 搜索标题或作者
            papers = session.query(Paper).filter(
                (Paper.title.ilike(f'%{search_text}%')) |
                Paper.authors.any(Author.name.ilike(f'%{search_text}%'))
            ).all()
            
            self.display_papers(papers)
            
        except Exception as e:
            print(f"搜索论文时出错: {str(e)}")
            QMessageBox.warning(self, "错误", f"搜索论文时出错: {str(e)}")
        finally:
            session.close()
    
    def display_papers(self, papers):
        """在表格中显示论文"""
        self.table.setRowCount(len(papers))
        
        for row, paper in enumerate(papers):
            try:
                # 标题
                self.table.setItem(row, 0, QTableWidgetItem(paper.title))
                
                # 作者
                authors = [author.name for author in paper.authors]
                self.table.setItem(row, 1, QTableWidgetItem(', '.join(authors)))
                
                # 发布日期
                date_str = paper.published_date.strftime('%Y-%m-%d') if paper.published_date else ''
                self.table.setItem(row, 2, QTableWidgetItem(date_str))
                
                # 来源
                self.table.setItem(row, 3, QTableWidgetItem(paper.source))
                
                # 类别
                self.table.setItem(row, 4, QTableWidgetItem(paper.category))
                
                # DOI
                self.table.setItem(row, 5, QTableWidgetItem(paper.doi))
                
                # 引用数
                self.table.setItem(row, 6, QTableWidgetItem(str(paper.citations)))
                
                # 本地路径
                path_item = QTableWidgetItem(paper.local_path or '未下载')
                if paper.local_path and os.path.exists(paper.local_path):
                    path_item.setForeground(Qt.GlobalColor.darkGreen)
                else:
                    path_item.setForeground(Qt.GlobalColor.red)
                path_item.setToolTip(paper.local_path or '未下载')
                self.table.setItem(row, 7, path_item)
                
                # 操作按钮
                if paper.local_path and os.path.exists(paper.local_path):
                    open_button = QPushButton("打开")
                    open_button.clicked.connect(lambda checked, p=paper.local_path: self.open_paper(p))
                else:
                    open_button = QPushButton("下载")
                    open_button.clicked.connect(lambda checked, p=paper: self.download_paper(p))
                self.table.setCellWidget(row, 8, open_button)
                
            except Exception as e:
                print(f"显示论文 '{paper.title}' 时出错: {str(e)}")
    
    def download_paper(self, paper):
        """下载论文"""
        if not paper.pdf_url:
            QMessageBox.warning(self, "错误", "没有可用的PDF下载链接")
            return
            
        download_path = os.path.join(os.getcwd(), "downloads")
        os.makedirs(download_path, exist_ok=True)
        
        file_name = f"{paper.title[:50]}.pdf".replace('/', '_')
        save_path = os.path.join(download_path, file_name)
        
        QMessageBox.information(self, "下载", f"开始下载论文: {paper.title}\n保存到: {save_path}")
        # TODO: 实现异步下载功能
    
    def open_paper(self, path):
        """打开PDF文件"""
        if path and os.path.exists(path):
            os.startfile(path)
        else:
            QMessageBox.warning(self, "错误", f"文件不存在: {path}")
    
    def open_download_folder(self):
        """打开下载目录"""
        download_path = os.path.join(os.getcwd(), "downloads")
        if os.path.exists(download_path):
            os.startfile(download_path)
        else:
            QMessageBox.warning(self, "错误", f"下载目录不存在: {download_path}")
    
    @staticmethod
    def format_size(size):
        """格式化文件大小"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024:
                return f"{size:.2f} {unit}"
            size /= 1024
        return f"{size:.2f} TB"

def main():
    app = QApplication(sys.argv)
    viewer = LocalPapersViewer()
    viewer.show()
    sys.exit(app.exec())

if __name__ == '__main__':
    main()