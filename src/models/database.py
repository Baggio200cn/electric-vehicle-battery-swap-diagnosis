from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime
from typing import List
import json

Base = declarative_base()

# 论文-作者关联表
paper_authors = Table(
    'paper_authors', Base.metadata,
    Column('paper_id', Integer, ForeignKey('papers.id')),
    Column('author_id', Integer, ForeignKey('authors.id'))
)

# 论文-关键词关联表
paper_keywords = Table(
    'paper_keywords', Base.metadata,
    Column('paper_id', Integer, ForeignKey('papers.id')),
    Column('keyword_id', Integer, ForeignKey('keywords.id'))
)

class Paper(Base):
    """论文表"""
    __tablename__ = 'papers'
    
    id = Column(Integer, primary_key=True)
    title = Column(String(500), nullable=False)
    abstract = Column(String(5000))
    url = Column(String(500))
    pdf_url = Column(String(500))
    published_date = Column(DateTime)
    source = Column(String(50))
    category = Column(String(100))
    doi = Column(String(100))
    citations = Column(Integer, default=0)
    language = Column(String(10))
    local_path = Column(String(500))
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # 关系
    authors = relationship('Author', secondary=paper_authors, back_populates='papers')
    keywords = relationship('Keyword', secondary=paper_keywords, back_populates='papers')
    references = relationship('Reference', back_populates='paper')
    citations_data = relationship('Citation', back_populates='paper')
    metrics = relationship('PaperMetrics', back_populates='paper', uselist=False)

class Author(Base):
    """作者表"""
    __tablename__ = 'authors'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    affiliation = Column(String(200))
    email = Column(String(100))
    papers = relationship('Paper', secondary=paper_authors, back_populates='authors')

class Keyword(Base):
    """关键词表"""
    __tablename__ = 'keywords'
    
    id = Column(Integer, primary_key=True)
    word = Column(String(100), nullable=False, unique=True)
    papers = relationship('Paper', secondary=paper_keywords, back_populates='keywords')

class Reference(Base):
    """引用关系表"""
    __tablename__ = 'references'
    
    id = Column(Integer, primary_key=True)
    paper_id = Column(Integer, ForeignKey('papers.id'))
    reference_title = Column(String(500))
    reference_doi = Column(String(100))
    paper = relationship('Paper', back_populates='references')

class Citation(Base):
    """被引用表"""
    __tablename__ = 'citations'
    
    id = Column(Integer, primary_key=True)
    paper_id = Column(Integer, ForeignKey('papers.id'))
    citing_paper_title = Column(String(500))
    citing_paper_doi = Column(String(100))
    citation_date = Column(DateTime)
    paper = relationship('Paper', back_populates='citations_data')

class PaperMetrics(Base):
    """论文指标表"""
    __tablename__ = 'paper_metrics'
    
    id = Column(Integer, primary_key=True)
    paper_id = Column(Integer, ForeignKey('papers.id'))
    citation_count = Column(Integer, default=0)
    download_count = Column(Integer, default=0)
    read_count = Column(Integer, default=0)
    impact_factor = Column(Float)
    h_index = Column(Integer)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    paper = relationship('Paper', back_populates='metrics')

class DatabaseManager:
    """数据库管理器"""
    
    def __init__(self, connection_string: str):
        self.engine = create_engine(connection_string)
        Base.metadata.create_all(self.engine)
        self.Session = sessionmaker(bind=self.engine)
    
    def add_paper(self, paper_data: dict) -> Paper:
        """添加论文"""
        session = self.Session()
        try:
            # 创建或获取作者
            authors = []
            for author_name in paper_data.get('authors', []):
                author = session.query(Author).filter_by(name=author_name).first()
                if not author:
                    author = Author(name=author_name)
                authors.append(author)
            
            # 创建或获取关键词
            keywords = []
            for word in paper_data.get('keywords', []):
                keyword = session.query(Keyword).filter_by(word=word).first()
                if not keyword:
                    keyword = Keyword(word=word)
                keywords.append(keyword)
            
            # 创建论文
            paper = Paper(
                title=paper_data['title'],
                abstract=paper_data.get('abstract'),
                url=paper_data.get('url'),
                pdf_url=paper_data.get('pdf_url'),
                published_date=paper_data.get('published_date'),
                source=paper_data.get('source'),
                category=paper_data.get('category'),
                doi=paper_data.get('doi'),
                citations=paper_data.get('citations', 0),
                language=paper_data.get('language', 'en'),
                local_path=paper_data.get('local_path')
            )
            
            paper.authors = authors
            paper.keywords = keywords
            
            session.add(paper)
            session.commit()
            return paper
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    def get_paper_by_title(self, title: str) -> Paper:
        """通过标题获取论文"""
        session = self.Session()
        try:
            return session.query(Paper).filter_by(title=title).first()
        finally:
            session.close()
    
    def get_papers_by_category(self, category: str) -> List[Paper]:
        """获取特定类别的论文"""
        session = self.Session()
        try:
            return session.query(Paper).filter_by(category=category).all()
        finally:
            session.close()
    
    def update_paper_metrics(self, paper_id: int, metrics: dict):
        """更新论文指标"""
        session = self.Session()
        try:
            paper = session.query(Paper).get(paper_id)
            if not paper:
                return
            
            if not paper.metrics:
                paper.metrics = PaperMetrics()
            
            for key, value in metrics.items():
                if hasattr(paper.metrics, key):
                    setattr(paper.metrics, key, value)
            
            session.commit()
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close() 