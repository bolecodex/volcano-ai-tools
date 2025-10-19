# 用户认证系统使用指南

## 概述

本系统实现了完整的用户认证功能，包括用户注册、登录、token验证等。基于 JWT (JSON Web Token) 实现安全的用户认证。

## 技术栈

- **认证方式**: JWT Token
- **密码加密**: Bcrypt
- **数据库**: SQLite (异步 SQLAlchemy)
- **API框架**: FastAPI

## 数据库模型

### User 模型

```python
class User(Base):
    id: int                    # 用户ID（主键）
    username: str              # 用户名（唯一）
    email: str                 # 邮箱（唯一）
    hashed_password: str       # 加密后的密码
    is_active: bool            # 是否激活（默认True）
    created_at: datetime       # 创建时间
    updated_at: datetime       # 更新时间
```

## API 端点

### 1. 用户注册

**端点**: `POST /api/auth/register`

**请求体**:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

**验证规则**:
- 用户名: 3-50个字符
- 邮箱: 必须是有效的邮箱格式
- 密码: 至少6个字符

### 2. 用户登录

**端点**: `POST /api/auth/login`

**请求体**:
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**响应**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**错误响应**:
- 401: 用户名或密码错误
- 400: 用户未激活

### 3. 获取当前用户信息

**端点**: `GET /api/auth/me`

**请求头**:
```
Authorization: Bearer <access_token>
```

**响应**:
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

**错误响应**:
- 401: token无效或过期
- 400: 用户未激活

### 4. 用户登出

**端点**: `POST /api/auth/logout`

**请求头**:
```
Authorization: Bearer <access_token>
```

**响应**:
```json
{
  "message": "登出成功，请在客户端删除token",
  "status": "success"
}
```

**注意**: 由于JWT是无状态的，服务端不保存token状态，因此登出操作主要在客户端完成（删除localStorage中的token）。

## 安全配置

### JWT 配置

在 `auth.py` 文件中配置：

```python
SECRET_KEY = "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
```

**重要**: 生产环境中必须修改 `SECRET_KEY`，建议使用环境变量。

生成安全的 SECRET_KEY:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 密码加密

使用 `passlib` 的 `bcrypt` 算法进行密码加密：

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
```

## 使用示例

### Python 客户端示例

```python
import requests

BASE_URL = "http://localhost:8000"

# 1. 注册用户
response = requests.post(
    f"{BASE_URL}/api/auth/register",
    json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    }
)
print("注册响应:", response.json())

# 2. 登录获取token
response = requests.post(
    f"{BASE_URL}/api/auth/login",
    json={
        "username": "testuser",
        "password": "password123"
    }
)
token_data = response.json()
access_token = token_data["access_token"]
print("登录成功，token:", access_token)

# 3. 使用token获取用户信息
response = requests.get(
    f"{BASE_URL}/api/auth/me",
    headers={"Authorization": f"Bearer {access_token}"}
)
print("用户信息:", response.json())
```

### JavaScript 客户端示例

```javascript
const BASE_URL = 'http://localhost:8000';

// 1. 注册用户
async function register() {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    })
  });
  const data = await response.json();
  console.log('注册响应:', data);
}

// 2. 登录
async function login() {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'testuser',
      password: 'password123'
    })
  });
  const data = await response.json();
  // 保存token
  localStorage.setItem('token', data.access_token);
  console.log('登录成功');
}

// 3. 获取用户信息
async function getUserInfo() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  console.log('用户信息:', data);
}

// 4. 登出
function logout() {
  localStorage.removeItem('token');
  console.log('已登出');
}
```

## 前端集成

前端已经集成了完整的用户认证界面，包括：

1. **登录组件** (`Login.js`): 用户登录表单
2. **注册组件** (`Register.js`): 用户注册表单
3. **导航栏**: 显示登录状态和用户信息
4. **路由保护**: 自动检查token有效性

### Token 管理

Token 存储在 `localStorage` 中：

```javascript
// 保存token
localStorage.setItem('token', access_token);

// 获取token
const token = localStorage.getItem('token');

// 删除token
localStorage.removeItem('token');

// 在请求头中使用token
headers: {
  'Authorization': `Bearer ${token}`
}
```

## 错误处理

### 常见错误代码

- **400 Bad Request**: 请求参数错误（如用户名已存在、密码格式不正确）
- **401 Unauthorized**: 未授权（token无效或过期）
- **404 Not Found**: 资源不存在（如用户不存在）
- **422 Unprocessable Entity**: 数据验证失败

### 错误响应格式

```json
{
  "detail": "错误描述信息"
}
```

## 测试

### 使用 curl 测试

```bash
# 1. 注册用户
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# 2. 登录
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' \
  | jq -r '.access_token')

# 3. 获取用户信息
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 使用 FastAPI Swagger UI

访问 `http://localhost:8000/docs` 可以直接在浏览器中测试所有API端点。

## 部署建议

### 生产环境配置

1. **修改 SECRET_KEY**: 使用环境变量
   ```python
   SECRET_KEY = os.getenv("SECRET_KEY", "fallback-key")
   ```

2. **使用 HTTPS**: 确保所有请求都通过HTTPS传输

3. **设置合理的 token 过期时间**: 根据业务需求调整

4. **启用 CORS 白名单**: 只允许可信的域名访问

5. **数据库迁移**: 从 SQLite 迁移到生产级数据库（PostgreSQL、MySQL）

6. **添加速率限制**: 防止暴力破解攻击

7. **日志记录**: 记录登录失败、异常访问等安全事件

## 后续扩展

可以添加的功能：

- [ ] 邮箱验证
- [ ] 忘记密码/重置密码
- [ ] 刷新token机制
- [ ] OAuth2 第三方登录（Google、GitHub等）
- [ ] 用户角色和权限管理
- [ ] 登录日志和安全审计
- [ ] 双因素认证（2FA）
- [ ] IP白名单/黑名单

## 故障排查

### 问题1: Token验证失败

**症状**: 返回401错误  
**解决方案**:
- 检查token是否正确传递
- 检查token是否过期
- 确认SECRET_KEY没有变更

### 问题2: 无法注册用户

**症状**: 返回400错误  
**解决方案**:
- 检查用户名/邮箱是否已存在
- 验证输入数据格式是否正确
- 查看详细错误信息

### 问题3: 数据库连接错误

**症状**: 500服务器错误  
**解决方案**:
- 检查数据库文件是否存在
- 确认数据库表是否正确创建
- 查看后端日志

## 联系方式

如有问题或建议，请通过以下方式联系：

- 项目仓库: [GitHub链接]
- 邮箱: [联系邮箱]

