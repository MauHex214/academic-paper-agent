import fs from 'fs';
import path from 'path';

const FEATURE_FILE = path.join(process.cwd(), 'feature_list.json');

export interface Feature {
  id: number;
  category: string;
  name: string;
  description: string;
  steps: string[];
  passes: boolean;
  priority: string;
}

export function getCurrentFeature(): Feature | null {
  const data = JSON.parse(fs.readFileSync(FEATURE_FILE, 'utf-8'));
  const pending = data.features.filter((f: Feature) => !f.passes && f.priority === 'high');
  return pending.length > 0 ? pending[0] : null;
}

export function generateVerificationPrompt(feature: Feature): string {
  return `请验证功能 #${feature.id}: ${feature.name}

功能描述：${feature.description}

验收标准：
${feature.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

请逐一检查每个步骤是否完成，并给出验证结果。

重要：
1. 必须实际检查代码/文件来验证，不能仅凭描述
2. 如果发现问题，明确列出哪些步骤未完成
3. 验证完成后，如果全部通过，必须更新 feature_list.json 中该功能的 passes 为 true
4. 最后说 "验收通过" 或 "验收未通过：原因..."`;
}

export function markFeatureComplete(featureId: number): void {
  const data = JSON.parse(fs.readFileSync(FEATURE_FILE, 'utf-8'));
  const feature = data.features.find((f: Feature) => f.id === featureId);
  if (feature) {
    feature.passes = true;
    data.completedFeatures = data.features.filter((f: Feature) => f.passes).length;
    fs.writeFileSync(FEATURE_FILE, JSON.stringify(data, null, 2));
  }
}

export function isFeatureComplete(featureId: number): boolean {
  const data = JSON.parse(fs.readFileSync(FEATURE_FILE, 'utf-8'));
  const feature = data.features.find((f: Feature) => f.id === featureId);
  return feature?.passes === true;
}

if (require.main === module) {
  const feature = getCurrentFeature();
  if (feature) {
    console.log(`\n当前任务: #${feature.id} ${feature.name}\n`);
    console.log(generateVerificationPrompt(feature));
  } else {
    console.log('✅ 所有功能已完成！');
  }
}
