# 后端快速启动指南

## 系统要求

- Python 3.11 或更高版本
- pip（Python包管理器）

## 安装步骤

### 1. 安装依赖

激活虚拟环境（如果已创建）：

**Windows**:
```bash
cd backend
venv\Scripts\activate
```

**macOS/Linux**:
```bash
cd backend
source venv/bin/activate
```

安装新的依赖包：
```bash
pip install -r requirements.txt
```

### 2. 安装的新包

本次更新新增了以下依赖：

- `passlib[bcrypt]`: 密码哈希加密
- `python-jose[cryptography]`: JWT token生成和验证

### 3. 启动服务器

使用启动脚本：

**Windows**:
```bash
cd ..  # 返回项目根目录
start-backend.bat
```

**macOS/Linux**:
```bash
cd ..  # 返回项目根目录
./start-backend.sh
```

或者直接运行：
```bash
cd backend
python main.py
```

服务器将在 http://localhost:8000 启动

### 4. 验证安装

访问以下URL验证服务是否正常运行：

- 主页: http://localhost:8000
- API文档: http://localhost:8000/docs
- 健康检查: http://localhost:8000/health

## 数据库初始化

首次启动时，系统会自动创建数据库表。数据库文件位于：

```
backend/hs_adk.db
```

如果需要重置数据库，只需删除此文件后重新启动服务器。

## 测试认证功能

### 使用 Swagger UI 测试

1. 访问 http://localhost:8000/docs
2. 找到 `/api/auth/register` 端点
3. 点击 "Try it out"
4. 输入测试数据：
   ```json
   {
     "username": "testuser",
     "email": "test@example.com",
     "password": "password123"
   }
   ```
5. 点击 "Execute" 执行注册

6. 注册成功后，测试登录：
   - 找到 `/api/auth/login` 端点
   - 输入用户名和密码
   - 获取token

7. 使用token测试受保护的端点：
   - 点击页面顶部的 "Authorize" 按钮
   - 输入: `Bearer <your_token>`
   - 然后可以测试 `/api/auth/me` 等需要认证的端点

### 使用 curl 测试

```bash
# 注册用户
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# 登录获取token
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' \
  | grep -o '"access_token":"[^"]*"' \
  | cut -d'"' -f4)

# 使用token获取用户信息
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## 配置说明

### 修改JWT密钥（重要！）

在生产环境中，必须修改 `backend/auth.py` 中的 SECRET_KEY：

```python
# 不要使用默认值！
SECRET_KEY = "your-secret-key-here-change-in-production"
```

生成安全的密钥：
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 修改token过期时间

在 `backend/auth.py` 中修改：

```python
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 修改为你需要的分钟数
```

### 配置CORS

在 `backend/main.py` 中修改允许的源：

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 添加你的前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 日志查看

服务器运行时会在控制台输出详细日志，包括：

- SQL查询语句
- 请求信息
- 错误信息

### 禁用SQL日志

如果不需要查看SQL语句，在 `backend/database.py` 中修改：

```python
engine = create_async_engine(
    DATABASE_URL,
    echo=False,  # 改为 False
    future=True
)
```

## 故障排查

### 问题1: 导入错误

**错误信息**: `ModuleNotFoundError: No module named 'passlib'`

**解决方案**:
```bash
pip install -r requirements.txt
```

### 问题2: 数据库错误

**错误信息**: `sqlalchemy.exc.OperationalError`

**解决方案**:
1. 删除旧的数据库文件: `rm hs_adk.db`
2. 重新启动服务器

### 问题3: 端口被占用

**错误信息**: `Address already in use`

**解决方案**:
1. 修改端口: 在 `main.py` 中改为其他端口
2. 或者终止占用端口的进程

## 开发建议

### 代码热重载

使用 `uvicorn` 的 `--reload` 选项（已默认启用）：

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

修改代码后，服务器会自动重启。

### 调试模式

在 `main.py` 中启用调试模式：

```python
app = FastAPI(
    title="HS ADK API",
    description="基于 FastAPI 和 SQLite 的后端服务",
    version="1.0.0",
    debug=True  # 添加此行
)
```

## 下一步

- 查看 [AUTH_GUIDE.md](./AUTH_GUIDE.md) 了解详细的API使用说明
- 查看 [README.md](./README.md) 了解项目整体架构
- 访问 http://localhost:8000/docs 查看完整的API文档

## 获取帮助

如遇到问题，请检查：

1. Python版本是否正确
2. 所有依赖是否已安装
3. 虚拟环境是否已激活
4. 数据库文件是否有写入权限
5. 端口是否被占用

