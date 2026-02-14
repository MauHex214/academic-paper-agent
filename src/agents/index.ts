import { BaseAgent, AgentInput, AgentOutput } from './types';

export class WorkAnalyzer extends BaseAgent {
  constructor() {
    super('WorkAnalyzer', '理解用户工作内容，提取关键信息');
  }
  
  async run(input: AgentInput): Promise<any> {
    const { content, metadata } = input;
    
    // 提取工作描述中的关键信息
    const summary = {
      title: this.extractTitle(content),
      type: this.detectWorkType(content),
      keyPoints: this.extractKeyPoints(content),
      methodology: this.extractMethodology(content),
      results: this.extractResults(content),
      targetJournals: metadata?.preferredJournals || []
    };
    
    return {
      summary,
      suggestions: this.suggestJournals(summary)
    };
  }
  
  private extractTitle(content: string): string {
    return content.split('\n')[0] || 'Untitled';
  }
  
  private detectWorkType(content: string): string {
    const types = ['算法', '实验', '理论', '综述', '应用'];
    for (const t of types) {
      if (content.includes(t)) return t;
    }
    return 'unknown';
  }
  
  private extractKeyPoints(content: string): string[] {
    return content.split(/[。！？\n]/).filter(s => s.length > 10).slice(0, 5);
  }
  
  private extractMethodology(content: string): string {
    return '待提取';
  }
  
  private extractResults(content: string): string {
    return '待提取';
  }
  
  private suggestJournals(summary: any): string[] {
    return ['期刊A', '期刊B', '期刊C'];
  }
}

export class StyleAnalyzer extends BaseAgent {
  constructor() {
    super('StyleAnalyzer', '分析目标期刊的写作风格');
  }
  
  async run(input: AgentInput): Promise<any> {
    const { content } = input;
    
    return {
      abstract: { style: '简洁', length: '200-300词' },
      introduction: { style: '背景充分', length: '2-3页' },
      method: { style: '详细', length: '3-4页' },
      results: { style: '图表丰富', length: '4-5页' },
      discussion: { style: '深入', length: '2-3页' }
    };
  }
}

export class WorkloadEstimator extends BaseAgent {
  constructor() {
    super('WorkloadEstimator', '评估完成论文所需工作量');
  }
  
  async run(input: AgentInput): Promise<any> {
    return {
      estimatedHours: 40,
      complexity: 'medium',
      sections: {
        abstract: 2,
        introduction: 8,
        method: 10,
        results: 12,
        discussion: 8
      }
    };
  }
}

export class GapAnalyzer extends BaseAgent {
  constructor() {
    super('GapAnalyzer', '评估差距并给出优化建议');
  }
  
  async run(input: AgentInput): Promise<any> {
    return {
      gaps: ['实验数据不足', '文献综述不够全面'],
      suggestions: [
        '补充更多实验数据',
        '增加相关文献引用',
        '完善方法论描述'
      ]
    };
  }
}

export class PaperDrafter extends BaseAgent {
  constructor() {
    super('PaperDrafter', '起草学术论文');
  }
  
  async run(input: AgentInput): Promise<any> {
    const { content } = input;
    
    return {
      abstract: 'draft abstract...',
      introduction: 'draft introduction...',
      method: 'draft method...',
      results: 'draft results...',
      discussion: 'draft discussion...'
    };
  }
}
