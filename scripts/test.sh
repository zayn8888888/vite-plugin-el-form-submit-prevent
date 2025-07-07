#!/bin/bash

# 测试脚本
echo "🧪 开始运行测试..."

# 运行代码检查
echo "📝 运行代码检查..."
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ 代码检查失败"
  exit 1
fi

# 运行测试
echo "🔍 运行单元测试..."
npm run test:coverage
if [ $? -ne 0 ]; then
  echo "❌ 测试失败"
  exit 1
fi

echo "✅ 所有测试通过！"
echo "📊 测试覆盖率报告已生成在 coverage/ 目录"