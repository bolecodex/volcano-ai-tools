# 用户认证系统更新说明

## 更新概述

本次更新为系统添加了完整的用户认证功能，包括用户注册、登录、JWT token认证等。

**更新日期**: 2025年10月13日

## 新增功能

### 后端功能

✅ **用户数据模型**
- 添加密码字段（哈希存储）
- 添加用户激活状态
- 支持用户名和邮箱唯一性验证

✅ **认证系统**
- JWT token生成和验证
- Bcrypt密码加密
- Token过期机制（默认30分钟）
- 用户认证中间件

✅ **API端点**
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/logout` - 用户登出

### 前端功能

✅ **登录界面**
- 美观的登录表单
- 表单验证
- 错误提示
- 加载状态

✅ **注册界面**
- 用户注册表单
- 密码确认
- 实时验证
- 成功提示

✅ **用户状态管理**
- Token自动保存到localStorage
- 页面刷新保持登录状态
- 自动token验证
- 用户信息展示

✅ **导航栏更新**
- 登录/注册按钮（未登录时）
- 用户下拉菜单（已登录时）
- 显示用户名和邮箱
- 登出功能

## 文件变更

### 后端新增文件

```
backend/
├── auth.py              # 认证工具模块（新增）
├── auth_routes.py       # 认证路由（新增）
└── docs/
    ├── AUTH_GUIDE.md    # 认证系统详细文档（新增）
    └── QUICKSTART.md    # 快速启动指南（新增）
```

### 后端修改文件

```
backend/
├── requirements.txt     # 添加 passlib 和 python-jose
├── database.py         # User模型添加密码和激活状态字段
├── schemas.py          # 添加登录、注册相关Schema
└── main.py            # 注册认证路由
```

### 前端新增文件

```
frontend/src/
├── components/
│   ├── Login.js         # 登录组件（新增）
│   └── Register.js      # 注册组件（新增）
├── config.js            # API配置（新增）
└── docs/
    ├── AUTH_GUIDE.md    # 前端认证文档（新增）
    └── QUICKSTART.md    # 快速启动指南（新增）
```

### 前端修改文件

```
frontend/src/
├── App.js              # 集成登录注册功能
└── styles/index.css    # 添加登录注册样式
```

## 技术栈

### 后端技术

- **FastAPI**: Web框架
- **SQLAlchemy**: ORM
- **Passlib**: 密码哈希
- **Python-JOSE**: JWT实现
- **Pydantic**: 数据验证

### 前端技术

- **React**: 前端框架
- **React Bootstrap**: UI组件库
- **Axios**: HTTP客户端
- **localStorage**: Token存储

## 快速开始

### 1. 安装后端依赖

```bash
cd backend
source venv/bin/activate  # macOS/Linux
# 或 venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

### 2. 启动后端服务

```bash
python main.py
```

访问 http://localhost:8000/docs 查看API文档

### 3. 启动前端服务

```bash
cd frontend
npm install
npm start
```

访问 http://localhost:3000 使用应用

### 4. 测试认证功能

1. 点击"注册"按钮，创建新账户
2. 使用注册的账号登录
3. 查看导航栏的用户信息
4. 点击用户名下拉菜单查看选项

## 安全特性

🔒 **密码安全**
- 使用Bcrypt算法加密
- 密码不明文存储
- 强密码验证（最少6个字符）

🔒 **Token安全**
- JWT签名验证
- Token过期机制
- 安全的密钥管理

🔒 **数据验证**
- 服务端数据验证
- 客户端表单验证
- SQL注入防护

🔒 **CORS配置**
- 限制允许的源
- 安全的跨域设置

## 配置要求

### 重要：修改JWT密钥

在生产环境中，必须修改 `backend/auth.py` 中的 `SECRET_KEY`：

```python
# 生成新的密钥
python -c "import secrets; print(secrets.token_urlsafe(32))"

# 在 auth.py 中使用
SECRET_KEY = "生成的密钥"
```

### 可选配置

**Token过期时间** (`backend/auth.py`):
```python
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 修改为需要的分钟数
```

**CORS源** (`backend/main.py`):
```python
allow_origins=["http://localhost:3000"]  # 添加生产域名
```

**API地址** (`frontend/src/config.js`):
```javascript
export const API_BASE_URL = 'http://localhost:8000';  // 修改为生产地址
```

## API使用示例

### 注册用户

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 登录

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### 获取用户信息

```bash
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer <your_token>"
```

## 数据库变更

### 旧的User表结构

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR NOT NULL UNIQUE,
    email VARCHAR NOT NULL UNIQUE,
    created_at DATETIME,
    updated_at DATETIME
);
```

### 新的User表结构

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR NOT NULL UNIQUE,
    email VARCHAR NOT NULL UNIQUE,
    hashed_password VARCHAR NOT NULL,  -- 新增
    is_active BOOLEAN NOT NULL,        -- 新增
    created_at DATETIME,
    updated_at DATETIME
);
```

⚠️ **注意**: 如果已有旧数据库，建议删除后重新创建，或者手动添加新字段。

## 测试指南

### 功能测试清单

- [ ] 用户注册功能
  - [ ] 正常注册
  - [ ] 用户名重复检测
  - [ ] 邮箱重复检测
  - [ ] 密码长度验证
  
- [ ] 用户登录功能
  - [ ] 正常登录
  - [ ] 错误的用户名/密码
  - [ ] Token生成
  
- [ ] Token验证
  - [ ] 使用有效token访问
  - [ ] 使用过期token
  - [ ] 使用无效token
  
- [ ] 前端集成
  - [ ] 登录界面显示
  - [ ] 注册界面显示
  - [ ] Token自动保存
  - [ ] 页面刷新保持登录
  - [ ] 用户信息显示
  - [ ] 登出功能

### 自动化测试

可以使用以下工具进行测试：

- **Postman**: API测试
- **pytest**: 后端单元测试
- **Jest**: 前端单元测试
- **Cypress**: 前端E2E测试

## 已知问题

1. ⚠️ Token刷新机制尚未实现（token过期后需要重新登录）
2. ⚠️ 密码重置功能待开发
3. ⚠️ 邮箱验证功能待开发

## 后续计划

- [ ] 实现Token刷新机制
- [ ] 添加密码重置功能
- [ ] 添加邮箱验证
- [ ] 添加OAuth2第三方登录
- [ ] 实现用户角色和权限系统
- [ ] 添加登录日志和审计
- [ ] 实现双因素认证（2FA）
- [ ] 添加用户头像上传

## 文档链接

### 后端文档

- [认证系统详细指南](backend/docs/AUTH_GUIDE.md)
- [后端快速启动](backend/docs/QUICKSTART.md)
- [后端README](backend/docs/README.md)

### 前端文档

- [前端认证指南](frontend/docs/AUTH_GUIDE.md)
- [前端快速启动](frontend/docs/QUICKSTART.md)
- [前端README](frontend/docs/README.md)

## 升级步骤

如果你的项目已经在运行旧版本，按以下步骤升级：

### 1. 备份数据

```bash
# 备份数据库
cp backend/hs_adk.db backend/hs_adk.db.backup
```

### 2. 更新代码

```bash
git pull  # 如果使用git
```

### 3. 安装新依赖

```bash
cd backend
pip install -r requirements.txt

cd ../frontend
npm install
```

### 4. 更新数据库

由于数据库结构变更，建议重新创建：

```bash
cd backend
rm hs_adk.db
python main.py  # 自动创建新表
```

### 5. 重启服务

```bash
# 后端
cd backend
python main.py

# 前端
cd frontend
npm start
```

## 故障排查

### 后端问题

**问题**: `ModuleNotFoundError: No module named 'passlib'`  
**解决**: `pip install -r requirements.txt`

**问题**: Token验证失败  
**解决**: 检查SECRET_KEY是否一致

**问题**: 数据库错误  
**解决**: 删除旧数据库，重新创建

### 前端问题

**问题**: 无法连接到后端  
**解决**: 确认后端服务已启动，检查API_BASE_URL配置

**问题**: Token过期  
**解决**: 重新登录

**问题**: 页面刷新后未登录  
**解决**: 检查localStorage是否有token

## 性能优化建议

### 后端优化

- 添加Redis缓存用户信息
- 使用连接池优化数据库连接
- 实现速率限制防止暴力破解
- 异步处理耗时操作

### 前端优化

- 使用React.memo优化组件渲染
- 实现路由懒加载
- 添加请求缓存
- 优化打包体积

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

[添加你的许可证信息]

## 联系方式

如有问题或建议，请联系：

- 项目地址: [GitHub链接]
- 邮箱: [联系邮箱]
- 文档: [文档链接]

---

**祝使用愉快！** 🎉

