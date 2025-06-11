from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

# 文献-标签关联表
paper_tags = Table('paper_tags', Base.metadata,
    Column('paper_id', Integer, ForeignKey('papers.id')),
    Column('tag_id', Integer, ForeignKey('tags.id'))
)

class Paper(Base):
    """文献模型"""
    __tablename__ = 'papers'

    id = Column(Integer, primary_key=True)
    title = Column(String(500), nullable=False)
    authors = Column(String(500))
    abstract = Column(Text)
    url = Column(String(500))
    pdf_path = Column(String(500))
    source = Column(String(100))
    published_date = Column(DateTime)
    downloaded_date = Column(DateTime, default=datetime.datetime.utcnow)
    category_id = Column(Integer, ForeignKey('categories.id'))
    
    # 关系
    category = relationship("Category", back_populates="papers")
    tags = relationship("Tag", secondary=paper_tags, back_populates="papers")
    notes = relationship("Note", back_populates="paper")

class Category(Base):
    """分类模型"""
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text)
    
    # 关系
    papers = relationship("Paper", back_populates="category")

class Tag(Base):
    """标签模型"""
    __tablename__ = 'tags'

    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False, unique=True)
    
    # 关系
    papers = relationship("Paper", secondary=paper_tags, back_populates="tags")

class Note(Base):
    """笔记模型"""
    __tablename__ = 'notes'

    id = Column(Integer, primary_key=True)
    paper_id = Column(Integer, ForeignKey('papers.id'))
    content = Column(Text, nullable=False)
    created_date = Column(DateTime, default=datetime.datetime.utcnow)
    updated_date = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # 关系
    paper = relationship("Paper", back_populates="notes")

def init_db(db_path='sqlite:///papers.db'):
    """初始化数据库"""
    engine = create_engine(db_path)
    Base.metadata.create_all(engine)
    return engine 