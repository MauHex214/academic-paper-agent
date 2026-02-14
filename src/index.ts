import { initializeSession, getRecommendedTask } from './utils/sessionManager';
import { getCurrentFeature, generateVerificationPrompt, isFeatureComplete } from './utils/autoVerifier';

async function main() {
  console.log('='.repeat(50));
  console.log('🎓 学术论文写作助手 - 自动化开发循环');
  console.log('='.repeat(50));
  
  const context = await initializeSession();
  
  const task = getRecommendedTask();
  console.log(`\n📌 推荐任务: ${task}\n`);
  
  const feature = getCurrentFeature();
  if (feature) {
    console.log('\n🔄 自动化流程已就绪');
    console.log('完成功能后，告诉我"请求验收"将自动调用验证 Agent');
  } else {
    console.log('\n✅ 所有功能已完成！');
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('请告诉我你想做什么...');
}

main();
