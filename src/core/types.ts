/**
 * Agent 基类
 * 所有 Agent 继承此基类
 */
export abstract class BaseAgent {
  name: string;
  description: string;
  
  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }
  
  // 子类必须实现的执行方法
  abstract run(input: any): Promise<any>;
  
  // 可选的预处理方法
  async prepare(input: any): Promise<any> {
    return input;
  }
  
  // 可选的后处理方法
  async postProcess(output: any): Promise<any> {
    return output;
  }
}

/**
 * Agent 输入输出类型定义
 */
export interface AgentInput {
  type: string;
  content: any;
  metadata?: Record<string, any>;
}

export interface AgentOutput {
  type: string;
  content: any;
  status: 'success' | 'error' | 'partial';
  metadata?: Record<string, any>;
}

/**
 * Agent 执行结果
 */
export interface ExecutionResult {
  agent: string;
  input: AgentInput;
  output: AgentOutput;
  timestamp: Date;
  duration: number;
}
