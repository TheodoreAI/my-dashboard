<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>{{ isLogin ? 'Login' : 'Register' }}</h2>
      
      <form @submit.prevent="handleSubmit">
        <div v-if="!isLogin" class="form-group">
          <label for="firstName">First Name:</label>
          <input 
            id="firstName" 
            v-model="form.first_name" 
            type="text" 
            :required="!isLogin"
          />
        </div>
        
        <div v-if="!isLogin" class="form-group">
          <label for="lastName">Last Name:</label>
          <input 
            id="lastName" 
            v-model="form.last_name" 
            type="text" 
            :required="!isLogin"
          />
        </div>
        
        <div v-if="!isLogin" class="form-group">
          <label for="email">Email:</label>
          <input 
            id="email" 
            v-model="form.email" 
            type="email" 
            :required="!isLogin"
          />
        </div>
        
        <div class="form-group">
          <label for="username">Username:</label>
          <input 
            id="username" 
            v-model="form.username" 
            type="text" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password:</label>
          <input 
            id="password" 
            v-model="form.password" 
            type="password" 
            required
          />
        </div>
        
        <div class="form-buttons">
          <button type="submit" :disabled="loading">
            {{ loading ? 'Processing...' : (isLogin ? 'Login' : 'Register') }}
          </button>
        </div>
      </form>
      
      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>
      
      <div class="auth-switch">
        <button type="button" @click="toggleMode" class="link-button">
          {{ isLogin ? 'Need an account? Register' : 'Have an account? Login' }}
        </button>
      </div>
      
      <div class="demo-credentials">
        <h4>Demo Credentials:</h4>
        <p><strong>Username:</strong> admin</p>
        <p><strong>Password:</strong> admin123</p>
        <button @click="fillDemoCredentials" class="demo-button">Use Demo Account</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useAuth } from '../services/auth.js'

export default {
  name: 'AuthComponent',
  emits: ['login-success'],
  setup(props, { emit }) {
    const { login, register } = useAuth()
    
    const isLogin = ref(true)
    const loading = ref(false)
    const message = ref('')
    const messageType = ref('')
    
    const form = ref({
      username: '',
      password: '',
      email: '',
      first_name: '',
      last_name: ''
    })
    
    const resetForm = () => {
      form.value = {
        username: '',
        password: '',
        email: '',
        first_name: '',
        last_name: ''
      }
    }
    
    const toggleMode = () => {
      isLogin.value = !isLogin.value
      message.value = ''
      resetForm()
    }
    
    const fillDemoCredentials = () => {
      form.value.username = 'admin'
      form.value.password = 'admin123'
    }
    
    const handleSubmit = async () => {
      loading.value = true
      message.value = ''
      
      try {
        let result
        
        if (isLogin.value) {
          result = await login(form.value.username, form.value.password)
        } else {
          result = await register(form.value)
        }
        
        if (result.success) {
          if (isLogin.value) {
            message.value = 'Login successful!'
            messageType.value = 'success'
            emit('login-success')
          } else {
            message.value = 'Registration successful! Please login.'
            messageType.value = 'success'
            isLogin.value = true
            resetForm()
          }
        } else {
          message.value = result.error
          messageType.value = 'error'
        }
      } catch (err) {
        message.value = 'An unexpected error occurred'
        messageType.value = 'error'
      } finally {
        loading.value = false
      }
    }
    
    return {
      isLogin,
      loading,
      message,
      messageType,
      form,
      toggleMode,
      fillDemoCredentials,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.auth-card h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-buttons {
  margin-bottom: 20px;
}

.form-buttons button {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.form-buttons button:hover:not(:disabled) {
  background-color: #0056b3;
}

.form-buttons button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.message {
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.auth-switch {
  text-align: center;
  margin-bottom: 20px;
}

.link-button {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
  font-size: 14px;
}

.link-button:hover {
  color: #0056b3;
}

.demo-credentials {
  border-top: 1px solid #eee;
  padding-top: 20px;
  text-align: center;
}

.demo-credentials h4 {
  margin-bottom: 10px;
  color: #666;
}

.demo-credentials p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}

.demo-button {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.demo-button:hover {
  background-color: #218838;
}
</style>
