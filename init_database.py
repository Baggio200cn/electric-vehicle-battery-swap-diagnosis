import os
from datetime import datetime
from src.models.database import DatabaseManager

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
        'citations': 100,
        'local_path': os.path.join(os.getcwd(), 'downloads', 'paper1.pdf')
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
        'citations': 50,
        'local_path': os.path.join(os.getcwd(), 'downloads', 'paper2.pdf')
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
        try:
            paper = db_manager.add_paper(paper_data)
            papers.append(paper)
            print(f"成功添加论文: {paper_data['title']}")
        except Exception as e:
            print(f"添加论文失败 {paper_data['title']}: {str(e)}")
    
    return papers

def main():
    # 确保数据库目录存在
    if os.path.exists('papers.db'):
        os.remove('papers.db')
        print("删除旧的数据库文件")
    
    # 创建下载目录
    os.makedirs('downloads', exist_ok=True)
    
    # 初始化数据库
    print("初始化数据库...")
    db_manager = DatabaseManager('sqlite:///papers.db')
    
    # 创建测试数据
    print("添加测试数据...")
    papers = create_test_data(db_manager)
    print(f"成功添加 {len(papers)} 篇论文")

if __name__ == '__main__':
    main() 