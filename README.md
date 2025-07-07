# vite-plugin-el-form-submit-prevent

一个自动为 Element UI 的`<el-form>`标签添加表单提交阻止事
件的 Vite 插件。

## 🎯  核心功能

自动为 Element UI 的`<el-form>`标签添加`@submit.
native.prevent`属性，防止表单默认提交行为。

## 📦  安装

```bash
npm install vite-plugin-el-form-submit-prevent --save-dev
```

或者使用 yarn：

```
yarn add vite-plugin-el-form-submit-prevent --dev

```

## 🚀 使用方法

### 基础用法

在你的 vite.config.js 中添加插件：

```
import { defineConfig } from 'vite'
import createAutoElFormPreventPlugin from 
'vite-plugin-el-form-submit-prevent'

export default defineConfig({
  plugins: [
    createAutoElFormPreventPlugin()
  ]
})
```

### 高级配置

```
import { defineConfig } from 'vite'
import createAutoElFormPreventPlugin from 
'vite-plugin-el-form-submit-prevent'

export default defineConfig({
  plugins: [
    createAutoElFormPreventPlugin({
      // 只处理src目录下的vue文件
      include: ['src/**/*.vue'],
      // 排除测试文件和demo文件
      exclude: ['**/*.test.vue', '**/test/**/*.
      vue', '**/demo/**/*.vue'],
      // 启用插件（默认为true）
      enabled: true
    })
  ]
})
```

### 使用自定义过滤函数

```
import { defineConfig } from 'vite'
import createAutoElFormPreventPlugin from 
'vite-plugin-el-form-submit-prevent'

export default defineConfig({
  plugins: [
    createAutoElFormPreventPlugin({
      // 自定义文件过滤逻辑
      filter: (id) => {
        return id.includes('src/components') && 
        !id.includes('test')
      }
    })
  ]
})
```

## 📋 功能说明

1. 目标文件筛选 ：只处理 .vue 文件
2. 智能检测 ：扫描代码中的 <el-form> 标签
3. 自动增强 ：为没有 @submit 属性的 <el-form> 标签自动添加 @submit.native.prevent
4. 避免重复 ：如果标签已经有 @submit 属性，则跳过处理

## 🔧 工作原理

- 使用正则表达式匹配 el-form 标签
- 在构建时自动转换代码，无需手动修改每个表单
- 执行顺序设为 pre ，确保在其他插件之前处理

## 💡 使用场景

主要用于防止表单的默认提交行为，避免页面刷新，这在单页应用（SPA）中非常重要。

## 📝 转换示例

转换前：

```
<el-form :model="form">
  <!-- 表单内容 -->
</el-form>
```

转换后：

```
<el-form :model="form" @submit.native.prevent>
  <!-- 表单内容 -->
</el-form>
```

## 🔗 兼容性

- Node.js >= 14.0.0
- Vite >= 2.0.0
- Vue 2.x / 3.x
- Element UI / Element Plus

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
