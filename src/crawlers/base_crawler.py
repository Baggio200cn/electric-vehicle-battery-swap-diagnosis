from abc import ABC, abstractmethod
from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class Paper:
    """论文数据模型"""
    title: str
    authors: List[str]
    abstract: str
    url: str
    pdf_url: Optional[str]
    published_date: datetime
    source: str
    keywords: List[str]
    category: Optional[str] = None
    doi: Optional[str] = None
    citations: Optional[int] = None
    language: str = "en"

class BaseCrawler(ABC):
    """爬虫基类"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
    
    @abstractmethod
    async def search(self, keyword: str, from_date: datetime, to_date: datetime) -> List[Paper]:
        """搜索论文"""
        pass
    
    @abstractmethod
    async def download_paper(self, paper: Paper, save_path: str) -> bool:
        """下载论文PDF"""
        pass
    
    @abstractmethod
    async def get_paper_details(self, paper: Paper) -> Paper:
        """获取论文详细信息"""
        pass
    
    def _validate_paper(self, paper: Paper) -> bool:
        """验证论文数据完整性"""
        required_fields = ["title", "authors", "abstract", "url"]
        return all(hasattr(paper, field) and getattr(paper, field) for field in required_fields)
    
    async def process_paper(self, paper: Paper, save_path: str) -> Optional[Paper]:
        """处理单篇论文"""
        try:
            if not self._validate_paper(paper):
                return None
            
            # 获取详细信息
            paper = await self.get_paper_details(paper)
            
            # 下载PDF
            if paper.pdf_url:
                success = await self.download_paper(paper, save_path)
                if not success:
                    print(f"Failed to download PDF for paper: {paper.title}")
            
            return paper
        except Exception as e:
            print(f"Error processing paper {paper.title}: {str(e)}")
            return None 