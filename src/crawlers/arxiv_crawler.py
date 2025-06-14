import arxiv
from datetime import datetime
from typing import List, Optional
import aiohttp
import os
from .base_crawler import BaseCrawler, Paper

class ArxivCrawler(BaseCrawler):
    """arXiv爬虫实现"""
    
    def __init__(self, config):
        super().__init__(config)
        self.client = arxiv.Client()
        self.categories = self.config["sources"]["arxiv"]["categories"]
        self.max_results = self.config["sources"]["arxiv"]["max_results_per_query"]
    
    async def search(self, keyword: str, from_date: datetime, to_date: datetime) -> List[Paper]:
        """搜索arXiv论文"""
        papers = []
        
        # 构建查询
        query = f"{keyword} AND cat:({' OR '.join(self.categories)})"
        
        # 使用arxiv API搜索
        search = arxiv.Search(
            query=query,
            max_results=self.max_results,
            sort_by=arxiv.SortCriterion.SubmittedDate
        )
        
        async for result in self.client.results(search):
            # 检查日期范围
            if from_date <= result.published <= to_date:
                paper = Paper(
                    title=result.title,
                    authors=[author.name for author in result.authors],
                    abstract=result.summary,
                    url=result.entry_id,
                    pdf_url=result.pdf_url,
                    published_date=result.published,
                    source="arxiv",
                    keywords=[cat.value for cat in result.categories],
                    category=result.primary_category,
                    language="en"
                )
                papers.append(paper)
        
        return papers
    
    async def download_paper(self, paper: Paper, save_path: str) -> bool:
        """下载arXiv论文PDF"""
        try:
            if not paper.pdf_url:
                return False
            
            # 创建保存目录
            os.makedirs(save_path, exist_ok=True)
            
            # 构建文件名
            filename = f"{paper.title[:100].replace('/', '_')}.pdf"
            filepath = os.path.join(save_path, filename)
            
            # 下载PDF
            async with aiohttp.ClientSession() as session:
                async with session.get(paper.pdf_url, headers=self.headers) as response:
                    if response.status == 200:
                        with open(filepath, 'wb') as f:
                            while True:
                                chunk = await response.content.read(8192)
                                if not chunk:
                                    break
                                f.write(chunk)
                        return True
            return False
        except Exception as e:
            print(f"Error downloading paper {paper.title}: {str(e)}")
            return False
    
    async def get_paper_details(self, paper: Paper) -> Paper:
        """获取论文详细信息"""
        # arXiv API已经提供了所有需要的信息
        return paper 