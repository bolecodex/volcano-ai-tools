# HS ADK - Volcano AI 工具平台

一个功能完整的前后端分离 Web 应用，用于管理火山方舟（Volcano Ark）、火山引擎和 TOS 存储等服务的配置与认证。

## ✨ 功能特性

### 🔐 用户认证系统
- ✅ 用户注册和登录
- ✅ JWT Token 认证
- ✅ 密码加密存储（Bcrypt）
- ✅ Token 自动管理
- ✅ 页面刷新保持登录状态

### ⚙️ 系统配置管理
- ✅ 可视化配置管理界面
- ✅ 支持多种配置分类（火山方舟/火山引擎/TOS/通用）
- ✅ 敏感信息加密标记
- ✅ 配置启用/禁用控制
- ✅ 完整的 CRUD 操作

### 🎨 现代化界面
- ✅ 响应式设计（支持移动端/平板/桌面）
- ✅ Bootstrap 5 UI 组件
- ✅ 渐变色主题
- ✅ 流畅的动画效果

## 🏗️ 技术栈

### 前端技术
- **React** 18.x - 用户界面库
- **React Bootstrap** 5.x - UI 组件库
- **Webpack** 5.x - 模块打包工具
- **Axios** - HTTP 请求库

### 后端技术
- **FastAPI** - 现代、高性能 Web 框架
- **SQLAlchemy** 2.0 - 异步 ORM
- **SQLite** / **aiosqlite** - 数据库
- **Pydantic** - 数据验证
- **Python-JOSE** - JWT 实现
- **Passlib** - 密码加密
- **Uvicorn** - ASGI 服务器

## 📁 项目结构

```
volcano-ai-tools/
├── frontend/                   # 前端项目
│   ├── src/
│   │   ├── components/        # React 组件
│   │   │   ├── Login.js      # 登录组件
│   │   │   ├── Register.js   # 注册组件
│   │   │   └── SystemConfig.js # 系统配置管理
│   │   ├── App.js            # 主应用
│   │   ├── config.js         # API 配置
│   │   └── styles/           # 样式文件
│   ├── docs/                 # 前端文档
│   └── package.json
│
├── backend/                   # 后端项目
│   ├── main.py               # 应用入口
│   ├── database.py           # 数据模型
│   ├── schemas.py            # 数据验证模型
│   ├── auth.py               # 认证逻辑
│   ├── auth_routes.py        # 认证路由
│   ├── config_routes.py      # 配置路由
│   ├── init_configs.py       # 配置初始化
│   ├── docs/                 # 后端文档
│   └── requirements.txt      # Python 依赖
│
├── README.md                 # 项目主文档（本文件）
└── QUICKSTART.md            # 快速开始指南
```

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.x
- **Python** >= 3.10
- **npm** 或 **yarn**

### 方式一：使用启动脚本（推荐）

#### macOS/Linux
```bash
# 终端1：启动后端
./start-backend.sh

# 终端2：启动前端
./start-frontend.sh
```

#### Windows
```bash
# 终端1：启动后端
start-backend.bat

# 终端2：启动前端
start-frontend.bat
```

### 方式二：手动启动

#### 1. 启动后端服务

```bash
cd backend

# 激活虚拟环境
source venv/bin/activate  # macOS/Linux
# 或 venv\Scripts\activate  # Windows

# 安装依赖（首次运行）
pip install -r requirements.txt

# 启动服务
python main.py
```

后端将在 **http://localhost:8000** 启动

#### 2. 启动前端应用

```bash
cd frontend

# 安装依赖（首次运行）
npm install

# 启动开发服务器
npm start
```

前端将在 **http://localhost:3000** 启动

### 3. 初始化配置（可选）

```bash
cd backend
python init_configs.py        # 创建预置配置
python init_configs.py list   # 查看已有配置
```

## 📖 使用指南

### 1. 注册和登录

1. 访问 http://localhost:3000
2. 点击"注册"创建账户
3. 使用账号登录系统

### 2. 管理系统配置

1. 登录后点击导航栏的"系统配置"
2. 选择配置分类（火山方舟/火山引擎/TOS/通用）
3. 点击"新建配置"添加配置
4. 使用"编辑"或"删除"管理现有配置

### 3. API 访问

访问以下地址查看完整 API 文档：
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔌 主要 API 端点

### 认证相关
| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| GET | `/api/auth/me` | 获取当前用户信息 |
| POST | `/api/auth/logout` | 用户登出 |

### 配置管理
| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/configs/` | 创建配置 |
| GET | `/api/configs/` | 获取配置列表 |
| GET | `/api/configs/{id}` | 获取指定配置 |
| GET | `/api/configs/key/{key}` | 根据键名获取配置 |
| GET | `/api/configs/category/{category}` | 根据分类获取配置 |
| PUT | `/api/configs/{id}` | 更新配置 |
| DELETE | `/api/configs/{id}` | 删除配置 |

## 📚 文档索引

### 快速指南
- [快速开始](./QUICKSTART.md) - 项目快速启动指南

### 后端文档
- [后端 README](./backend/docs/README.md) - 后端项目概述
- [后端快速开始](./backend/docs/QUICKSTART.md) - 后端快速启动
- [认证系统指南](./backend/docs/AUTH_GUIDE.md) - 认证系统详细说明
- [认证使用教程](./backend/docs/AUTH_HOW_TO_USE.md) - 认证功能使用教程
- [配置系统指南](./backend/docs/CONFIG_GUIDE.md) - 配置管理详细说明
- [配置快速上手](./backend/docs/CONFIG_QUICKSTART.md) - 配置功能快速上手
- [配置快速参考](./backend/docs/CONFIG_QUICK_REFERENCE.md) - 配置 API 速查表

### 前端文档
- [前端 README](./frontend/docs/README.md) - 前端项目概述
- [前端快速开始](./frontend/docs/QUICKSTART.md) - 前端快速启动
- [前端认证指南](./frontend/docs/AUTH_GUIDE.md) - 前端认证使用说明
- [配置管理使用](./frontend/docs/CONFIG_USAGE.md) - 配置界面使用指南

## 🔧 开发配置

### 修改 JWT 密钥（重要！）

⚠️ **生产环境必须修改 JWT 密钥！**

```bash
# 生成新密钥
python -c "import secrets; print(secrets.token_urlsafe(32))"

# 在 backend/auth.py 中替换
SECRET_KEY = "你生成的密钥"
```

### 修改 Token 过期时间

编辑 `backend/auth.py`：
```python
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 修改为需要的分钟数
```

### 配置 CORS

编辑 `backend/main.py`：
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        # 添加其他允许的源
    ],
    ...
)
```

### 修改 API 地址

编辑 `frontend/src/config.js`：
```javascript
export const API_BASE_URL = 'http://localhost:8000';  // 修改为实际地址
```

## 🔒 安全特性

- ✅ JWT Token 认证保护
- ✅ Bcrypt 密码加密
- ✅ 敏感配置加密标记
- ✅ CORS 跨域保护
- ✅ SQL 注入防护（ORM）
- ✅ 数据验证（Pydantic）

## 📦 生产部署

### 构建前端

```bash
cd frontend
npm run build
```

构建文件位于 `frontend/build/`

### 部署选项

- **静态托管**: Vercel、Netlify、GitHub Pages
- **容器化**: Docker + Docker Compose
- **传统服务器**: Nginx + Supervisor/Systemd
- **云平台**: AWS、阿里云、腾讯云

### Nginx 配置示例

```nginx
# 前端
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/frontend/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# 后端
server {
    listen 80;
    server_name api.your-domain.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🐛 故障排查

### 后端启动失败
```bash
# 检查 Python 版本
python --version  # 应该 >= 3.10

# 检查端口占用
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# 重新安装依赖
pip install -r requirements.txt --force-reinstall
```

### 前端启动失败
```bash
# 检查 Node.js 版本
node --version  # 应该 >= 18

# 清理并重装
rm -rf node_modules package-lock.json
npm install
```

### 无法连接后端
- 确认后端服务已启动（访问 http://localhost:8000）
- 检查浏览器控制台的错误信息
- 验证 CORS 配置是否正确

### 数据库问题
```bash
# 重置数据库
cd backend
rm hs_adk.db
python main.py  # 自动重建数据库
```

## 🎯 未来规划

- [ ] Token 刷新机制
- [ ] 密码重置功能
- [ ] 邮箱验证
- [ ] 用户角色权限系统
- [ ] 配置真正的加密/解密
- [ ] 配置变更历史
- [ ] 操作审计日志
- [ ] OAuth2 第三方登录
- [ ] 双因素认证（2FA）

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

ISC

## 🔗 相关资源

### 官方文档
- [React 文档](https://react.dev/)
- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [React Bootstrap 文档](https://react-bootstrap.github.io/)
- [SQLAlchemy 文档](https://docs.sqlalchemy.org/)
- [Pydantic 文档](https://docs.pydantic.dev/)

### 学习资源
- [Python-JOSE 文档](https://python-jose.readthedocs.io/)
- [Passlib 文档](https://passlib.readthedocs.io/)
- [JWT 介绍](https://jwt.io/)

---

**Happy Coding! 🚀**

如有问题或建议，请查阅 [文档](#-文档索引) 或提交 Issue。
