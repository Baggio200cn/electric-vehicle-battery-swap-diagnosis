from typing import List, Dict
from datetime import datetime
import os
from pathlib import Path
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import nltk
from loguru import logger
from ..crawlers.base_crawler import Paper

class PaperProcessor:
    """论文处理器"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.categories = config["classification"]["categories"]
        
        # 下载必要的NLTK数据
        try:
            nltk.data.find('tokenizers/punkt')
            nltk.data.find('corpora/stopwords')
        except LookupError:
            nltk.download('punkt')
            nltk.download('stopwords')
        
        self.stop_words = set(stopwords.words('english') + stopwords.words('chinese'))
        self.vectorizer = TfidfVectorizer(stop_words=list(self.stop_words))
        self.classifier = MultinomialNB()
    
    def classify_paper(self, paper: Paper) -> str:
        """对论文进行分类"""
        # 使用标题、摘要和关键词进行分类
        text = f"{paper.title} {paper.abstract} {' '.join(paper.keywords)}"
        
        # 根据关键词规则进行分类
        for category, keywords in self.config["search"]["keywords"].items():
            for keyword in keywords:
                if keyword.lower() in text.lower():
                    return self._map_category(category)
        
        return "其他"
    
    def _map_category(self, category: str) -> str:
        """将搜索类别映射到存储类别"""
        category_map = {
            "computer_vision": "计算机视觉基础",
            "industrial_vision": "工业视觉检测",
            "medical_imaging": "医学图像分析"
        }
        return category_map.get(category, "其他")
    
    def generate_daily_report(self, papers: List[Paper], output_dir: str) -> str:
        """生成每日文献报告"""
        try:
            # 创建输出目录
            os.makedirs(output_dir, exist_ok=True)
            
            # 按类别整理论文
            papers_by_category = {}
            for paper in papers:
                category = paper.category or self.classify_paper(paper)
                if category not in papers_by_category:
                    papers_by_category[category] = []
                papers_by_category[category].append(paper)
            
            # 生成报告
            today = datetime.now().strftime("%Y-%m-%d")
            report_path = Path(output_dir) / f"daily_report_{today}.md"
            
            with open(report_path, "w", encoding="utf-8") as f:
                f.write(f"# 机器视觉文献日报 ({today})\n\n")
                
                # 总览
                total_papers = len(papers)
                f.write(f"## 总览\n\n")
                f.write(f"- 今日获取文献总数：{total_papers}篇\n")
                f.write(f"- 覆盖分类数：{len(papers_by_category)}个\n\n")
                
                # 按类别详细列表
                for category, category_papers in papers_by_category.items():
                    f.write(f"## {category} ({len(category_papers)}篇)\n\n")
                    
                    for paper in category_papers:
                        f.write(f"### {paper.title}\n\n")
                        f.write(f"- 作者：{', '.join(paper.authors)}\n")
                        f.write(f"- 发布日期：{paper.published_date.strftime('%Y-%m-%d')}\n")
                        f.write(f"- 来源：{paper.source}\n")
                        if paper.doi:
                            f.write(f"- DOI：{paper.doi}\n")
                        f.write(f"- 链接：{paper.url}\n")
                        f.write("\n**摘要：**\n\n")
                        f.write(f"{paper.abstract}\n\n")
                        f.write("---\n\n")
            
            logger.info(f"Daily report generated: {report_path}")
            return str(report_path)
            
        except Exception as e:
            logger.error(f"Error generating daily report: {str(e)}")
            return ""
    
    def analyze_trends(self, papers: List[Paper]) -> Dict:
        """分析研究趋势"""
        try:
            # 提取所有文本
            texts = [f"{p.title} {p.abstract}" for p in papers]
            
            # 计算TF-IDF
            tfidf_matrix = self.vectorizer.fit_transform(texts)
            
            # 获取最重要的关键词
            feature_names = self.vectorizer.get_feature_names_out()
            tfidf_sums = tfidf_matrix.sum(axis=0).A1
            top_indices = tfidf_sums.argsort()[-10:][::-1]
            top_keywords = [feature_names[i] for i in top_indices]
            
            # 按时间统计论文数量
            dates = pd.Series([p.published_date for p in papers])
            daily_counts = dates.value_counts().sort_index()
            
            # 按类别统计
            categories = [p.category or self.classify_paper(p) for p in papers]
            category_counts = pd.Series(categories).value_counts()
            
            return {
                "top_keywords": top_keywords,
                "daily_counts": daily_counts.to_dict(),
                "category_counts": category_counts.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing trends: {str(e)}")
            return {} 