const { execSync } = require('child_process');

console.log('🚀 Deploying latest build directly to Vercel Production...');

try {
  // 1. Create deployment to Vercel
  const deployOutput = execSync('npx vercel --temporary --yes', { encoding: 'utf-8' });
  console.log(deployOutput);

  // Extract deployment ID (e.g. dpl_xxx)
  const match = deployOutput.match(/dpl_[A-Za-z0-9]+/);
  if (match) {
    const deploymentId = match[0];
    console.log(`✅ Deployment ID: ${deploymentId}`);

    console.log('🔗 Binding production aliases eduvth.vercel.app & giao-vien-sky-line.vercel.app...');
    execSync(`npx vercel alias set ${deploymentId} eduvth.vercel.app`, { stdio: 'inherit' });
    execSync(`npx vercel alias set ${deploymentId} giao-vien-sky-line.vercel.app`, { stdio: 'inherit' });
    console.log('🎉 Production domains updated successfully!');
  } else {
    console.warn('⚠️ Could not parse deployment ID from output.');
  }
} catch (e) {
  console.error('❌ Deployment failed:', e.message);
  process.exit(1);
}
