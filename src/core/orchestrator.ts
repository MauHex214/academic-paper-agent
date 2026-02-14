import { BaseAgent, AgentInput, AgentOutput, ExecutionResult } from './types';

export class AgentOrchestrator {
  private agents: Map<string, BaseAgent>;
  private executionHistory: ExecutionResult[];
  
  constructor() {
    this.agents = new Map();
    this.executionHistory = [];
  }
  
  registerAgent(agent: BaseAgent): void {
    this.agents.set(agent.name, agent);
  }
  
  getAgent(name: string): BaseAgent | undefined {
    return this.agents.get(name);
  }
  
  async execute(agentName: string, input: AgentInput): Promise<AgentOutput> {
    const agent = this.agents.get(agentName);
    if (!agent) {
      return {
        type: 'error',
        content: `Agent ${agentName} not found`,
        status: 'error'
      };
    }
    
    const startTime = Date.now();
    try {
      const prepared = await agent.prepare(input);
      const output = await agent.run(prepared);
      const result = await agent.postProcess(output);
      
      const execution: ExecutionResult = {
        agent: agentName,
        input,
        output: { type: 'success', content: result, status: 'success' },
        timestamp: new Date(),
        duration: Date.now() - startTime
      };
      
      this.executionHistory.push(execution);
      
      return { type: 'success', content: result, status: 'success' };
    } catch (error) {
      return {
        type: 'error',
        content: error instanceof Error ? error.message : String(error),
        status: 'error'
      };
    }
  }
  
  getHistory(): ExecutionResult[] {
    return this.executionHistory;
  }
  
  clearHistory(): void {
    this.executionHistory = [];
  }
}
