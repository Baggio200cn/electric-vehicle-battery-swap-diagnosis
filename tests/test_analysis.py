import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime
from src.models.database import DatabaseManager
from src.processors.analysis import PaperAnalyzer

def create_test_data(db_manager):
    """创建测试数据"""
    # 测试论文1
    paper1 = {
        'title': 'Deep Learning for Computer Vision: A Survey',
        'authors': ['John Smith', 'Mary Johnson'],
        'abstract': 'This paper provides a comprehensive survey of deep learning methods in computer vision.',
        'url': 'https://example.com/paper1',
        'pdf_url': 'https://example.com/paper1.pdf',
        'published_date': datetime(2023, 1, 1),
        'source': 'arxiv',
        'category': '计算机视觉基础',
        'keywords': ['deep learning', 'computer vision', 'survey'],
        'doi': '10.1234/abc123',
        'citations': 100
    }
    
    # 测试论文2
    paper2 = {
        'title': 'Industrial Visual Inspection Using Deep Learning',
        'authors': ['Mary Johnson', 'David Brown'],
        'abstract': 'We present a novel approach for industrial visual inspection using deep learning methods.',
        'url': 'https://example.com/paper2',
        'pdf_url': 'https://example.com/paper2.pdf',
        'published_date': datetime(2023, 2, 1),
        'source': 'arxiv',
        'category': '工业视觉检测',
        'keywords': ['industrial inspection', 'deep learning', 'quality control'],
        'doi': '10.1234/def456',
        'citations': 50
    }
    
    # 测试论文3
    paper3 = {
        'title': 'Medical Image Analysis with AI',
        'authors': ['David Brown', 'Sarah Wilson'],
        'abstract': 'An innovative approach to medical image analysis using artificial intelligence.',
        'url': 'https://example.com/paper3',
        'pdf_url': 'https://example.com/paper3.pdf',
        'published_date': datetime(2023, 3, 1),
        'source': 'arxiv',
        'category': '医学图像分析',
        'keywords': ['medical imaging', 'AI', 'healthcare'],
        'doi': '10.1234/ghi789',
        'citations': 75
    }
    
    # 添加论文到数据库
    papers = []
    for paper_data in [paper1, paper2, paper3]:
        paper = db_manager.add_paper(paper_data)
        papers.append(paper)
    
    return papers

def test_database_and_analysis():
    """测试数据库和分析功能"""
    try:
        # 初始化数据库（使用SQLite进行测试）
        db_manager = DatabaseManager('sqlite:///test.db')
        
        # 创建测试数据
        print("创建测试数据...")
        papers = create_test_data(db_manager)
        
        # 初始化分析器
        analyzer = PaperAnalyzer(db_manager)
        
        # 1. 测试主题建模
        print("\n测试主题建模...")
        topics = analyzer.topic_modeling(papers)
        print("发现的主题：")
        for topic, words in topics["topics"].items():
            print(f"{topic}: {', '.join(words)}")
        
        # 2. 测试引文网络分析
        print("\n测试引文网络分析...")
        citation_network = analyzer.citation_network_analysis(papers)
        print("关键论文：")
        for paper, score in citation_network["key_papers"]:
            print(f"- {paper}: {score:.4f}")
        
        # 3. 测试作者合作网络分析
        print("\n测试作者合作网络分析...")
        collaboration = analyzer.author_collaboration_analysis(papers)
        print("核心作者：")
        for author, score in collaboration["core_authors"]:
            print(f"- {author}: {score:.4f}")
        
        # 4. 测试时间序列分析
        print("\n测试时间序列分析...")
        temporal = analyzer.temporal_analysis(papers)
        print("月度发文量：")
        for date, count in temporal["monthly_counts"].items():
            print(f"- {date}: {count}篇")
        
        # 5. 生成综合报告
        print("\n生成综合分析报告...")
        report_path = analyzer.generate_comprehensive_report(papers, "test_reports")
        print(f"报告已生成：{report_path}")
        
        # 6. 测试数据库查询
        print("\n测试数据库查询...")
        # 按类别查询
        cv_papers = db_manager.get_papers_by_category("计算机视觉基础")
        print(f"计算机视觉基础类论文数量：{len(cv_papers)}")
        
        # 按标题查询
        paper = db_manager.get_paper_by_title("Deep Learning for Computer Vision: A Survey")
        if paper:
            print(f"找到论文：{paper.title}")
            print(f"作者：{', '.join(author.name for author in paper.authors)}")
        
        print("\n所有测试完成！")
        
    except Exception as e:
        print(f"测试过程中出现错误：{str(e)}")
    finally:
        # 清理测试数据库
        if os.path.exists('test.db'):
            os.remove('test.db')

if __name__ == '__main__':
    test_database_and_analysis() 