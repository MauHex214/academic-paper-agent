import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const FEATURE_FILE = path.join(process.cwd(), 'feature_list.json');
const PROGRESS_FILE = path.join(process.cwd(), 'claude-progress.txt');

interface Feature {
  id: number;
  category: string;
  name: string;
  description: string;
  steps: string[];
  passes: boolean;
  priority: string;
}

interface VerificationResult {
  featureId: number;
  passed: boolean;
  feedback: string;
  issues: string[];
}

export function getCurrentFeature(): Feature | null {
  const data = JSON.parse(fs.readFileSync(FEATURE_FILE, 'utf-8'));
  const pending = data.features.filter((f: Feature) => !f.passes && f.priority === 'high');
  return pending.length > 0 ? pending[0] : null;
}

export function markFeatureComplete(featureId: number): void {
  const data = JSON.parse(fs.readFileSync(FEATURE_FILE, 'utf-8'));
  const feature = data.features.find((f: Feature) => f.id === featureId);
  if (feature) {
    feature.passes = true;
    data.completedFeatures = data.features.filter((f: Feature) => f.passes).length;
    fs.writeFileSync(FEATURE_FILE, JSON.stringify(data, null, 2));
    console.log(`✅ Feature ${featureId} marked as complete`);
  }
}

export function updateProgress(message: string): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const entry = `\n### ${timestamp}\n- ${message}\n`;
  fs.appendFileSync(PROGRESS_FILE, entry);
}

export async function runVerification(feature: Feature): Promise<VerificationResult> {
  console.log(`\n🔍 开始验收: ${feature.name}`);
  console.log(`   描述: ${feature.description}`);
  console.log(`   步骤: ${feature.steps.join(' → ')}\n`);
  
  console.log('='.repeat(50));
  console.log('⚠️  请在新的对话/窗口中进行验收');
  console.log('='.repeat(50));
  console.log(`
验收步骤：
1. 打开新的 OpenCode 对话窗口
2. 将项目目录设置为: /Users/w.../OpenCode
3. 使用验证 prompt 进行验收
4. 验收通过后，回到当前窗口执行状态更新

验证 prompt 模板：
---
请验证功能 #${feature.id}: ${feature.name}

功能描述：${feature.description}

验收标准：
${feature.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

请逐一检查每个步骤是否完成，并给出验证结果。
---
`);
  
  return {
    featureId: feature.id,
    passed: false,
    feedback: '等待验收完成',
    issues: []
  };
}

if (require.main === module) {
  const feature = getCurrentFeature();
  if (feature) {
    runVerification(feature);
  } else {
    console.log('✅ 所有功能已完成！');
  }
}
