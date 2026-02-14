import { initializeSession, getRecommendedTask } from './utils/sessionManager';
import { completeFeature } from './utils/featureManager';

async function main() {
  console.log('='.repeat(50));
  console.log('🎓 学术论文写作助手');
  console.log('='.repeat(50));
  
  const context = await initializeSession();
  
  const task = getRecommendedTask();
  console.log(`\n📌 推荐任务: ${task}\n`);
  
  console.log('='.repeat(50));
  console.log('请告诉我你想做什么...');
}

main();
