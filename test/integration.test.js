import { describe, it, expect } from 'vitest'
import createAutoElFormPreventPlugin from '../index.js'

describe('集成测试', () => {
  it('应该正确处理真实的Vue组件代码', () => {
    const plugin = createAutoElFormPreventPlugin()
    
    const realVueCode = `
<template>
  <div class="login-form">
    <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="loginForm.password" placeholder="请输入密码"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleLogin">登录</el-button>
      </el-form-item>
    </el-form>
    
    <el-form @submit="customSubmit" :model="otherForm">
      <el-form-item>
        <el-input v-model="otherForm.value"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      otherForm: {
        value: ''
      }
    }
  }
}
</script>
    `
    
    const result = plugin.transform(realVueCode, 'LoginForm.vue')
    
    expect(result).not.toBeNull()
    expect(result.code).toContain('<el-form :model="loginForm" :rules="rules" ref="loginFormRef" @submit.native.prevent>')
    expect(result.code).toContain('<el-form @submit="customSubmit" :model="otherForm">')
  })

  it('应该在复杂项目结构中正确工作', () => {
    const plugin = createAutoElFormPreventPlugin({
      include: ['src/**/*.vue'],
      exclude: ['src/test/**/*.vue', '**/*.spec.vue']
    })
    
    const testCases = [
      { file: 'src/components/UserForm.vue', shouldProcess: true },
      { file: 'src/pages/Login.vue', shouldProcess: true },
      { file: 'src/test/UserForm.vue', shouldProcess: false },
      { file: 'src/components/UserForm.spec.vue', shouldProcess: false },
      { file: 'other/Form.vue', shouldProcess: false }
    ]
    
    const code = '<el-form :model="form">content</el-form>'
    
    testCases.forEach(({ file, shouldProcess }) => {
      const result = plugin.transform(code, file)
      
      if (shouldProcess) {
        expect(result).not.toBeNull()
        expect(result.code).toContain('@submit.native.prevent')
      } else {
        expect(result).toBeNull()
      }
    })
  })
})