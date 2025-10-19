# 后端项目说明

这是基于 FastAPI + SQLite 构建的后端 API 服务。

## 技术栈

- **FastAPI** - 现代、高性能的 Python Web 框架
- **SQLAlchemy 2.0** - 异步 ORM
- **SQLite** - 轻量级嵌入式数据库
- **Pydantic** - 数据验证和序列化
- **Uvicorn** - ASGI 服务器

## 目录结构

```
backend/
├── main.py           # FastAPI 应用主入口
├── database.py       # 数据库配置、引擎和模型定义
├── routers.py        # API 路由和业务逻辑
├── schemas.py        # Pydantic 数据模型（请求/响应）
├── config.py         # 应用配置管理
├── requirements.txt  # Python 依赖包列表
├── .env.example      # 环境变量示例文件
└── hs_adk.db        # SQLite 数据库文件（运行后自动生成）
```

## 快速开始

### 1. 创建虚拟环境

```bash
python -m venv venv
```

### 2. 激活虚拟环境

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

### 3. 安装依赖

```bash
pip install -r requirements.txt
```

### 4. 配置环境变量（可选）

```bash
cp .env.example .env
# 编辑 .env 文件修改配置
```

### 5. 启动服务

```bash
python main.py
```

服务将在 `http://localhost:8000` 启动

## API 文档

启动服务后，访问以下地址：

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## 核心文件说明

### main.py - 应用入口

- 创建 FastAPI 应用实例
- 配置 CORS 中间件
- 注册路由
- 定义应用生命周期事件（启动/关闭）

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时初始化数据库
    await init_db()
    yield
    # 关闭时的清理工作

app = FastAPI(lifespan=lifespan)
```

### database.py - 数据库配置

- 配置异步 SQLAlchemy 引擎
- 定义数据库模型（ORM）
- 提供数据库会话管理

```python
# 异步数据库引擎
engine = create_async_engine(DATABASE_URL)

# 会话工厂
async_session_maker = async_sessionmaker(engine)

# 基础模型类
class Base(DeclarativeBase):
    pass

# 示例模型
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    email = Column(String, unique=True)
```

### schemas.py - 数据模型

使用 Pydantic 定义请求和响应的数据结构：

```python
class UserCreate(BaseModel):
    username: str
    email: EmailStr

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime
```

### routers.py - API 路由

定义所有的 API 端点和业务逻辑：

```python
@api_router.get("/users", response_model=List[UserResponse])
async def get_users(db: AsyncSession = Depends(get_db)):
    # 业务逻辑
    pass
```

### config.py - 配置管理

使用 Pydantic Settings 管理应用配置：

```python
class Settings(BaseSettings):
    app_name: str = "HS ADK API"
    database_url: str = "sqlite+aiosqlite:///./hs_adk.db"
    
    class Config:
        env_file = ".env"
```

## API 端点

### 基础端点

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/` | 根路径，返回欢迎信息 |
| GET | `/health` | 健康检查 |

### 用户管理

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/users` | 获取用户列表 |
| GET | `/api/users/{user_id}` | 获取指定用户详情 |
| POST | `/api/users` | 创建新用户 |
| PUT | `/api/users/{user_id}` | 更新用户信息 |
| DELETE | `/api/users/{user_id}` | 删除用户 |

## 数据库

### 使用 SQLite

项目使用 SQLite 作为数据库，数据库文件为 `hs_adk.db`

### 异步操作

使用 `aiosqlite` 实现异步数据库操作：

```python
async def get_users(db: AsyncSession):
    result = await db.execute(select(User))
    return result.scalars().all()
```

### 数据库初始化

应用启动时自动创建表：

```python
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
```

### 重置数据库

删除 `hs_adk.db` 文件后重启应用即可重建数据库。

## 开发指南

### 添加新的数据模型

1. 在 `database.py` 中定义 ORM 模型：

```python
class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    price = Column(Float)
```

2. 在 `schemas.py` 中定义 Pydantic 模型：

```python
class ProductCreate(BaseModel):
    name: str
    price: float

class ProductResponse(ProductCreate):
    id: int
    
    class Config:
        from_attributes = True
```

3. 在 `routers.py` 中添加路由：

```python
@api_router.post("/products")
async def create_product(
    product: ProductCreate,
    db: AsyncSession = Depends(get_db)
):
    new_product = Product(**product.model_dump())
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    return new_product
```

### 依赖注入

使用 FastAPI 的依赖注入系统：

```python
from fastapi import Depends

async def get_current_user() -> User:
    # 获取当前用户的逻辑
    return user

@api_router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
```

### 错误处理

使用 HTTPException 返回错误：

```python
from fastapi import HTTPException, status

if not user:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="用户不存在"
    )
```

## CORS 配置

允许前端访问的配置在 `main.py` 中：

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 测试 API

### 使用 cURL

```bash
# 获取用户列表
curl http://localhost:8000/api/users

# 创建用户
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "email": "test@example.com"}'
```

### 使用 httpie

```bash
# 获取用户列表
http GET http://localhost:8000/api/users

# 创建用户
http POST http://localhost:8000/api/users \
  username=test email=test@example.com
```

### 使用 Postman

导入 OpenAPI 规范：
1. 访问 http://localhost:8000/openapi.json
2. 在 Postman 中导入该 JSON 文件

## 性能优化

### 数据库连接池

SQLAlchemy 自动管理连接池：

```python
engine = create_async_engine(
    DATABASE_URL,
    pool_size=5,
    max_overflow=10
)
```

### 异步操作

使用 `async/await` 提高并发性能：

```python
async def get_user_with_posts(user_id: int, db: AsyncSession):
    user_task = db.execute(select(User).where(User.id == user_id))
    posts_task = db.execute(select(Post).where(Post.user_id == user_id))
    
    user_result, posts_result = await asyncio.gather(user_task, posts_task)
    return user_result.scalar(), posts_result.scalars().all()
```

## 部署

### 生产环境运行

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 使用 Docker

创建 `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 日志

FastAPI 使用 Python 的标准 logging 模块：

```python
import logging

logger = logging.getLogger(__name__)

@api_router.get("/users")
async def get_users(db: AsyncSession = Depends(get_db)):
    logger.info("获取用户列表")
    # ...
```

## 安全建议

1. 在生产环境中禁用 `DEBUG` 模式
2. 使用环境变量存储敏感信息
3. 实现认证和授权机制
4. 限制 CORS 允许的来源
5. 使用 HTTPS

## 常见问题

### Q: 如何切换到其他数据库？
A: 修改 `DATABASE_URL`，例如：
- PostgreSQL: `postgresql+asyncpg://user:pass@localhost/dbname`
- MySQL: `mysql+aiomysql://user:pass@localhost/dbname`

### Q: 如何添加数据验证？
A: 在 Pydantic 模型中使用验证器：

```python
from pydantic import validator

class UserCreate(BaseModel):
    username: str
    
    @validator('username')
    def username_alphanumeric(cls, v):
        assert v.isalnum(), '用户名必须是字母数字'
        return v
```

## 相关链接

- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [SQLAlchemy 文档](https://docs.sqlalchemy.org/)
- [Pydantic 文档](https://docs.pydantic.dev/)
- [Uvicorn 文档](https://www.uvicorn.org/)

