# 前端用户认证系统使用指南

## 概述

本系统提供了完整的用户认证界面，包括用户注册、登录、个人信息展示等功能。采用 React + Bootstrap 构建，提供良好的用户体验。

## 组件结构

```
frontend/src/
├── App.js                    # 主应用组件
├── components/
│   ├── Login.js             # 登录组件
│   └── Register.js          # 注册组件
├── config.js                # API配置
├── styles/
│   └── index.css            # 全局样式
└── index.js                 # 入口文件
```

## 组件说明

### 1. App.js - 主应用组件

主应用组件负责：
- 管理全局状态（登录状态、当前用户信息）
- 路由控制（首页、登录页、注册页）
- 导航栏渲染
- Token管理和验证

**主要状态**:
```javascript
const [currentView, setCurrentView] = useState('home');  // 当前视图
const [isLoggedIn, setIsLoggedIn] = useState(false);     // 登录状态
const [currentUser, setCurrentUser] = useState(null);    // 当前用户信息
```

### 2. Login.js - 登录组件

提供用户登录界面。

**Props**:
- `onLoginSuccess`: 登录成功的回调函数
- `onSwitchToRegister`: 切换到注册页面的回调函数

**功能**:
- 用户名和密码输入
- 表单验证
- 错误提示
- 加载状态显示
- 自动保存token到localStorage

**使用示例**:
```jsx
<Login 
  onLoginSuccess={handleLoginSuccess}
  onSwitchToRegister={() => setCurrentView('register')}
/>
```

### 3. Register.js - 注册组件

提供用户注册界面。

**Props**:
- `onRegisterSuccess`: 注册成功的回调函数
- `onSwitchToLogin`: 切换到登录页面的回调函数

**功能**:
- 用户名、邮箱、密码输入
- 密码确认
- 表单验证（客户端验证）
- 错误提示
- 加载状态显示

**验证规则**:
- 用户名: 至少3个字符
- 邮箱: 有效的邮箱格式
- 密码: 至少6个字符
- 确认密码: 与密码一致

**使用示例**:
```jsx
<Register 
  onRegisterSuccess={handleRegisterSuccess}
  onSwitchToLogin={() => setCurrentView('login')}
/>
```

## API集成

### 配置文件 (config.js)

```javascript
export const API_BASE_URL = 'http://localhost:8000';
export const TOKEN_KEY = 'token';

export const getAuthHeader = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};
```

### API调用示例

#### 注册

```javascript
const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
  username: formData.username,
  email: formData.email,
  password: formData.password
});
```

#### 登录

```javascript
const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
  username: formData.username,
  password: formData.password
});

// 保存token
localStorage.setItem('token', response.data.access_token);
```

#### 获取用户信息

```javascript
const token = localStorage.getItem('token');
const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 状态管理

### Token管理

Token存储在浏览器的localStorage中：

```javascript
// 保存token
localStorage.setItem('token', access_token);

// 读取token
const token = localStorage.getItem('token');

// 删除token（登出）
localStorage.removeItem('token');
```

### 用户登录流程

1. 用户在登录页输入用户名和密码
2. 点击登录按钮
3. 发送登录请求到后端API
4. 后端验证成功，返回JWT token
5. 前端保存token到localStorage
6. 使用token获取用户信息
7. 更新登录状态，显示用户信息
8. 跳转到首页

```javascript
const handleLoginSuccess = (token) => {
  fetchCurrentUser(token);
};

const fetchCurrentUser = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setCurrentUser(response.data);
    setIsLoggedIn(true);
    setCurrentView('home');
  } catch (err) {
    console.error('获取用户信息失败:', err);
    localStorage.removeItem('token');
  }
};
```

### 用户注册流程

1. 用户在注册页填写信息
2. 客户端验证表单数据
3. 发送注册请求到后端API
4. 后端创建用户并返回用户信息
5. 显示成功消息
6. 自动跳转到登录页

```javascript
const handleRegisterSuccess = (userData) => {
  setMessage(`注册成功！欢迎 ${userData.username}，请登录`);
  setCurrentView('login');
  setTimeout(() => setMessage(''), 3000);
};
```

### 用户登出流程

1. 用户点击登出按钮
2. 删除localStorage中的token
3. 清除用户状态
4. 跳转到首页

```javascript
const handleLogout = () => {
  localStorage.removeItem('token');
  setIsLoggedIn(false);
  setCurrentUser(null);
  setCurrentView('home');
};
```

## 样式定制

### 主题色

默认使用Bootstrap的主题色：
- Primary（主色）: #0d6efd（蓝色）
- Success（成功）: #198754（绿色）
- Danger（危险）: #dc3545（红色）
- Info（信息）: #0dcaf0（浅蓝色）

### 自定义样式

在 `styles/index.css` 中添加自定义样式：

```css
/* 登录卡片样式 */
.login-card {
  max-width: 500px;
  margin: 2rem auto;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 注册卡片样式 */
.register-card {
  max-width: 500px;
  margin: 2rem auto;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

### 响应式设计

针对移动设备的优化：

```css
@media (max-width: 768px) {
  .login-card, .register-card {
    margin: 1rem;
  }
  
  .card-body {
    padding: 1.5rem;
  }
}
```

## 错误处理

### 网络错误

```javascript
try {
  const response = await axios.post(url, data);
  // 处理响应
} catch (err) {
  if (err.response) {
    // 服务器返回错误响应
    setError(err.response.data.detail || '操作失败');
  } else {
    // 网络错误或后端服务未启动
    setError('网络错误，请检查后端服务是否启动');
  }
}
```

### 表单验证错误

```javascript
const validateForm = () => {
  if (formData.username.length < 3) {
    setError('用户名至少需要3个字符');
    return false;
  }
  if (formData.password.length < 6) {
    setError('密码至少需要6个字符');
    return false;
  }
  if (formData.password !== formData.confirmPassword) {
    setError('两次输入的密码不一致');
    return false;
  }
  return true;
};
```

### Token过期处理

当token过期时，自动清除登录状态：

```javascript
const fetchCurrentUser = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setCurrentUser(response.data);
    setIsLoggedIn(true);
  } catch (err) {
    // Token无效或过期
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setCurrentUser(null);
  }
};
```

## 用户体验优化

### 加载状态

显示加载动画，提升用户体验：

```jsx
<Button disabled={loading}>
  {loading ? (
    <>
      <Spinner animation="border" size="sm" className="me-2" />
      登录中...
    </>
  ) : (
    '登录'
  )}
</Button>
```

### 消息提示

使用Alert组件显示成功或错误消息：

```jsx
{message && (
  <Alert variant="success" dismissible onClose={() => setMessage('')}>
    {message}
  </Alert>
)}

{error && (
  <Alert variant="danger" dismissible onClose={() => setError('')}>
    {error}
  </Alert>
)}
```

### 自动消息消失

```javascript
setMessage('操作成功');
setTimeout(() => setMessage(''), 3000);  // 3秒后自动消失
```

## 安全最佳实践

### 1. Token存储

- ✅ 使用 localStorage 存储token（适用于单页应用）
- ❌ 不要在Cookie中存储token（除非使用HttpOnly）
- ❌ 不要在URL参数中传递token

### 2. HTTPS

生产环境必须使用HTTPS：
- 防止token被截获
- 防止中间人攻击

### 3. XSS防护

- React默认转义所有输出，防止XSS攻击
- 不要使用 `dangerouslySetInnerHTML`

### 4. CSRF防护

- 使用JWT token可以避免CSRF攻击
- 不依赖Cookie进行认证

## 开发调试

### 启动开发服务器

```bash
cd frontend
npm start
```

访问 http://localhost:3000

### 查看网络请求

使用浏览器开发者工具的Network标签查看API请求：

1. 打开开发者工具（F12）
2. 切换到Network标签
3. 执行登录/注册操作
4. 查看请求和响应数据

### 调试Token

在浏览器控制台查看token：

```javascript
// 查看当前token
console.log(localStorage.getItem('token'));

// 解码token（仅查看payload，不验证签名）
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);
```

## 常见问题

### Q1: 登录后刷新页面，为什么还是登录状态？

A: App组件在初始化时会检查localStorage中的token，如果存在则自动获取用户信息。

```javascript
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    fetchCurrentUser(token);
  }
}, []);
```

### Q2: 如何处理token过期？

A: 当API返回401错误时，自动清除token并跳转到登录页。

```javascript
catch (err) {
  if (err.response && err.response.status === 401) {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setCurrentView('login');
  }
}
```

### Q3: 如何自定义样式？

A: 修改 `styles/index.css` 文件，或者在组件中使用内联样式。

### Q4: 如何添加更多字段到注册表单？

A: 修改Register.js组件，添加新的表单字段，并在提交时包含在请求数据中。

## 扩展功能

可以添加的功能：

- [ ] 记住我功能（延长token有效期）
- [ ] 邮箱验证
- [ ] 找回密码
- [ ] 社交账号登录
- [ ] 用户头像上传
- [ ] 个人资料编辑
- [ ] 密码修改
- [ ] 登录历史记录
- [ ] 多设备管理

## 参考资料

- [React 官方文档](https://react.dev)
- [React Bootstrap 文档](https://react-bootstrap.github.io)
- [Axios 文档](https://axios-http.com)
- [JWT 介绍](https://jwt.io)

