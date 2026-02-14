import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PROGRESS_FILE = path.join(process.cwd(), 'claude-progress.txt');
const FEATURE_FILE = path.join(process.cwd(), 'feature_list.json');

export interface SessionContext {
  currentFeature: number | null;
  lastCommit: string;
  recentWork: string[];
}

export async function initializeSession(): Promise<SessionContext> {
  console.log('\n📋 初始化会话...\n');
  
  console.log('1. 检查当前目录...');
  console.log(`   工作目录: ${process.cwd()}`);
  
  console.log('\n2. 检查 Git 状态...');
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (status.trim()) {
      console.log('   ⚠️  有未提交的更改');
    } else {
      console.log('   ✅ 工作区干净');
    }
  } catch (e) {
    console.log('   ❌ Git 不可用');
  }
  
  console.log('\n3. 读取功能列表...');
  const featureData = JSON.parse(fs.readFileSync(FEATURE_FILE, 'utf-8'));
  const pending = featureData.features.filter((f: any) => !f.passes);
  console.log(`   待完成功能: ${pending.length}/${featureData.totalFeatures}`);
  const nextFeature = pending.find((f: any) => f.priority === 'high');
  if (nextFeature) {
    console.log(`   下一个任务: ${nextFeature.name}`);
  }
  
  console.log('\n4. 读取进度日志...');
  if (fs.existsSync(PROGRESS_FILE)) {
    const content = fs.readFileSync(PROGRESS_FILE, 'utf-8');
    const sessions = content.match(/### \d{4}-\d{2}-\d{2}/g);
    if (sessions) {
      console.log(`   历史会话: ${sessions.length} 个`);
    }
  }
  
  console.log('\n5. 检查数据库...');
  const dbPath = path.join(process.cwd(), 'data/academic-agent.db');
  if (fs.existsSync(dbPath)) {
    console.log('   ✅ 数据库存在');
  } else {
    console.log('   ⚠️  数据库不存在，需要初始化');
  }
  
  return {
    currentFeature: nextFeature?.id || null,
    lastCommit: '',
    recentWork: []
  };
}

export function getRecommendedTask(): string {
  try {
    const featureData = JSON.parse(fs.readFileSync(FEATURE_FILE, 'utf-8'));
    const pending = featureData.features.filter((f: any) => !f.passes);
    const highPriority = pending.find((f: any) => f.priority === 'high');
    
    if (highPriority) {
      return `实现功能 #${highPriority.id}: ${highPriority.name}`;
    }
    
    if (pending.length > 0) {
      return `实现功能 #${pending[0].id}: ${pending[0].name}`;
    }
    
    return '所有功能已完成！🎉';
  } catch (e) {
    return '无法读取功能列表';
  }
}
