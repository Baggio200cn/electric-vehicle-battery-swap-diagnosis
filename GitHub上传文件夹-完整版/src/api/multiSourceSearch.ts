// 多源学术搜索服务
import { arxivService, ArxivPaper, SearchResult } from './arxivService';

export interface SearchSource {
  name: string;
  description: string;
  searchFunction: (query: string, maxResults: number) => Promise<SearchResult[]>;
  isRelevant: (query: string) => boolean;
}

export interface SearchAttempt {
  source: string;
  success: boolean;
  resultCount: number;
  relevanceScore: number;
  message: string;
}

class MultiSourceSearchService {
  private sources: SearchSource[] = [];

  constructor() {
    this.initializeSources();
  }

  private initializeSources() {
    // arXiv 源 - 适用于计算机科学、AI、机器学习
    this.sources.push({
      name: 'arXiv',
      description: '计算机科学、物理学、数学预印本论文库',
      searchFunction: async (query: string, maxResults: number) => {
        const papers = await arxivService.searchPapers(query, maxResults);
        return arxivService.convertToSearchResults(papers);
      },
      isRelevant: (query: string) => {
        const csKeywords = ['机器视觉', '深度学习', '神经网络', '人工智能', '图像处理', '算法', '计算机'];
        return csKeywords.some(keyword => query.includes(keyword));
      }
    });

    // CrossRef 源 - 广泛的学术文献
    this.sources.push({
      name: 'CrossRef',
      description: '跨学科学术文献检索',
      searchFunction: this.searchCrossRef.bind(this),
      isRelevant: () => true // CrossRef 覆盖所有学科
    });

    // IEEE Xplore 模拟源 - 电气工程
    this.sources.push({
      name: 'IEEE Xplore',
      description: '电气工程、电子工程专业文献',
      searchFunction: this.searchIEEE.bind(this),
      isRelevant: (query: string) => {
        const eeKeywords = ['电气', '电力', '配电', '电网', '电子', '控制', '自动化', '传感器'];
        return eeKeywords.some(keyword => query.includes(keyword));
      }
    });

    // Google Scholar 模拟源 - 综合学术搜索
    this.sources.push({
      name: 'Google Scholar',
      description: '综合学术搜索引擎',
      searchFunction: this.searchGoogleScholar.bind(this),
      isRelevant: () => true // Google Scholar 覆盖所有领域
    });
  }

  async searchMultipleSources(query: string, maxResults: number = 8): Promise<{
    results: SearchResult[];
    attempts: SearchAttempt[];
    finalSource: string;
    recommendedSources: string[];
  }> {
    const attempts: SearchAttempt[] = [];
    let finalResults: SearchResult[] = [];
    let finalSource = '';

    // 按相关性排序搜索源
    const sortedSources = this.sources.sort((a, b) => {
      const aRelevant = a.isRelevant(query) ? 1 : 0;
      const bRelevant = b.isRelevant(query) ? 1 : 0;
      return bRelevant - aRelevant;
    });

    console.log(`开始多源搜索: "${query}"`);

    for (const source of sortedSources) {
      try {
        console.log(`尝试 ${source.name}...`);
        
        const results = await source.searchFunction(query, maxResults);
        const relevanceScore = this.calculateRelevanceScore(query, results);
        
        attempts.push({
          source: source.name,
          success: true,
          resultCount: results.length,
          relevanceScore,
          message: `找到 ${results.length} 个结果，相关性评分: ${relevanceScore.toFixed(2)}`
        });

        // 如果找到了相关性较高的结果，就使用这个源
        if (results.length > 0 && relevanceScore >= 0.3) {
          finalResults = results;
          finalSource = source.name;
          console.log(`${source.name} 返回了相关结果，停止搜索`);
          break;
        }

      } catch (error) {
        console.error(`${source.name} 搜索失败:`, error);
        attempts.push({
          source: source.name,
          success: false,
          resultCount: 0,
          relevanceScore: 0,
          message: `搜索失败: ${error instanceof Error ? error.message : '未知错误'}`
        });
      }
    }

    // 如果所有源都没有找到好结果，返回最后一个有结果的源
    if (finalResults.length === 0) {
      const lastSuccessfulAttempt = attempts.find(a => a.success && a.resultCount > 0);
      if (lastSuccessfulAttempt) {
        const lastSource = sortedSources.find(s => s.name === lastSuccessfulAttempt.source);
        if (lastSource) {
          finalResults = await lastSource.searchFunction(query, maxResults);
          finalSource = lastSource.name;
        }
      }
    }

    // 生成推荐的其他搜索源
    const recommendedSources = this.getRecommendedSources(query);

    return {
      results: finalResults,
      attempts,
      finalSource,
      recommendedSources
    };
  }

  private calculateRelevanceScore(query: string, results: SearchResult[]): number {
    if (results.length === 0) return 0;

    const queryWords = query.toLowerCase().split(/\s+/);
    let totalScore = 0;

    results.forEach(result => {
      const titleWords = result.title.toLowerCase().split(/\s+/);
      const contentWords = result.content.toLowerCase().split(/\s+/);
      
      let matchCount = 0;
      queryWords.forEach(qWord => {
        if (titleWords.some(tWord => tWord.includes(qWord)) || 
            contentWords.some(cWord => cWord.includes(qWord))) {
          matchCount++;
        }
      });
      
      totalScore += matchCount / queryWords.length;
    });

    return totalScore / results.length;
  }

  private getRecommendedSources(query: string): string[] {
    const recommendations: string[] = [];
    
    if (query.includes('电力') || query.includes('电气') || query.includes('配电')) {
      recommendations.push('IEEE Xplore (电气工程专业)', 'ScienceDirect (工程技术)', '中国知网 (中文文献)');
    }
    
    if (query.includes('机械') || query.includes('设备')) {
      recommendations.push('ASME Digital Collection (机械工程)', 'SpringerLink (工程技术)');
    }
    
    if (query.includes('医学') || query.includes('生物')) {
      recommendations.push('PubMed (医学文献)', 'Nature (生物医学)');
    }
    
    // 通用推荐
    recommendations.push('Google Scholar (综合搜索)', 'ResearchGate (研究网络)', 'CNKI (中文学术)');
    
    return [...new Set(recommendations)]; // 去重
  }

  // CrossRef API 搜索 (模拟实现)
  private async searchCrossRef(query: string, maxResults: number): Promise<SearchResult[]> {
    // 模拟 CrossRef API 调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (query.includes('电') || query.includes('配电') || query.includes('故障')) {
      return [
        {
          title: `电力系统故障诊断与处理方法研究进展`,
          url: `https://doi.org/10.1016/j.epsr.2024.example`,
          content: `综述了电力系统故障诊断的最新研究进展。内容包括：1. 传统故障诊断方法 - 基于电气量分析的故障定位技术 2. 智能诊断方法 - 机器学习在故障识别中的应用 3. 实时监测技术 - 在线监测系统的发展趋势 4. 工程应用案例 - 典型故障处理实例分析。为电力工程师提供了实用的技术参考。`,
          type: 'ScienceDirect 期刊',
          authors: '李电力, 王故障, 张诊断',
          publishedDate: new Date().toISOString()
        },
        {
          title: `智能配电网故障自愈技术及其应用`,
          url: `https://doi.org/10.1109/TPWRS.2024.example`,
          content: `探讨了智能配电网的故障自愈技术。主要内容：1. 自愈系统架构 - 分层分布式控制架构设计 2. 故障检测算法 - 多源信息融合的故障识别 3. 隔离与恢复策略 - 最优恢复路径算法 4. 现场试验结果 - 某市配电网试点项目分析。该技术可显著提高配电网可靠性。`,
          type: 'IEEE Transactions',
          authors: '赵智能, 孙配电, 周自愈',
          publishedDate: new Date(Date.now() - 86400000).toISOString()
        }
      ];
    }
    
    return [];
  }

  // IEEE Xplore 搜索 (模拟实现)
  private async searchIEEE(query: string, maxResults: number): Promise<SearchResult[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (query.includes('电') || query.includes('配电') || query.includes('控制')) {
      return [
        {
          title: `Advanced Fault Detection in Electric Vehicle Charging Infrastructure`,
          url: `https://ieeexplore.ieee.org/document/example1`,
          content: `本文提出了一种用于电动汽车充电基础设施的高级故障检测方法。技术特点：1. 多层次故障检测 - 从设备级到系统级的综合监测 2. 机器学习集成 - 基于深度神经网络的异常检测 3. 实时处理能力 - 毫秒级故障响应时间 4. 现场验证 - 在多个充电站的实际部署结果。`,
          type: 'IEEE Conference',
          authors: 'Zhang Wei, Li Ming, Wang Electrical',
          publishedDate: new Date(Date.now() - 172800000).toISOString()
        }
      ];
    }
    
    return [];
  }

  // Google Scholar 搜索 (模拟实现)
  private async searchGoogleScholar(query: string, maxResults: number): Promise<SearchResult[]> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return [
      {
        title: `${query}相关研究综述与发展趋势`,
        url: `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`,
        content: `通过Google Scholar搜索到的相关文献综述。建议直接访问Google Scholar进行更详细的搜索，以获取最全面的学术资源。Google Scholar收录了来自各个学科的学术论文、学位论文、书籍、会议论文、技术报告等多种类型的学术文献。`,
        type: 'Google Scholar',
        authors: '综合学术搜索',
        publishedDate: new Date().toISOString()
      }
    ];
  }
}

export const multiSourceSearchService = new MultiSourceSearchService(); 