from typing import List, Dict, Tuple
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import LatentDirichletAllocation, NMF
from sklearn.cluster import KMeans
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import networkx as nx
from collections import Counter
import matplotlib.pyplot as plt
from wordcloud import WordCloud
import seaborn as sns
from datetime import datetime
import nltk
from ..models.database import Paper, DatabaseManager
import os

class PaperAnalyzer:
    """增强的论文分析器"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager
        self.lemmatizer = WordNetLemmatizer()
        
        # 下载必要的NLTK数据
        try:
            nltk.data.find('tokenizers/punkt')
            nltk.data.find('corpora/stopwords')
            nltk.data.find('wordnet')
        except LookupError:
            nltk.download('punkt')
            nltk.download('stopwords')
            nltk.download('wordnet')
        
        self.stop_words = set(stopwords.words('english') + stopwords.words('chinese'))
    
    def preprocess_text(self, text: str) -> str:
        """文本预处理"""
        # 分词
        tokens = word_tokenize(text.lower())
        # 词形还原
        tokens = [self.lemmatizer.lemmatize(token) for token in tokens]
        # 去除停用词和标点
        tokens = [token for token in tokens if token not in self.stop_words and token.isalnum()]
        return ' '.join(tokens)
    
    def topic_modeling(self, papers: List[Paper], num_topics: int = 5) -> Dict:
        """主题建模分析"""
        # 准备文档
        documents = [f"{p.title} {p.abstract}" for p in papers]
        processed_docs = [self.preprocess_text(doc) for doc in documents]
        
        # TF-IDF向量化
        vectorizer = TfidfVectorizer(max_features=1000)
        tfidf_matrix = vectorizer.fit_transform(processed_docs)
        
        # LDA主题模型
        lda = LatentDirichletAllocation(n_components=num_topics, random_state=42)
        lda_output = lda.fit_transform(tfidf_matrix)
        
        # 获取主题词
        feature_names = vectorizer.get_feature_names_out()
        topics = {}
        for topic_idx, topic in enumerate(lda.components_):
            top_words = [feature_names[i] for i in topic.argsort()[:-10-1:-1]]
            topics[f"Topic {topic_idx + 1}"] = top_words
        
        return {
            "topics": topics,
            "document_topics": lda_output.tolist()
        }
    
    def citation_network_analysis(self, papers: List[Paper]) -> Dict:
        """引文网络分析"""
        G = nx.DiGraph()
        
        # 构建引文网络
        for paper in papers:
            G.add_node(paper.title, year=paper.published_date.year)
            for ref in paper.references:
                if ref.reference_title:
                    G.add_edge(paper.title, ref.reference_title)
        
        # 计算网络指标
        metrics = {
            "degree_centrality": nx.degree_centrality(G),
            "betweenness_centrality": nx.betweenness_centrality(G),
            "pagerank": nx.pagerank(G)
        }
        
        # 识别关键论文
        key_papers = sorted(
            metrics["pagerank"].items(),
            key=lambda x: x[1],
            reverse=True
        )[:10]
        
        return {
            "metrics": metrics,
            "key_papers": key_papers,
            "network_density": nx.density(G),
            "average_clustering": nx.average_clustering(G)
        }
    
    def author_collaboration_analysis(self, papers: List[Paper]) -> Dict:
        """作者合作网络分析"""
        G = nx.Graph()
        
        # 构建合作网络
        for paper in papers:
            authors = [author.name for author in paper.authors]
            for i in range(len(authors)):
                for j in range(i + 1, len(authors)):
                    if G.has_edge(authors[i], authors[j]):
                        G[authors[i]][authors[j]]['weight'] += 1
                    else:
                        G.add_edge(authors[i], authors[j], weight=1)
        
        # 计算合作指标
        metrics = {
            "degree_centrality": nx.degree_centrality(G),
            "clustering_coefficient": nx.clustering(G),
            "eigenvector_centrality": nx.eigenvector_centrality_numpy(G)
        }
        
        # 识别核心作者
        core_authors = sorted(
            metrics["eigenvector_centrality"].items(),
            key=lambda x: x[1],
            reverse=True
        )[:10]
        
        return {
            "metrics": metrics,
            "core_authors": core_authors,
            "network_density": nx.density(G),
            "average_clustering": nx.average_clustering(G)
        }
    
    def temporal_analysis(self, papers: List[Paper]) -> Dict:
        """时间序列分析"""
        # 准备时间序列数据
        dates = pd.Series([p.published_date for p in papers])
        daily_counts = dates.value_counts().sort_index()
        monthly_counts = dates.dt.to_period('M').value_counts().sort_index()
        
        # 计算趋势
        monthly_moving_avg = monthly_counts.rolling(window=3).mean()
        
        return {
            "daily_counts": daily_counts.to_dict(),
            "monthly_counts": monthly_counts.to_dict(),
            "trend": monthly_moving_avg.to_dict()
        }
    
    def generate_visualizations(self, papers: List[Paper], output_dir: str):
        """生成可视化图表"""
        # 创建输出目录
        os.makedirs(output_dir, exist_ok=True)
        
        # 1. 词云图
        text = ' '.join([f"{p.title} {p.abstract}" for p in papers])
        wordcloud = WordCloud(
            width=1200, height=800,
            background_color='white',
            stopwords=self.stop_words
        ).generate(text)
        
        plt.figure(figsize=(15, 10))
        plt.imshow(wordcloud, interpolation='bilinear')
        plt.axis('off')
        plt.savefig(f"{output_dir}/wordcloud.png")
        plt.close()
        
        # 2. 发布时间分布图
        dates = pd.Series([p.published_date for p in papers])
        plt.figure(figsize=(15, 6))
        dates.dt.year.value_counts().sort_index().plot(kind='bar')
        plt.title('Publication Year Distribution')
        plt.xlabel('Year')
        plt.ylabel('Number of Papers')
        plt.savefig(f"{output_dir}/year_distribution.png")
        plt.close()
        
        # 3. 引用网络图
        citation_network = self.citation_network_analysis(papers)
        G = nx.DiGraph()
        for paper in papers[:50]:  # 限制显示前50篇论文以避免图太复杂
            for ref in paper.references:
                if ref.reference_title:
                    G.add_edge(paper.title[:30], ref.reference_title[:30])
        
        plt.figure(figsize=(20, 20))
        pos = nx.spring_layout(G)
        nx.draw(G, pos, with_labels=True, node_color='lightblue', 
                node_size=1000, font_size=8, arrows=True)
        plt.savefig(f"{output_dir}/citation_network.png")
        plt.close()
    
    def generate_comprehensive_report(self, papers: List[Paper], output_dir: str) -> str:
        """生成综合分析报告"""
        # 生成可视化
        self.generate_visualizations(papers, f"{output_dir}/figures")
        
        # 获取各种分析结果
        topics = self.topic_modeling(papers)
        citation_analysis = self.citation_network_analysis(papers)
        author_analysis = self.author_collaboration_analysis(papers)
        temporal_analysis = self.temporal_analysis(papers)
        
        # 生成报告
        report_path = f"{output_dir}/comprehensive_analysis.md"
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write("# 机器视觉文献综合分析报告\n\n")
            
            # 基本统计
            f.write("## 1. 基本统计\n\n")
            f.write(f"- 总论文数：{len(papers)}\n")
            f.write(f"- 时间跨度：{min(p.published_date for p in papers).year} - {max(p.published_date for p in papers).year}\n")
            f.write(f"- 涉及作者数：{len(set(author.name for p in papers for author in p.authors))}\n\n")
            
            # 研究主题
            f.write("## 2. 研究主题分析\n\n")
            for topic, words in topics["topics"].items():
                f.write(f"### {topic}\n")
                f.write(f"关键词：{', '.join(words)}\n\n")
            
            # 引文分析
            f.write("## 3. 引文网络分析\n\n")
            f.write("### 最具影响力的论文（基于PageRank）\n\n")
            for paper, score in citation_analysis["key_papers"]:
                f.write(f"- {paper}: {score:.4f}\n")
            
            # 作者合作分析
            f.write("\n## 4. 作者合作网络分析\n\n")
            f.write("### 核心作者\n\n")
            for author, score in author_analysis["core_authors"]:
                f.write(f"- {author}: {score:.4f}\n")
            
            # 时间趋势
            f.write("\n## 5. 发展趋势分析\n\n")
            f.write("### 月度发文量趋势\n\n")
            for date, count in temporal_analysis["monthly_counts"].items():
                f.write(f"- {date}: {count}篇\n")
            
            # 可视化图表
            f.write("\n## 6. 可视化图表\n\n")
            f.write("### 词云图\n")
            f.write("![词云图](figures/wordcloud.png)\n\n")
            f.write("### 年度发文量分布\n")
            f.write("![年度分布](figures/year_distribution.png)\n\n")
            f.write("### 引文网络图\n")
            f.write("![引文网络](figures/citation_network.png)\n")
        
        return report_path 