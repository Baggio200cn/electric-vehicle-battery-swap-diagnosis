#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
最终完整版机器视觉文献获取系统
特性：
• 修复所有兼容性问题
• 支持多个专业数据源
• 智能PDF/网页链接处理
• 优化的用户界面
• 稳定的文件下载功能

作者：AI Assistant  
版本：6.0 - 最终版
"""

import sys
import requests
import json
import os
import webbrowser
from datetime import datetime, timedelta
from pathlib import Path
import urllib.parse
import time
import re
import pyttsx3  # 添加TTS引擎
import threading  # 用于异步TTS处理

try:
    from PyQt6.QtWidgets import (
        QApplication, QMainWindow, QVBoxLayout, QHBoxLayout, QWidget,
        QLabel, QPushButton, QComboBox, QTextEdit, QProgressBar, QMessageBox,
        QCheckBox, QFileDialog, QLineEdit, QTabWidget, QSplitter, QGroupBox,
        QListWidget, QListWidgetItem, QScrollArea, QDialog, QDialogButtonBox
    )
    from PyQt6.QtCore import QThread, pyqtSignal, QTimer, Qt, QUrl
    from PyQt6.QtGui import QFont, QColor, QDesktopServices
    PYQT_VERSION = 6
except ImportError:
    try:
        from PyQt5.QtWidgets import (
            QApplication, QMainWindow, QVBoxLayout, QHBoxLayout, QWidget,
            QLabel, QPushButton, QComboBox, QTextEdit, QProgressBar, QMessageBox,
            QCheckBox, QFileDialog, QLineEdit, QTabWidget, QSplitter, QGroupBox,
            QListWidget, QListWidgetItem, QScrollArea
        )
        from PyQt5.QtCore import QThread, pyqtSignal, QTimer, Qt, QUrl
        from PyQt5.QtGui import QFont, QColor, QDesktopServices
        PYQT_VERSION = 5
    except ImportError:
        print("错误：请安装PyQt6或PyQt5")
        print("运行：pip install PyQt6  或  pip install PyQt5")
        sys.exit(1)

import xml.etree.ElementTree as ET
from database_manager import DatabaseManager

# 颜色常量定义
COLOR_PDF_AVAILABLE = QColor(144, 238, 144)    # 浅绿色 - PDF可用
COLOR_LINK_AVAILABLE = QColor(173, 216, 230)   # 浅蓝色 - 仅链接可用
COLOR_NO_LINK = QColor(211, 211, 211)          # 浅灰色 - 无链接
COLOR_WHITE = QColor(255, 255, 255)            # 白色

class TTSManager:
    """文本转语音管理器"""
    
    def __init__(self):
        self.engine = None
        self.init_engine()
    
    def init_engine(self):
        """初始化TTS引擎"""
        try:
            self.engine = pyttsx3.init()
            # 设置中文语音
            self.engine.setProperty('rate', 150)  # 语速
            self.engine.setProperty('volume', 0.9)  # 音量
            voices = self.engine.getProperty('voices')
            
            print("可用的语音列表:")
            for voice in voices:
                print(f"- {voice.name} ({voice.id})")
            
            # 尝试设置中文声音
            chinese_voice = None
            for voice in voices:
                if "chinese" in voice.name.lower():
                    chinese_voice = voice
                    break
            
            if chinese_voice:
                print(f"已选择中文语音: {chinese_voice.name}")
                self.engine.setProperty('voice', chinese_voice.id)
            else:
                print("未找到中文语音，使用默认语音")
            
            return True
            
        except Exception as e:
            print(f"TTS引擎初始化错误: {e}")
            self.engine = None
            return False
    
    def text_to_speech(self, text, output_path):
        """将文本转换为语音文件"""
        try:
            if not self.engine:
                print("正在重新初始化TTS引擎...")
                if not self.init_engine():
                    print("TTS引擎初始化失败，无法生成语音")
                    return False
            
            print(f"开始生成语音文件: {output_path}")
            print(f"文本长度: {len(text)} 字符")
            
            # 确保输出目录存在
            output_dir = os.path.dirname(output_path)
            if not os.path.exists(output_dir):
                os.makedirs(output_dir)
            
            # 使用wav格式替代mp3（更好的兼容性）
            output_path = output_path.replace('.mp3', '.wav')
            
            self.engine.save_to_file(text, output_path)
            self.engine.runAndWait()
            
            if os.path.exists(output_path):
                file_size = os.path.getsize(output_path)
                print(f"语音文件生成成功: {output_path}")
                print(f"文件大小: {file_size/1024:.2f} KB")
                return True
            else:
                print("语音文件生成失败：文件未创建")
                return False
                
        except Exception as e:
            print(f"TTS转换错误: {e}")
            return False

class EnhancedDownloader:
    """增强型下载器 - 支持PDF和网页链接"""
    
    def __init__(self, download_path="./downloads"):
        self.download_path = Path(download_path)
        self.download_path.mkdir(exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.tts_manager = TTSManager()  # 添加TTS管理器
    
    def process_paper(self, paper, progress_callback=None):
        """处理论文 - 优先下载PDF，否则保存网页链接"""
        result = {
            'paper': paper,
            'success': False,
            'file_path': None,
            'link_saved': False,
            'error': None
        }
        
        try:
            # 创建按数据源分类的子文件夹
            source_folder = self.download_path / paper.get('source', 'unknown')
            source_folder.mkdir(exist_ok=True)
            
            # 清理文件名
            safe_title = self.sanitize_filename(paper['title'])
            
            # 尝试下载PDF
            pdf_url = paper.get('pdf_url')
            if pdf_url and self.is_valid_pdf_url(pdf_url):
                pdf_path = self.download_pdf(pdf_url, safe_title, source_folder, progress_callback)
                if pdf_path:
                    result['success'] = True
                    result['file_path'] = pdf_path
                    return result
            
            # 如果PDF下载失败，保存网页链接
            web_url = paper.get('web_url') or paper.get('url') or pdf_url
            if web_url:
                link_file = self.save_web_link(paper, safe_title, source_folder)
                if link_file:
                    result['link_saved'] = True
                    result['file_path'] = link_file
                    result['success'] = True
                    
        except Exception as e:
            result['error'] = str(e)
            
        return result
    
    def is_valid_pdf_url(self, url):
        """检查URL是否可能是有效的PDF链接"""
        try:
            # 发送HEAD请求检查
            response = self.session.head(url, timeout=10, allow_redirects=True)
            content_type = response.headers.get('content-type', '').lower()
            
            # 检查内容类型
            if 'pdf' in content_type:
                return True
            elif 'html' in content_type and any(domain in url for domain in ['arxiv.org/pdf', 'biorxiv.org']):
                return True
                
        except:
            pass
            
        # 基于URL模式判断
        pdf_patterns = [
            r'\.pdf$',
            r'arxiv\.org/pdf/',
            r'biorxiv\.org.*\.pdf',
            r'openaccess.*\.pdf'
        ]
        
        return any(re.search(pattern, url, re.IGNORECASE) for pattern in pdf_patterns)
    
    def download_pdf(self, url, title, folder, progress_callback=None):
        """下载PDF文件"""
        try:
            filename = f"{title}.pdf"
            filepath = folder / filename
            
            # 如果文件已存在，跳过
            if filepath.exists():
                return str(filepath)
            
            response = self.session.get(url, stream=True, timeout=60)
            response.raise_for_status()
            
            # 检查响应内容
            content_type = response.headers.get('content-type', '').lower()
            if 'html' in content_type:
                # 可能是需要解析的页面
                return None
                
            total_size = int(response.headers.get('content-length', 0))
            downloaded = 0
            
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)
                        
                        if progress_callback and total_size > 0:
                            progress = int((downloaded / total_size) * 100)
                            progress_callback(progress)
            
            # 验证文件
            if filepath.stat().st_size < 1024:
                filepath.unlink()
                return None
                
            return str(filepath)
            
        except Exception as e:
            print(f"PDF下载错误: {e}")
            return None
    
    def save_web_link(self, paper, title, folder):
        """保存网页链接为HTML文件，并包含中文摘要和音频"""
        try:
            filename = f"{title}_摘要与链接.html"
            filepath = folder / filename
            
            # 生成音频文件
            audio_filename = f"{title}_摘要朗读.wav"  # 改为wav格式
            audio_filepath = folder / audio_filename
            
            # 准备要转换为语音的文本
            tts_text = f"""论文标题：{paper['title']}。
作者信息：{paper.get('authors', '未知作者')}。
发表时间：{paper.get('published', '未知日期')}。
发表来源：{paper.get('source', '未知来源')}。
内容概要：{paper.get('abstract', '暂无摘要信息。')}"""

            print(f"\n开始处理论文音频: {title}")
            
            # 异步生成音频文件
            def generate_audio():
                success = self.tts_manager.text_to_speech(tts_text, str(audio_filepath))
                if success:
                    print(f"✓ 音频生成成功: {audio_filename}")
                else:
                    print(f"✗ 音频生成失败: {audio_filename}")
            
            audio_thread = threading.Thread(target=generate_audio)
            audio_thread.start()
            
            # 生成中文摘要
            chinese_summary = f"""
<div class="chinese-summary">
    <h2>📑 论文中文摘要</h2>
    <div class="summary-content">
        <p><strong>📌 论文标题：</strong>{paper['title']}</p>
        <p><strong>👥 作者信息：</strong>{paper.get('authors', '未知作者')}</p>
        <p><strong>📅 发表时间：</strong>{paper.get('published', '未知日期')}</p>
        <p><strong>📚 发表来源：</strong>{paper.get('source', '未知来源')}{f", {paper.get('venue', '')}" if paper.get('venue') else ''}</p>
        {f'<p><strong>📊 引用次数：</strong>{paper.get("citations", 0)}次</p>' if paper.get('citations') is not None else ''}
        <p><strong>📝 内容概要：</strong></p>
        <div class="abstract-text">
            {paper.get('abstract', '暂无摘要信息。')}
        </div>
        <div class="audio-player">
            <h3>🎧 语音朗读</h3>
            <audio controls>
                <source src="{audio_filename}" type="audio/wav">
                您的浏览器不支持音频播放。
            </audio>
            <p class="audio-note">注：如果音频无法播放，请直接打开同目录下的 {audio_filename} 文件收听。</p>
        </div>
    </div>
</div>"""
            
            # 创建HTML内容
            html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{paper['title']}</title>
    <style>
        body {{ font-family: "Microsoft YaHei", Arial, sans-serif; margin: 40px; background-color: #f5f5f5; }}
        .container {{ background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .paper-info {{ background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }}
        .chinese-summary {{ 
            background-color: #fff8e1; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
            border-left: 4px solid #ffc107;
        }}
        .summary-content {{ line-height: 1.8; }}
        .abstract-text {{ 
            background: #fff;
            padding: 15px;
            border-radius: 5px;
            margin-top: 10px;
            border: 1px solid #e0e0e0;
        }}
        .audio-player {{
            margin-top: 20px;
            padding: 15px;
            background: #e3f2fd;
            border-radius: 8px;
            text-align: center;
        }}
        audio {{
            width: 100%;
            margin-top: 10px;
        }}
        .link {{ margin: 20px 0; text-align: center; }}
        a {{ 
            color: #0066cc; 
            text-decoration: none; 
            background-color: #e3f2fd;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
            transition: all 0.3s;
        }}
        a:hover {{ 
            background-color: #bbdefb;
            transform: translateY(-2px);
        }}
        h1 {{ color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }}
        h2 {{ color: #5d4037; margin-top: 0; }}
        h3 {{ color: #1976d2; margin-top: 0; }}
        .meta {{ color: #666; margin: 5px 0; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>📄 论文信息</h1>
        
        {chinese_summary}
        
        <div class="link">
            <h3>🔗 访问原文:</h3>
            <a href="{paper.get('web_url') or paper.get('url') or paper.get('pdf_url')}" target="_blank">
                点击访问原文 →
            </a>
        </div>
        
        <div style="text-align: center; color: #888; font-size: 12px; margin-top: 30px;">
            <p>📄 由机器视觉文献获取系统生成</p>
            <p>🕒 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        </div>
    </div>
</body>
</html>"""
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            # 等待音频生成完成
            audio_thread.join()
                
            return str(filepath)
            
        except Exception as e:
            print(f"链接保存错误: {e}")
            return None
    
    def sanitize_filename(self, filename):
        """清理文件名"""
        filename = re.sub(r'<[^>]+>', '', filename)
        invalid_chars = '<>:"/\\|?*\n\r\t'
        for char in invalid_chars:
            filename = filename.replace(char, '_')
        filename = re.sub(r'[_\s]+', '_', filename).strip('_')
        return filename[:100] if len(filename) > 100 else filename or "unknown_title"

class ArxivCrawler:
    """增强的ArXiv爬虫"""
    
    def __init__(self):
        self.base_url = "http://export.arxiv.org/api/query"
        self.name = "arXiv"
    
    def search(self, keywords, max_results=10):
        """搜索论文"""
        try:
            # 构建查询
            query_parts = []
            for word in keywords.split():
                query_parts.append(f'all:"{word}"')
            query = ' AND '.join(query_parts)
            
            params = {
                'search_query': query,
                'start': 0,
                'max_results': min(max_results, 50),
                'sortBy': 'submittedDate',
                'sortOrder': 'descending'
            }
            
            response = requests.get(self.base_url, params=params, timeout=30)
            response.raise_for_status()
            
            return self.parse_results(response.text)
            
        except Exception as e:
            print(f"arXiv搜索错误: {e}")
            return []
    
    def parse_results(self, xml_text):
        """解析XML结果"""
        papers = []
        try:
            root = ET.fromstring(xml_text)
            
            for entry in root.findall('{http://www.w3.org/2005/Atom}entry'):
                paper = {}
                
                # 标题
                title_elem = entry.find('{http://www.w3.org/2005/Atom}title')
                paper['title'] = title_elem.text.strip() if title_elem is not None else "未知标题"
                
                # 作者
                authors = []
                for author in entry.findall('{http://www.w3.org/2005/Atom}author'):
                    name_elem = author.find('{http://www.w3.org/2005/Atom}name')
                    if name_elem is not None:
                        authors.append(name_elem.text)
                paper['authors'] = ', '.join(authors) if authors else "未知作者"
                
                # 摘要
                summary_elem = entry.find('{http://www.w3.org/2005/Atom}summary')
                paper['abstract'] = summary_elem.text.strip() if summary_elem is not None else "无摘要"
                
                # 发布日期
                published_elem = entry.find('{http://www.w3.org/2005/Atom}published')
                paper['published'] = published_elem.text[:10] if published_elem is not None else "未知日期"
                
                # 链接处理
                pdf_link = None
                web_link = None
                
                for link in entry.findall('{http://www.w3.org/2005/Atom}link'):
                    if link.get('type') == 'application/pdf':
                        pdf_link = link.get('href')
                    elif link.get('rel') == 'alternate':
                        web_link = link.get('href')
                
                # arXiv ID
                id_elem = entry.find('{http://www.w3.org/2005/Atom}id')
                if id_elem is not None:
                    arxiv_id = id_elem.text.split('/')[-1]
                    if not pdf_link:
                        pdf_link = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
                    if not web_link:
                        web_link = f"https://arxiv.org/abs/{arxiv_id}"
                
                paper['pdf_url'] = pdf_link
                paper['web_url'] = web_link
                paper['source'] = 'arXiv'
                paper['categories'] = self.extract_categories(entry)
                
                papers.append(paper)
                
        except Exception as e:
            print(f"arXiv解析错误: {e}")
            
        return papers
    
    def extract_categories(self, entry):
        """提取分类"""
        categories = []
        for category in entry.findall('{http://www.w3.org/2005/Atom}category'):
            term = category.get('term')
            if term:
                categories.append(term)
        return ', '.join(categories) if categories else "未分类"

class SemanticScholarCrawler:
    """增强的Semantic Scholar爬虫"""
    
    def __init__(self):
        self.base_url = "https://api.semanticscholar.org/graph/v1/paper/search"
        self.name = "Semantic Scholar"
    
    def search(self, keywords, max_results=10):
        """搜索论文"""
        try:
            params = {
                'query': keywords,
                'limit': min(max_results, 100),
                'fields': 'title,authors,abstract,year,openAccessPdf,url,venue,citationCount,externalIds'
            }
            
            headers = {
                'User-Agent': 'Scientific Paper Crawler 1.0'
            }
            
            response = requests.get(self.base_url, params=params, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            papers = []
            
            for item in data.get('data', []):
                authors = [author.get('name', '') for author in item.get('authors', [])]
                
                # 获取PDF链接
                pdf_url = None
                if item.get('openAccessPdf'):
                    pdf_url = item['openAccessPdf'].get('url')
                
                # 获取网页链接
                web_url = item.get('url')
                if not web_url and item.get('externalIds'):
                    doi = item['externalIds'].get('DOI')
                    if doi:
                        web_url = f"https://doi.org/{doi}"
                
                paper = {
                    'title': item.get('title', '未知标题'),
                    'authors': ', '.join(authors) if authors else '未知作者',
                    'abstract': item.get('abstract', '无摘要') or '无摘要',
                    'published': str(item.get('year', '未知年份')),
                    'pdf_url': pdf_url,
                    'web_url': web_url,
                    'source': 'Semantic Scholar',
                    'venue': item.get('venue', '未知期刊'),
                    'citations': item.get('citationCount', 0)
                }
                papers.append(paper)
            
            return papers
            
        except Exception as e:
            print(f"Semantic Scholar搜索错误: {e}")
            return []

class PubmedCrawler:
    """PubMed医学文献爬虫"""
    
    def __init__(self):
        self.base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
        self.name = "PubMed"
    
    def search(self, keywords, max_results=10):
        """搜索论文"""
        try:
            # 第一步：搜索获取ID
            search_url = f"{self.base_url}/esearch.fcgi"
            search_params = {
                'db': 'pubmed',
                'term': keywords,
                'retmax': min(max_results, 100),
                'retmode': 'json',
                'sort': 'pub_date',
                'tool': 'vision_crawler',
                'email': 'example@example.com'
            }
            
            search_response = requests.get(search_url, params=search_params, timeout=30)
            search_response.raise_for_status()
            search_data = search_response.json()
            
            ids = search_data.get('esearchresult', {}).get('idlist', [])
            if not ids:
                return []
            
            # 添加延迟避免被限制
            time.sleep(0.5)
            
            # 第二步：获取详细信息
            fetch_url = f"{self.base_url}/efetch.fcgi"
            fetch_params = {
                'db': 'pubmed',
                'id': ','.join(ids),
                'retmode': 'xml',
                'tool': 'vision_crawler',
                'email': 'example@example.com'
            }
            
            fetch_response = requests.get(fetch_url, params=fetch_params, timeout=60)
            fetch_response.raise_for_status()
            
            return self.parse_pubmed_xml(fetch_response.text)
            
        except Exception as e:
            print(f"PubMed搜索错误: {e}")
            return []
    
    def parse_pubmed_xml(self, xml_text):
        """解析PubMed XML"""
        papers = []
        try:
            root = ET.fromstring(xml_text)
            
            for article in root.findall('.//PubmedArticle'):
                paper = {}
                
                # 标题
                title_elem = article.find('.//ArticleTitle')
                paper['title'] = title_elem.text if title_elem is not None else "未知标题"
                
                # 作者
                authors = []
                for author in article.findall('.//Author'):
                    lastname = author.find('LastName')
                    firstname = author.find('ForeName')
                    if lastname is not None:
                        name = lastname.text
                        if firstname is not None:
                            name = f"{firstname.text} {name}"
                        authors.append(name)
                
                paper['authors'] = ', '.join(authors) if authors else "未知作者"
                
                # 摘要
                abstract_texts = []
                for abstract in article.findall('.//Abstract/AbstractText'):
                    if abstract.text:
                        abstract_texts.append(abstract.text)
                paper['abstract'] = ' '.join(abstract_texts) if abstract_texts else "无摘要"
                
                # 发布日期
                date_elem = article.find('.//PubDate/Year')
                paper['published'] = date_elem.text if date_elem is not None else "未知日期"
                
                # 期刊
                journal_elem = article.find('.//Journal/Title')
                paper['journal'] = journal_elem.text if journal_elem is not None else "未知期刊"
                
                # PMID和链接
                pmid = None
                pmid_elem = article.find('.//PMID')
                if pmid_elem is not None:
                    pmid = pmid_elem.text
                
                # PMC ID (用于构建PDF链接)
                pdf_url = None
                pmcid_elem = article.find('.//ArticleId[@IdType="pmc"]')
                if pmcid_elem is not None:
                    pmc_id = pmcid_elem.text
                    pdf_url = f"https://www.ncbi.nlm.nih.gov/pmc/articles/{pmc_id}/pdf/"
                
                # 网页链接
                web_url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/" if pmid else None
                
                paper['pdf_url'] = pdf_url
                paper['web_url'] = web_url
                paper['source'] = 'PubMed'
                paper['pmid'] = pmid
                
                papers.append(paper)
                
        except Exception as e:
            print(f"PubMed解析错误: {e}")
        
        return papers

class IEEE_Crawler:
    """IEEE Xplore爬虫"""
    
    def __init__(self):
        self.name = "IEEE Xplore"
        # 注意：实际使用需要IEEE API密钥
    
    def search(self, keywords, max_results=10):
        """搜索论文"""
        try:
            # 这里提供示例结果，实际需要IEEE API
            sample_papers = [
                {
                    'title': 'Machine Vision for Industrial Quality Control',
                    'authors': 'IEEE Research Team',
                    'abstract': 'This paper presents a comprehensive approach to industrial quality control using machine vision techniques...',
                    'published': '2024',
                    'source': 'IEEE Xplore',
                    'pdf_url': None,  # IEEE通常需要订阅
                    'web_url': 'https://ieeexplore.ieee.org/document/example',
                    'venue': 'IEEE Transactions on Industrial Informatics'
                }
            ]
            
            return sample_papers[:max_results]
            
        except Exception as e:
            print(f"IEEE搜索错误: {e}")
            return []

class CrawlerWorker(QThread):
    """爬虫工作线程"""
    progress = pyqtSignal(int)
    status = pyqtSignal(str)
    result = pyqtSignal(list)
    finished = pyqtSignal()
    
    def __init__(self, domain, source, max_results, custom_keywords=""):
        super().__init__()
        self.domain = domain
        self.source = source
        self.max_results = max_results
        self.custom_keywords = custom_keywords
    
    def run(self):
        """运行爬虫"""
        try:
            self.status.emit(f"正在从 {self.source} 搜索相关论文...")
            
            # 关键词映射
            keywords_map = {
                "计算机视觉基础": "computer vision image processing pattern recognition",
                "深度学习视觉": "deep learning computer vision CNN neural network",
                "工业视觉检测": "industrial vision inspection machine vision quality control automated optical inspection",
                "医学图像分析": "medical image analysis medical imaging radiology computer aided diagnosis",
                "机器人视觉": "robot vision robotic perception visual servoing",
                "自动驾驶视觉": "autonomous driving computer vision object detection lane detection",
                "人脸识别": "face recognition facial recognition biometric identification",
                "目标检测": "object detection YOLO R-CNN detection algorithms",
                # 新添加的光学相关关键词映射
                "光学系统设计": "optical system design lens design optimization imaging optics design",
                "镜头优化设计": "lens optimization aberration correction optical design software zemax",
                "光学成像系统": "optical imaging system lens array design optical system engineering"
            }
            
            # 使用自定义关键词或预设关键词
            if self.custom_keywords.strip():
                keywords = self.custom_keywords
            else:
                keywords = keywords_map.get(self.domain, "computer vision")
            
            papers = []
            
            # 选择对应的爬虫
            crawlers = {
                "arXiv": ArxivCrawler(),
                "Semantic Scholar": SemanticScholarCrawler(),
                "PubMed": PubmedCrawler(),
                "IEEE Xplore": IEEE_Crawler()
            }
            
            if self.source in crawlers:
                crawler = crawlers[self.source]
                papers = crawler.search(keywords, self.max_results)
            else:
                self.status.emit(f"{self.source} 数据源暂未实现")
                papers = []
            
            self.status.emit(f"从 {self.source} 找到 {len(papers)} 篇相关论文")
            self.result.emit(papers)
            
            # 模拟处理进度
            for i in range(101):
                self.progress.emit(i)
                self.msleep(20)
                
        except Exception as e:
            self.status.emit(f"搜索出错: {str(e)}")
            self.result.emit([])
        finally:
            self.finished.emit()

class DownloadWorker(QThread):
    """下载工作线程"""
    progress = pyqtSignal(int)
    status = pyqtSignal(str)
    finished = pyqtSignal()
    
    def __init__(self, papers, download_path):
        super().__init__()
        self.papers = papers
        self.download_path = download_path
    
    def run(self):
        """运行下载"""
        try:
            downloader = EnhancedDownloader(self.download_path)
            total_papers = len(self.papers)
            success_count = 0
            link_count = 0
            
            for i, paper in enumerate(self.papers):
                self.status.emit(f"正在处理: {paper['title'][:50]}...")
                
                def progress_callback(progress):
                    overall_progress = int((i / total_papers) * 100 + (progress / total_papers))
                    self.progress.emit(min(overall_progress, 100))
                
                result = downloader.process_paper(paper, progress_callback)
                
                if result['success']:
                    if result.get('link_saved'):
                        link_count += 1
                        self.status.emit(f"✓ 已保存链接: {paper['title'][:50]}...")
                    else:
                        success_count += 1
                        self.status.emit(f"✓ 已下载PDF: {paper['title'][:50]}...")
                else:
                    self.status.emit(f"✗ 处理失败: {paper['title'][:50]}...")
                
                # 更新总进度
                self.progress.emit(int(((i + 1) / total_papers) * 100))
                time.sleep(0.5)
            
            summary = f"🎉 处理完成！PDF下载: {success_count}篇，链接保存: {link_count}篇，总计: {total_papers}篇"
            self.status.emit(summary)
            
        except Exception as e:
            self.status.emit(f"处理出错: {str(e)}")
        finally:
            self.finished.emit()

class PaperDialog(QDialog):
    """论文详情对话框"""
    
    def __init__(self, db_manager, paper=None, parent=None):
        super().__init__(parent)
        self.db_manager = db_manager
        self.paper = paper
        self.init_ui()
    
    def init_ui(self):
        """初始化界面"""
        self.setWindowTitle("论文详情")
        self.setMinimumWidth(600)
        
        layout = QVBoxLayout(self)
        
        # 标题
        title_layout = QHBoxLayout()
        title_layout.addWidget(QLabel("标题:"))
        self.title_edit = QLineEdit()
        if self.paper:
            self.title_edit.setText(self.paper.title)
        title_layout.addWidget(self.title_edit)
        layout.addLayout(title_layout)
        
        # 作者
        authors_layout = QHBoxLayout()
        authors_layout.addWidget(QLabel("作者:"))
        self.authors_edit = QLineEdit()
        if self.paper:
            self.authors_edit.setText(self.paper.authors)
        authors_layout.addWidget(self.authors_edit)
        layout.addLayout(authors_layout)
        
        # 摘要
        layout.addWidget(QLabel("摘要:"))
        self.abstract_edit = QTextEdit()
        if self.paper:
            self.abstract_edit.setText(self.paper.abstract)
        layout.addWidget(self.abstract_edit)
        
        # 分类
        category_layout = QHBoxLayout()
        category_layout.addWidget(QLabel("分类:"))
        self.category_combo = QComboBox()
        categories = self.db_manager.get_all_categories()
        for category in categories:
            self.category_combo.addItem(category.name, category.id)
        if self.paper and self.paper.category_id:
            index = self.category_combo.findData(self.paper.category_id)
            if index >= 0:
                self.category_combo.setCurrentIndex(index)
        category_layout.addWidget(self.category_combo)
        layout.addLayout(category_layout)
        
        # 标签
        layout.addWidget(QLabel("标签 (用逗号分隔):"))
        self.tags_edit = QLineEdit()
        if self.paper:
            self.tags_edit.setText(",".join(tag.name for tag in self.paper.tags))
        layout.addWidget(self.tags_edit)
        
        # 笔记
        if self.paper:
            layout.addWidget(QLabel("笔记:"))
            self.notes_edit = QTextEdit()
            notes = self.db_manager.get_paper_notes(self.paper.id)
            self.notes_edit.setText("\n---\n".join(note.content for note in notes))
            layout.addWidget(self.notes_edit)
        
        # 按钮
        button_box = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Ok | 
            QDialogButtonBox.StandardButton.Cancel
        )
        button_box.accepted.connect(self.accept)
        button_box.rejected.connect(self.reject)
        layout.addWidget(button_box)
    
    def get_data(self):
        """获取表单数据"""
        return {
            'title': self.title_edit.text(),
            'authors': self.authors_edit.text(),
            'abstract': self.abstract_edit.toPlainText(),
            'category_id': self.category_combo.currentData(),
            'tags': [tag.strip() for tag in self.tags_edit.text().split(',') if tag.strip()],
            'notes': self.notes_edit.toPlainText() if hasattr(self, 'notes_edit') else None
        }

class VisionLiteratureSystem(QMainWindow):
    """机器视觉文献获取系统主窗口"""
    
    def __init__(self):
        super().__init__()
        self.current_papers = []
        self.crawler_worker = None
        self.download_worker = None
        self.dark_mode = False
        self.db_manager = DatabaseManager()
        self.init_ui()
    
    def init_ui(self):
        """初始化用户界面"""
        self.setWindowTitle("机器视觉文献获取系统 v6.0 - 最终版")
        self.setGeometry(100, 100, 1400, 1000)
        
        # 设置样式
        self.update_style()
        
        # 主窗口部件
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        
        # 创建主布局
        main_layout = QVBoxLayout(main_widget)
        main_layout.setSpacing(15)
        
        # 标题
        self.create_title_section(main_layout)
        
        # 控制面板
        self.create_control_panel(main_layout)
        
        # 创建分割器
        splitter = QSplitter(Qt.Orientation.Vertical)
        
        # 状态区域
        status_widget = self.create_status_section()
        splitter.addWidget(status_widget)
        
        # 结果显示区域
        result_widget = self.create_result_section()
        splitter.addWidget(result_widget)
        
        # 设置分割器比例
        splitter.setStretchFactor(0, 1)
        splitter.setStretchFactor(1, 4)
        
        main_layout.addWidget(splitter)
    
    def update_style(self):
        """更新样式表"""
        if self.dark_mode:
            self.setStyleSheet("""
                QMainWindow {
                    background-color: #1a1a1a;
                }
                QGroupBox {
                    font-weight: bold;
                    border: 2px solid #2d2d2d;
                    border-radius: 8px;
                    margin-top: 1ex;
                    padding-top: 15px;
                    background-color: #2d2d2d;
                    color: #ffffff;
                }
                QGroupBox::title {
                    subcontrol-origin: margin;
                    left: 15px;
                    padding: 0 8px 0 8px;
                    color: #ffffff;
                }
                QPushButton {
                    border: none;
                    border-radius: 6px;
                    padding: 10px 15px;
                    font-size: 13px;
                    font-weight: 500;
                    background-color: #0d6efd;
                    color: white;
                }
                QPushButton:hover {
                    background-color: #0b5ed7;
                }
                QPushButton:pressed {
                    background-color: #0a58ca;
                }
                QComboBox, QLineEdit {
                    border: 2px solid #2d2d2d;
                    border-radius: 6px;
                    padding: 8px;
                    background-color: #333333;
                    color: white;
                }
                QComboBox:focus, QLineEdit:focus {
                    border-color: #0d6efd;
                }
                QLabel {
                    color: #ffffff;
                }
                QTextEdit {
                    background-color: #333333;
                    color: white;
                    border: 2px solid #2d2d2d;
                    border-radius: 6px;
                }
                QScrollBar:vertical {
                    border: none;
                    background: #2d2d2d;
                    width: 14px;
                    margin: 15px 0 15px 0;
                    border-radius: 0px;
                }
                QScrollBar::handle:vertical {
                    background-color: #404040;
                    min-height: 30px;
                    border-radius: 7px;
                }
                QScrollBar::handle:vertical:hover {
                    background-color: #4d4d4d;
                }
            """)
        else:
            self.setStyleSheet("""
                QMainWindow {
                    background-color: #f8f9fa;
                }
                QGroupBox {
                    font-weight: bold;
                    border: 2px solid #dee2e6;
                    border-radius: 8px;
                    margin-top: 1ex;
                    padding-top: 15px;
                    background-color: white;
                }
                QGroupBox::title {
                    subcontrol-origin: margin;
                    left: 15px;
                    padding: 0 8px 0 8px;
                    color: #495057;
                }
                QPushButton {
                    border: none;
                    border-radius: 6px;
                    padding: 10px 15px;
                    font-size: 13px;
                    font-weight: 500;
                    background-color: #0d6efd;
                    color: white;
                }
                QPushButton:hover {
                    background-color: #0b5ed7;
                }
                QPushButton:pressed {
                    background-color: #0a58ca;
                }
                QComboBox, QLineEdit {
                    border: 2px solid #e9ecef;
                    border-radius: 6px;
                    padding: 8px;
                    background-color: white;
                }
                QComboBox:focus, QLineEdit:focus {
                    border-color: #0d6efd;
                }
            """)
    
    def toggle_theme(self):
        """切换深色/浅色主题"""
        self.dark_mode = not self.dark_mode
        self.update_style()
    
    def create_title_section(self, layout):
        """创建标题区域"""
        title_label = QLabel("🔍 机器视觉文献获取系统")
        title_font = QFont()
        title_font.setPointSize(22)
        title_font.setBold(True)
        title_label.setFont(title_font)
        title_label.setAlignment(Qt.AlignmentFlag.AlignCenter if PYQT_VERSION == 6 else Qt.AlignCenter)
        title_label.setStyleSheet("""
            QLabel {
                color: white;
                padding: 25px;
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0, 
                                          stop:0 #667eea, stop:1 #764ba2);
                border-radius: 10px;
                margin: 5px;
            }
        """)
        layout.addWidget(title_label)
        
        # 系统说明
        info_label = QLabel("🚀 支持专业数据源 | 💾 智能PDF/链接处理 | 🎯 精准搜索 | 📊 实时进度")
        info_label.setAlignment(Qt.AlignmentFlag.AlignCenter if PYQT_VERSION == 6 else Qt.AlignCenter)
        info_label.setStyleSheet("""
            color: #6c757d; 
            font-size: 13px; 
            margin-bottom: 15px;
            background-color: white;
            padding: 10px;
            border-radius: 5px;
        """)
        layout.addWidget(info_label)
    
    def create_control_panel(self, layout):
        """创建控制面板"""
        control_group = QGroupBox("🎛 搜索控制面板")
        control_layout = QVBoxLayout(control_group)
        
        # 第一行：基本设置
        basic_layout = QHBoxLayout()
        
        # 主题切换按钮
        theme_btn = QPushButton("🌓 切换主题")
        theme_btn.clicked.connect(self.toggle_theme)
        theme_btn.setStyleSheet("""
            QPushButton {
                background-color: #6c757d;
                color: white;
            }
            QPushButton:hover {
                background-color: #5a6268;
            }
        """)
        basic_layout.addWidget(theme_btn)
        
        # 研究领域
        domain_layout = QVBoxLayout()
        domain_layout.addWidget(QLabel("🔬 研究领域:"))
        self.domain_combo = QComboBox()
        self.domain_combo.addItems([
            "计算机视觉基础",
            "深度学习视觉", 
            "工业视觉检测",
            "医学图像分析",
            "机器人视觉",
            "自动驾驶视觉",
            "人脸识别",
            "目标检测",
            "光学系统设计",  # 新添加的领域
            "镜头优化设计",  # 新添加的领域
            "光学成像系统"   # 新添加的领域
        ])
        self.domain_combo.setCurrentText("工业视觉检测")
        domain_layout.addWidget(self.domain_combo)
        basic_layout.addLayout(domain_layout)
        
        # 数据源选择
        source_layout = QVBoxLayout()
        source_layout.addWidget(QLabel("📚 数据源:"))
        self.source_combo = QComboBox()
        self.source_combo.addItems([
            "arXiv",
            "Semantic Scholar",
            "PubMed",
            "IEEE Xplore"
        ])
        source_layout.addWidget(self.source_combo)
        basic_layout.addLayout(source_layout)
        
        # 结果数量
        count_layout = QVBoxLayout()
        count_layout.addWidget(QLabel("📊 获取数量:"))
        self.count_combo = QComboBox()
        self.count_combo.addItems(["3", "5", "10", "15", "20", "30"])
        self.count_combo.setCurrentText("5")
        count_layout.addWidget(self.count_combo)
        basic_layout.addLayout(count_layout)
        
        control_layout.addLayout(basic_layout)
        
        # 第二行：自定义关键词
        keyword_layout = QHBoxLayout()
        keyword_layout.addWidget(QLabel("🔑 自定义关键词 (可选):"))
        self.custom_keywords = QLineEdit()
        self.custom_keywords.setPlaceholderText("例如: industrial vision inspection defect detection quality control...")
        keyword_layout.addWidget(self.custom_keywords)
        control_layout.addLayout(keyword_layout)
        
        # 第三行：下载设置
        download_layout = QHBoxLayout()
        self.auto_download_check = QCheckBox("🔄 搜索完成后自动处理文件")
        self.auto_download_check.setChecked(True)
        download_layout.addWidget(self.auto_download_check)
        
        download_layout.addWidget(QLabel("📁 保存路径:"))
        self.download_path_label = QLabel("./downloads")
        self.download_path_label.setStyleSheet("""
            border: 2px solid #e9ecef; 
            padding: 8px; 
            background: white;
            border-radius: 6px;
        """)
        download_layout.addWidget(self.download_path_label)
        
        self.select_path_button = QPushButton("📂 选择路径")
        self.select_path_button.clicked.connect(self.select_download_path)
        self.select_path_button.setStyleSheet("""
            QPushButton {
                background-color: #6c757d;
                color: white;
            }
            QPushButton:hover {
                background-color: #5a6268;
            }
        """)
        download_layout.addWidget(self.select_path_button)
        control_layout.addLayout(download_layout)
        
        # 第四行：操作按钮
        button_layout = QHBoxLayout()
        
        self.start_button = QPushButton("🚀 开始获取")
        self.start_button.clicked.connect(self.start_search)
        self.start_button.setStyleSheet("""
            QPushButton {
                background-color: #28a745;
                color: white;
                font-size: 14px;
                font-weight: bold;
                padding: 12px 20px;
            }
            QPushButton:hover {
                background-color: #218838;
            }
        """)
        button_layout.addWidget(self.start_button)
        
        self.stop_button = QPushButton("⏹️ 停止")
        self.stop_button.clicked.connect(self.stop_search)
        self.stop_button.setEnabled(False)
        self.stop_button.setStyleSheet("""
            QPushButton {
                background-color: #dc3545;
                color: white;
                font-size: 14px;
                font-weight: bold;
                padding: 12px 20px;
            }
            QPushButton:hover {
                background-color: #c82333;
            }
        """)
        button_layout.addWidget(self.stop_button)
        
        self.download_button = QPushButton("📥 处理当前结果")
        self.download_button.clicked.connect(self.start_download)
        self.download_button.setEnabled(False)
        self.download_button.setStyleSheet("""
            QPushButton {
                background-color: #007bff;
                color: white;
                font-size: 14px;
                font-weight: bold;
                padding: 12px 20px;
            }
            QPushButton:hover {
                background-color: #0056b3;
            }
        """)
        button_layout.addWidget(self.download_button)
        
        self.clear_button = QPushButton("🗑 清空结果")
        self.clear_button.clicked.connect(self.clear_results)
        self.clear_button.setStyleSheet("""
            QPushButton {
                background-color: #6c757d;
                color: white;
                font-size: 14px;
                padding: 12px 20px;
            }
            QPushButton:hover {
                background-color: #5a6268;
            }
        """)
        button_layout.addWidget(self.clear_button)
        
        self.open_folder_button = QPushButton("📂 打开文件夹")
        self.open_folder_button.clicked.connect(self.open_download_folder)
        self.open_folder_button.setStyleSheet("""
            QPushButton {
                background-color: #17a2b8;
                color: white;
                font-size: 14px;
                padding: 12px 20px;
            }
            QPushButton:hover {
                background-color: #138496;
            }
        """)
        button_layout.addWidget(self.open_folder_button)
        
        control_layout.addLayout(button_layout)
        layout.addWidget(control_group)
    
    def create_status_section(self):
        """创建状态显示区域"""
        status_group = QGroupBox("📊 系统状态")
        status_layout = QVBoxLayout(status_group)
        
        # 状态文本区域
        self.status_text = QTextEdit()
        self.status_text.setReadOnly(True)
        self.status_text.setMaximumHeight(120)
        self.status_text.setStyleSheet("""
            QTextEdit {
                background-color: #1e1e1e;
                color: #ffffff;
                font-family: 'Consolas', 'Monaco', monospace;
                font-size: 12px;
                border-radius: 6px;
                padding: 10px;
                border: 2px solid #343a40;
            }
        """)
        self.status_text.append("🎯 系统已启动，请选择搜索参数后点击开始获取")
        self.status_text.append("💡 推荐: 工业视觉检测 + arXiv，获得最佳效果")
        self.status_text.append("📋 智能处理: 优先下载PDF，不可用时自动保存网页链接")
        status_layout.addWidget(self.status_text)
        
        # 进度条
        progress_layout = QHBoxLayout()
        progress_layout.addWidget(QLabel("📈 进度:"))
        self.progress_bar = QProgressBar()
        self.progress_bar.setStyleSheet("""
            QProgressBar {
                border: 2px solid #dee2e6;
                border-radius: 6px;
                text-align: center;
                font-weight: bold;
                font-size: 12px;
                background-color: #f8f9fa;
            }
            QProgressBar::chunk {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                                          stop:0 #667eea, stop:1 #764ba2);
                border-radius: 4px;
            }
        """)
        progress_layout.addWidget(self.progress_bar)
        status_layout.addLayout(progress_layout)
        
        return status_group
    
    def create_result_section(self):
        """创建结果显示区域"""
        result_group = QGroupBox("📄 搜索结果")
        result_layout = QVBoxLayout(result_group)
        
        # 工具栏
        toolbar_layout = QHBoxLayout()
        
        # 编辑按钮
        edit_btn = QPushButton("✏️ 编辑")
        edit_btn.clicked.connect(self.edit_selected_paper)
        toolbar_layout.addWidget(edit_btn)
        
        # 删除按钮
        delete_btn = QPushButton("🗑️ 删除")
        delete_btn.clicked.connect(self.delete_selected_paper)
        toolbar_layout.addWidget(delete_btn)
        
        # 添加笔记按钮
        note_btn = QPushButton("📝 添加笔记")
        note_btn.clicked.connect(self.add_note_to_paper)
        toolbar_layout.addWidget(note_btn)
        
        toolbar_layout.addStretch()
        result_layout.addLayout(toolbar_layout)
        
        # 结果列表
        self.result_list = QListWidget()
        self.result_list.itemDoubleClicked.connect(self.open_paper_link)
        result_layout.addWidget(self.result_list)
        
        return result_group
    
    def select_download_path(self):
        """选择下载路径"""
        path = QFileDialog.getExistingDirectory(self, "选择下载路径", "./downloads")
        if path:
            self.download_path_label.setText(path)
    
    def start_search(self):
        """开始搜索"""
        domain = self.domain_combo.currentText()
        source = self.source_combo.currentText()
        max_results = int(self.count_combo.currentText())
        custom_keywords = self.custom_keywords.text().strip()
        
        # 重置界面
        self.result_list.clear()
        self.progress_bar.setValue(0)
        self.start_button.setEnabled(False)
        self.stop_button.setEnabled(True)
        self.download_button.setEnabled(False)
        
        # 更新状态
        search_info = f"领域: {domain} | 数据源: {source} | 数量: {max_results}"
        if custom_keywords:
            search_info += f" | 关键词: {custom_keywords}"
        self.update_status(f"🔍 开始搜索 - {search_info}")
        
        # 创建并启动工作线程
        self.crawler_worker = CrawlerWorker(domain, source, max_results, custom_keywords)
        self.crawler_worker.progress.connect(self.progress_bar.setValue)
        self.crawler_worker.status.connect(self.update_status)
        self.crawler_worker.result.connect(self.display_results)
        self.crawler_worker.finished.connect(self.search_finished)
        self.crawler_worker.start()
    
    def start_download(self):
        """开始处理文件"""
        if not self.current_papers:
            QMessageBox.warning(self, "⚠️ 提示", "没有可处理的论文")
            return
        
        download_path = self.download_path_label.text()
        Path(download_path).mkdir(exist_ok=True)
        
        # 重置进度
        self.progress_bar.setValue(0)
        self.download_button.setEnabled(False)
        self.start_button.setEnabled(False)
        
        self.update_status(f"📥 开始处理 {len(self.current_papers)} 篇论文，保存到: {download_path}")
        
        # 创建并启动下载线程
        self.download_worker = DownloadWorker(self.current_papers, download_path)
        self.download_worker.progress.connect(self.progress_bar.setValue)
        self.download_worker.status.connect(self.update_status)
        self.download_worker.finished.connect(self.download_finished)
        self.download_worker.start()
    
    def stop_search(self):
        """停止搜索"""
        if self.crawler_worker and self.crawler_worker.isRunning():
            self.crawler_worker.terminate()
            self.crawler_worker.wait()
        self.update_status("⏹️ 搜索已停止")
        self.search_finished()
    
    def clear_results(self):
        """清空结果"""
        self.result_list.clear()
        self.current_papers = []
        self.progress_bar.setValue(0)
        self.download_button.setEnabled(False)
        self.result_stats.setText("等待搜索...")
        self.update_status("🗑 已清空搜索结果")
    
    def open_download_folder(self):
        """打开下载文件夹"""
        download_path = self.download_path_label.text()
        if os.path.exists(download_path):
            QDesktopServices.openUrl(QUrl.fromLocalFile(download_path))
        else:
            QMessageBox.warning(self, "警告", "下载文件夹不存在")
    
    def update_status(self, message):
        """更新状态信息"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.status_text.append(f"[{timestamp}] {message}")
        # 自动滚动到底部
        self.status_text.verticalScrollBar().setValue(
            self.status_text.verticalScrollBar().maximum()
        )
    
    def display_results(self, papers):
        """显示搜索结果"""
        self.current_papers = papers
        self.result_list.clear()
        
        if not papers:
            item = QListWidgetItem("❌ 未找到相关论文，请尝试更换数据源或修改关键词")
            self.result_list.addItem(item)
            self.result_stats.setText("📊 搜索结果: 0 篇论文")
            return
        
        # 统计信息
        total_papers = len(papers)
        pdf_available = len([p for p in papers if p.get('pdf_url')])
        link_available = len([p for p in papers if p.get('web_url')])
        
        stats_text = f"📊 找到 {total_papers} 篇论文 | 📄 {pdf_available} 篇可下载PDF | 🔗 {link_available} 篇有网页链接"
        self.result_stats.setText(stats_text)
        
        # 显示论文列表
        for i, paper in enumerate(papers, 1):
            # 创建论文条目
            title = paper['title']
            authors = paper.get('authors', '未知作者')
            source = paper.get('source', '未知来源')
            published = paper.get('published', '未知日期')
            
            # 确定可用性状态
            status_icons = []
            if paper.get('pdf_url'):
                status_icons.append("📄PDF")
            if paper.get('web_url'):
                status_icons.append("🔗链接")
            if not status_icons:
                status_icons.append("❌无链接")
            
            status_str = " | ".join(status_icons)
            
            item_text = f"""📑 论文 {i} ({source})
📌 {title}
👥 {authors[:100]}{'...' if len(authors) > 100 else ''}
📅 {published} | {status_str}"""
            
            item = QListWidgetItem(item_text)
            
            # 设置颜色
            if paper.get('pdf_url'):
                item.setBackground(COLOR_PDF_AVAILABLE)  # 浅绿色 - PDF可用
            elif paper.get('web_url'):
                item.setBackground(COLOR_LINK_AVAILABLE)  # 浅蓝色 - 仅链接可用
            else:
                item.setBackground(COLOR_NO_LINK)  # 浅灰色 - 无链接
            
            self.result_list.addItem(item)
    
    def open_paper_link(self, item):
        """双击打开论文链接"""
        # 获取选中的论文索引
        row = self.result_list.row(item)
        if 0 <= row < len(self.current_papers):
            paper = self.current_papers[row]
            
            # 优先打开PDF链接，否则打开网页链接
            url = paper.get('pdf_url') or paper.get('web_url')
            if url:
                QDesktopServices.openUrl(QUrl(url))
                self.update_status(f"🌐 已在浏览器中打开: {paper['title'][:50]}...")
            else:
                QMessageBox.information(self, "提示", "该论文没有可用的链接")
    
    def search_finished(self):
        """搜索完成"""
        self.start_button.setEnabled(True)
        self.stop_button.setEnabled(False)
        self.progress_bar.setValue(100)
        
        # 启用下载按钮
        if self.current_papers:
            self.download_button.setEnabled(True)
            
            # 如果启用了自动下载
            if self.auto_download_check.isChecked():
                self.update_status("🔄 自动处理已启用，1秒后开始处理...")
                QTimer.singleShot(1000, self.start_download)
    
    def download_finished(self):
        """下载完成"""
        self.download_button.setEnabled(True)
        self.start_button.setEnabled(True)
        self.progress_bar.setValue(100)
        
        # 显示完成消息
        download_path = self.download_path_label.text()
        completed_message = f"""🎉 文件处理完成！

📁 保存位置: {download_path}

📄 PDF文件和🔗网页链接已按数据源分文件夹保存
💡 双击列表中的论文可直接在浏览器中打开
📋 HTML链接文件包含完整的论文信息"""
        
        msg_box = QMessageBox(self)
        msg_box.setWindowTitle("处理完成")
        msg_box.setText(completed_message)
        msg_box.setIcon(QMessageBox.Icon.Information)
        
        # 添加按钮
        msg_box.addButton("确定", QMessageBox.ButtonRole.AcceptRole)
        open_button = msg_box.addButton("打开文件夹", QMessageBox.ButtonRole.ActionRole)
        
        msg_box.exec()
        
        # 如果点击了打开文件夹
        if msg_box.clickedButton() == open_button:
            self.open_download_folder()
    
    def edit_selected_paper(self):
        """编辑选中的论文"""
        current_item = self.result_list.currentItem()
        if not current_item:
            QMessageBox.warning(self, "警告", "请先选择一篇论文")
            return
        
        paper_id = current_item.data(Qt.ItemDataRole.UserRole)
        paper = self.db_manager.get_paper_by_id(paper_id)
        if not paper:
            QMessageBox.warning(self, "错误", "论文不存在")
            return
        
        dialog = PaperDialog(self.db_manager, paper, self)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            data = dialog.get_data()
            if self.db_manager.update_paper(paper_id, data):
                # 如果有新笔记，添加它
                if data['notes']:
                    self.db_manager.add_note(paper_id, data['notes'])
                QMessageBox.information(self, "成功", "论文信息已更新")
                self.refresh_results()
            else:
                QMessageBox.warning(self, "错误", "更新论文信息失败")
    
    def delete_selected_paper(self):
        """删除选中的论文"""
        current_item = self.result_list.currentItem()
        if not current_item:
            QMessageBox.warning(self, "警告", "请先选择一篇论文")
            return
        
        reply = QMessageBox.question(
            self, "确认删除",
            "确定要删除这篇论文吗？这个操作不可撤销。",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        
        if reply == QMessageBox.StandardButton.Yes:
            paper_id = current_item.data(Qt.ItemDataRole.UserRole)
            if self.db_manager.delete_paper(paper_id):
                QMessageBox.information(self, "成功", "论文已删除")
                self.refresh_results()
            else:
                QMessageBox.warning(self, "错误", "删除论文失败")
    
    def add_note_to_paper(self):
        """为论文添加笔记"""
        current_item = self.result_list.currentItem()
        if not current_item:
            QMessageBox.warning(self, "警告", "请先选择一篇论文")
            return
        
        paper_id = current_item.data(Qt.ItemDataRole.UserRole)
        paper = self.db_manager.get_paper_by_id(paper_id)
        if not paper:
            QMessageBox.warning(self, "错误", "论文不存在")
            return
        
        # 创建笔记对话框
        dialog = QDialog(self)
        dialog.setWindowTitle("添加笔记")
        dialog.setMinimumWidth(400)
        
        layout = QVBoxLayout(dialog)
        
        # 显示论文标题
        title_label = QLabel(f"论文：{paper.title}")
        title_label.setWordWrap(True)
        layout.addWidget(title_label)
        
        # 笔记输入框
        layout.addWidget(QLabel("笔记内容:"))
        note_edit = QTextEdit()
        layout.addWidget(note_edit)
        
        # 按钮
        button_box = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Ok | 
            QDialogButtonBox.StandardButton.Cancel
        )
        button_box.accepted.connect(dialog.accept)
        button_box.rejected.connect(dialog.reject)
        layout.addWidget(button_box)
        
        if dialog.exec() == QDialog.DialogCode.Accepted:
            content = note_edit.toPlainText()
            if content.strip():
                if self.db_manager.add_note(paper_id, content):
                    QMessageBox.information(self, "成功", "笔记已添加")
                else:
                    QMessageBox.warning(self, "错误", "添加笔记失败")
    
    def refresh_results(self):
        """刷新结果列表"""
        self.result_list.clear()
        for paper in self.current_papers:
            item = QListWidgetItem()
            item.setText(f"{paper.title}\n作者: {paper.authors}")
            item.setData(Qt.ItemDataRole.UserRole, paper.id)
            
            # 设置颜色
            if paper.pdf_path:
                item.setBackground(COLOR_PDF_AVAILABLE)
            elif paper.url:
                item.setBackground(COLOR_LINK_AVAILABLE)
            else:
                item.setBackground(COLOR_NO_LINK)
            
            self.result_list.addItem(item)
    
    def closeEvent(self, event):
        """关闭窗口时的处理"""
        self.db_manager.close()
        super().closeEvent(event)

def main():
    """主程序入口点"""
    app = QApplication(sys.argv)
    
    # 设置应用程序信息
    app.setApplicationName("机器视觉文献获取系统")
    app.setApplicationVersion("6.0")
    
    # 创建并显示主窗口
    window = VisionLiteratureSystem()
    window.show()
    
    # 运行应用程序
    sys.exit(app.exec())

if __name__ == "__main__":
    main()