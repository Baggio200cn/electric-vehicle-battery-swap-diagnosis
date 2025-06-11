from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from models import init_db, Paper, Category, Tag, Note
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any

class DatabaseManager:
    """数据库管理器"""
    
    def __init__(self, db_path='sqlite:///papers.db'):
        """初始化数据库管理器"""
        self.engine = init_db(db_path)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()
        
        # 确保基础分类存在
        self._ensure_base_categories()
    
    def _ensure_base_categories(self):
        """确保基础分类存在"""
        base_categories = [
            ("计算机视觉", "计算机视觉相关研究论文"),
            ("深度学习", "深度学习相关研究论文"),
            ("工业视觉", "工业视觉应用相关论文"),
            ("医学图像", "医学图像分析相关论文"),
            ("其他", "未分类论文")
        ]
        
        for name, desc in base_categories:
            if not self.session.query(Category).filter_by(name=name).first():
                category = Category(name=name, description=desc)
                self.session.add(category)
        
        try:
            self.session.commit()
        except SQLAlchemyError as e:
            self.session.rollback()
            logging.error(f"创建基础分类失败: {str(e)}")
    
    def add_paper(self, paper_data: Dict[str, Any]) -> Optional[Paper]:
        """添加新论文"""
        try:
            # 检查论文是否已存在
            existing_paper = self.session.query(Paper).filter_by(
                title=paper_data['title']
            ).first()
            
            if existing_paper:
                return existing_paper
            
            # 创建新论文
            paper = Paper(
                title=paper_data['title'],
                authors=paper_data.get('authors', ''),
                abstract=paper_data.get('abstract', ''),
                url=paper_data.get('url', ''),
                pdf_path=paper_data.get('pdf_path', ''),
                source=paper_data.get('source', ''),
                published_date=paper_data.get('published_date'),
                category_id=paper_data.get('category_id')
            )
            
            # 处理标签
            if 'tags' in paper_data:
                for tag_name in paper_data['tags']:
                    tag = self.get_or_create_tag(tag_name)
                    paper.tags.append(tag)
            
            self.session.add(paper)
            self.session.commit()
            return paper
            
        except SQLAlchemyError as e:
            self.session.rollback()
            logging.error(f"添加论文失败: {str(e)}")
            return None
    
    def get_or_create_tag(self, tag_name: str) -> Tag:
        """获取或创建标签"""
        tag = self.session.query(Tag).filter_by(name=tag_name).first()
        if not tag:
            tag = Tag(name=tag_name)
            self.session.add(tag)
            try:
                self.session.commit()
            except SQLAlchemyError:
                self.session.rollback()
                raise
        return tag
    
    def add_note(self, paper_id: int, content: str) -> Optional[Note]:
        """添加笔记"""
        try:
            note = Note(
                paper_id=paper_id,
                content=content
            )
            self.session.add(note)
            self.session.commit()
            return note
        except SQLAlchemyError as e:
            self.session.rollback()
            logging.error(f"添加笔记失败: {str(e)}")
            return None
    
    def get_paper_by_id(self, paper_id: int) -> Optional[Paper]:
        """通过ID获取论文"""
        return self.session.query(Paper).get(paper_id)
    
    def get_papers_by_category(self, category_id: int) -> List[Paper]:
        """获取分类下的所有论文"""
        return self.session.query(Paper).filter_by(category_id=category_id).all()
    
    def get_papers_by_tag(self, tag_name: str) -> List[Paper]:
        """获取带有特定标签的论文"""
        tag = self.session.query(Tag).filter_by(name=tag_name).first()
        return tag.papers if tag else []
    
    def search_papers(self, keyword: str) -> List[Paper]:
        """搜索论文"""
        return self.session.query(Paper).filter(
            (Paper.title.ilike(f"%{keyword}%")) |
            (Paper.abstract.ilike(f"%{keyword}%")) |
            (Paper.authors.ilike(f"%{keyword}%"))
        ).all()
    
    def get_all_categories(self) -> List[Category]:
        """获取所有分类"""
        return self.session.query(Category).all()
    
    def get_all_tags(self) -> List[Tag]:
        """获取所有标签"""
        return self.session.query(Tag).all()
    
    def get_paper_notes(self, paper_id: int) -> List[Note]:
        """获取论文的所有笔记"""
        return self.session.query(Note).filter_by(paper_id=paper_id).all()
    
    def update_paper(self, paper_id: int, paper_data: Dict[str, Any]) -> bool:
        """更新论文信息"""
        try:
            paper = self.get_paper_by_id(paper_id)
            if not paper:
                return False
            
            for key, value in paper_data.items():
                if hasattr(paper, key):
                    setattr(paper, key, value)
            
            self.session.commit()
            return True
        except SQLAlchemyError as e:
            self.session.rollback()
            logging.error(f"更新论文失败: {str(e)}")
            return False
    
    def delete_paper(self, paper_id: int) -> bool:
        """删除论文"""
        try:
            paper = self.get_paper_by_id(paper_id)
            if paper:
                self.session.delete(paper)
                self.session.commit()
                return True
            return False
        except SQLAlchemyError as e:
            self.session.rollback()
            logging.error(f"删除论文失败: {str(e)}")
            return False
    
    def close(self):
        """关闭数据库连接"""
        self.session.close() 