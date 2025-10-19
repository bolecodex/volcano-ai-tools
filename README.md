# HS ADK - 前后端分离Web应用

这是一个基于 React + Bootstrap + FastAPI + SQLite 构建的现代化 Web 应用程序。

## 📋 项目简介

本项目采用前后端分离架构：
- **前端**: React + Bootstrap - 提供现代化的Web应用界面
- **后端**: FastAPI + SQLite - 提供高性能的 RESTful API 服务

## 🏗️ 技术栈

### 前端
- **React** 18.x - 用户界面库
- **React Bootstrap** 5.x - Bootstrap 5 的 React 组件库
- **Webpack** 5.x - 模块打包工具
- **Axios** - HTTP 客户端
- **React Router** - 前端路由

### 后端
- **FastAPI** - 现代、高性能的 Python Web 框架
- **SQLAlchemy** 2.0 - 异步 ORM
- **SQLite** - 轻量级数据库
- **Pydantic** - 数据验证和设置管理
- **Uvicorn** - ASGI 服务器

## 📁 项目结构

```
hs_adk/
├── frontend/              # 前端项目目录
│   ├── src/              # React 源代码
│   │   ├── App.js        # 主应用组件
│   │   ├── index.js      # 入口文件
│   │   └── styles/       # 样式文件
│   ├── public/           # 静态资源
│   │   └── index.html    # HTML 模板
│   ├── webpack.config.js # Webpack 配置
│   └── package.json      # 前端依赖配置
│
└── backend/              # 后端项目目录
    ├── main.py           # FastAPI 应用入口
    ├── database.py       # 数据库配置和模型
    ├── routers.py        # API 路由
    ├── schemas.py        # Pydantic 数据模型
    ├── config.py         # 应用配置
    └── requirements.txt  # Python 依赖
```

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.x
- **Python** >= 3.10
- **npm** 或 **yarn**

### 后端启动

1. 进入后端目录并创建虚拟环境:
```bash
cd backend
python -m venv venv
```

2. 激活虚拟环境:
```bash
# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

3. 安装依赖:
```bash
pip install -r requirements.txt
```

4. 启动后端服务:
```bash
python main.py
```

后端服务将在 `http://localhost:8000` 启动

访问 API 文档: `http://localhost:8000/docs`

### 前端启动

1. 进入前端目录:
```bash
cd frontend
```

2. 安装依赖:
```bash
npm install
```

3. 开发模式启动:
```bash
# 启动开发服务器（自动打开浏览器）
npm start

# 或者不自动打开浏览器
npm run dev
```

应用将在 http://localhost:3000 启动

4. 生产构建:
```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

构建后的文件将位于 `frontend/build/` 目录

## 📚 API 文档

启动后端服务后，访问以下地址查看完整的 API 文档:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 主要 API 端点

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/` | 根路径 |
| GET | `/health` | 健康检查 |
| GET | `/api/users` | 获取用户列表 |
| GET | `/api/users/{id}` | 获取指定用户 |
| POST | `/api/users` | 创建用户 |
| PUT | `/api/users/{id}` | 更新用户 |
| DELETE | `/api/users/{id}` | 删除用户 |

## 🔧 开发说明

### 添加新的 API 端点

1. 在 `backend/database.py` 中定义数据模型
2. 在 `backend/schemas.py` 中定义 Pydantic Schema
3. 在 `backend/routers.py` 中添加路由处理函数

### 添加新的前端页面

1. 在 `frontend/src/` 中创建新的 React 组件
2. 在 `App.js` 中引入并使用组件
3. 如需路由，配置 React Router

### 数据库迁移

当前使用的是 SQLite，数据库文件位于 `backend/hs_adk.db`

如果需要重置数据库，删除该文件后重启后端服务即可自动重建。

## 🎨 界面预览

应用提供了现代化的用户界面：
- 响应式设计，完美适配各种设备屏幕（手机、平板、桌面）
- Bootstrap 5 组件库，美观易用
- 深色导航栏和卡片式布局
- 实时后端连接测试
- 支持现代浏览器（Chrome、Firefox、Safari、Edge）

## 📝 环境变量

后端支持通过 `.env` 文件配置环境变量：

```env
# 应用配置
APP_NAME=HS ADK API
APP_VERSION=1.0.0
DEBUG=True

# 数据库配置
DATABASE_URL=sqlite+aiosqlite:///./hs_adk.db

# API配置
API_HOST=0.0.0.0
API_PORT=8000
```

复制 `backend/.env.example` 为 `backend/.env` 并根据需要修改。

## 🔒 跨域配置

后端已配置 CORS 中间件，允许以下来源访问：
- `http://localhost:3000`
- `http://127.0.0.1:3000`

如需添加其他来源，修改 `backend/main.py` 中的 CORS 配置。

## 📦 打包发布

### 构建生产版本

```bash
cd frontend
npm run build
```

构建后的静态文件将位于 `frontend/build/` 目录下，可以部署到任何静态文件托管服务。

### 部署选项

- **Nginx/Apache**: 将 `build/` 目录下的文件部署到 Web 服务器
- **Vercel/Netlify**: 直接连接 Git 仓库自动部署
- **GitHub Pages**: 适合静态网站托管
- **Docker**: 容器化部署

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

ISC

## 🔗 相关资源

- [React 文档](https://react.dev/)
- [React Bootstrap 文档](https://react-bootstrap.github.io/)
- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [Bootstrap 文档](https://getbootstrap.com/)
- [SQLAlchemy 文档](https://docs.sqlalchemy.org/)
- [Webpack 文档](https://webpack.js.org/)

---

**Happy Coding! 🎉**

