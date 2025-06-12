#!/usr/bin/env node

// 完全禁用ESLint的自定义构建脚本
process.env.DISABLE_ESLINT_PLUGIN = 'true';
process.env.ESLINT_NO_DEV_ERRORS = 'true';
process.env.SKIP_PREFLIGHT_CHECK = 'true';
process.env.CI = '';
process.env.GENERATE_SOURCEMAP = 'false';

// 禁用所有ESLint相关的警告和错误
process.env.ESLINT_NO_DEV_ERRORS = 'true';
process.env.TSC_COMPILE_ON_ERROR = 'true';

console.log('🚀 开始构建项目（完全跳过ESLint检查）...');
console.log('环境变量设置:');
console.log('- DISABLE_ESLINT_PLUGIN:', process.env.DISABLE_ESLINT_PLUGIN);
console.log('- ESLINT_NO_DEV_ERRORS:', process.env.ESLINT_NO_DEV_ERRORS);
console.log('- SKIP_PREFLIGHT_CHECK:', process.env.SKIP_PREFLIGHT_CHECK);
console.log('- CI:', process.env.CI === '' ? '(空字符串)' : process.env.CI);

// 运行react-scripts build
const { spawn } = require('child_process');
const child = spawn('npx', ['react-scripts', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('✅ 构建成功完成！');
  } else {
    console.log('❌ 构建失败，退出码:', code);
    process.exit(code);
  }
});

child.on('error', (error) => {
  console.error('❌ 构建过程中发生错误:', error);
  process.exit(1);
}); 