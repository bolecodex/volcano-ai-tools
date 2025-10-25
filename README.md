# 火山AI创作工坊

集成认证系统和火山AI创作功能的全栈 Web 应用程序，支持本地和云端部署。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/fastapi-0.104.1-green.svg)](https://fastapi.tiangolo.com/)

---

## ✨ 核心功能

### 🔐 用户认证系统
- ✅ 用户注册和登录
- ✅ JWT Token 认证
- ✅ 密码加密存储
- ✅ 会话管理

### ⚙️ 系统配置管理
- ✅ 配置项持久化
- ✅ 系统参数管理
- ✅ 用户配置隔离

### 🎨 火山AI创作工坊

#### AI 图片生成
- ✅ **文生图** (Text-to-Image): 使用文字描述生成高质量图片
- ✅ **图生图** (Image-to-Image): 基于参考图片生成新图片
- ✅ **智能编辑**: 精准执行编辑指令，保持图像完整性
- ✅ **多图融合**: 最多支持 10 张参考图混合生成
- ✅ **组图生成**: 一次生成最多 15 张连续图片
- ✅ **4K 分辨率**: 支持高清输出（1K/2K/4K）

#### AI 视频生成
- ✅ **文生视频** (Text-to-Video): 文字描述生成动态视频
- ✅ **图生视频** (Image-to-Video): 静态图片转动态视频
- ✅ **即梦 3.0 Pro**: 支持自定义帧数和宽高比
- ✅ **任务管理**: 实时查看生成进度和状态

#### 动作模仿
- ✅ **即梦动作模仿**: 生动模式，更稳定逼真，突破竖屏限制
- ✅ **经典版本**: 原有动作模仿接口
- ✅ **视频驱动**: 使用驱动视频生成角色动画

#### 数字人 (OmniHuman1.5)
- ✅ **图片+音频生成视频**: 单张图片配合音频生成数字人视频
- ✅ **多主体支持**: 支持人物、宠物、动漫角色等
- ✅ **任意画幅**: 突破传统竖屏限制，支持各种比例

#### 智能绘图 (Inpainting)
- ✅ **涂抹编辑**: 使用蒙版图精准编辑图片区域
- ✅ **智能填充**: AI 智能理解上下文填充内容
- ✅ **同步生成**: 实时获取编辑结果，无需等待

#### 智能搜图
- ✅ **以图搜图**: 上传图片查找相似图片
- ✅ **以文搜图**: 使用文字描述搜索图片
- ✅ **多模态搜索**: 结合图片和文字进行混合搜索

---

## 🚀 快速开始

### 环境要求

**前端**:
- Node.js >= 14.0.0
- npm >= 6.0.0

**后端**:
- Python >= 3.9
- pip

### 1. 克隆项目

```bash
git clone https://github.com/bolecodex/volcano-ai-tools.git
cd volcano-ai-tools
```

### 2. 一键启动（推荐）

```bash
# 本地启动（自动启动前后端）
./start-local.sh
```

### 3. 分别启动

#### 启动后端
```bash
# Unix/Linux/macOS
./start-backend.sh

# 或手动启动
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

#### 启动前端
```bash
# Unix/Linux/macOS
./start-frontend.sh

# 或手动启动
cd frontend
npm install
npm start
```

### 4. 访问应用

- **前端界面**: http://localhost:3000
- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs

---

## ☁️ 云端部署

### ECS服务器部署

项目已优化支持火山引擎ECS服务器部署：

1. **配置安全组**: 开放端口3000和8000
2. **启动服务**: 使用 `./start-local.sh` 一键启动
3. **访问地址**: 
   - 前端: `http://你的ECS公网IP:3000`
   - 后端: `http://你的ECS公网IP:8000`

### Docker部署

```bash
# 使用Docker Compose启动
docker-compose up -d
```

---

## 🏗️ 技术架构

### 核心技术栈

**前端**:
- React 18.2.0
- React Bootstrap 5
- Webpack 5
- Axios
- React Router DOM

**后端**:
- FastAPI 0.104.1
- SQLAlchemy 2.0.23
- SQLite
- JWT Token 认证
- httpx (异步HTTP客户端)
- Pydantic (数据验证)

### 项目结构

```
volcano-ai-tools/
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/       # React 组件
│   │   ├── api/             # API 接口
│   │   └── App.js           # 主应用
│   ├── public/              # 静态资源
│   ├── docs/                # 前端文档
│   └── package.json         # 依赖配置
│
├── backend/                  # 后端应用
│   ├── main.py              # FastAPI 主程序
│   ├── auth.py              # 认证模块
│   ├── auth_routes.py       # 认证路由
│   ├── config.py            # 配置模块
│   ├── database.py          # 数据库
│   ├── volcano_api_service.py # 火山API服务
│   ├── docs/                # 后端文档
│   └── requirements.txt     # Python 依赖
│
├── nginx/                    # Nginx配置
├── start-local.sh           # 一键启动脚本 ⭐
├── start-backend.sh         # 后端启动脚本
├── start-frontend.sh        # 前端启动脚本
├── docker-compose.yml       # Docker配置
└── README.md                # 项目说明
```

---

## 🔧 配置说明

### API密钥配置

#### 方式1: 通过前端设置页面

1. 启动应用后访问"设置"页面
2. 配置以下密钥：
   - **ARK API Key**: 用于图片生成（Seedream 4.0）
   - **Access Key ID / Secret Access Key**: 用于即梦系列、视频生成、动作模仿等功能

#### 方式2: 通过环境变量

创建 `.env` 文件在 `backend/` 目录:

```env
# 数据库配置
DATABASE_URL=sqlite+aiosqlite:///./hs_adk.db

# JWT配置
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# 火山引擎配置（可选）
ARK_API_KEY=your-ark-api-key
VOLCENGINE_ACCESS_KEY_ID=your-access-key-id
VOLCENGINE_SECRET_ACCESS_KEY=your-secret-access-key
```

### 跨域配置

后端已配置支持所有来源访问，如需修改请编辑 `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📚 API 文档

### 自动生成的文档

启动后端后访问:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 主要API端点

#### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

#### 配置管理
- `GET /api/configs` - 获取所有配置
- `POST /api/configs` - 创建配置
- `PUT /api/configs/{id}` - 更新配置
- `DELETE /api/configs/{id}` - 删除配置

#### 火山AI - 图片生成
- `POST /api/volcano/images/generate` - 生成图片

#### 火山AI - 视频生成
- `POST /api/volcano/video/create` - 创建视频任务
- `GET /api/volcano/video/tasks/{task_id}` - 查询视频任务
- `GET /api/volcano/video/tasks` - 批量查询视频任务
- `DELETE /api/volcano/video/tasks/{task_id}` - 删除视频任务

#### 火山AI - 视觉服务
- `POST /api/volcano/visual/{action}` - 提交视觉服务任务
- `POST /api/volcano/visual/{action}/query` - 查询视觉服务任务

---

## 🎯 使用示例

### 1. 用户注册

```javascript
const response = await axios.post('http://localhost:8000/api/auth/register', {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
});
```

### 2. 生成图片

```javascript
const response = await axios.post(
  'http://localhost:8000/api/volcano/images/generate',
  {
    model: 'doubao-seedream-4-0-250828',
    prompt: '一只可爱的猫咪',
    size: '2K',
    response_format: 'url'
  },
  {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  }
);
```

### 3. 创建视频任务

```javascript
const response = await axios.post(
  'http://localhost:8000/api/volcano/video/create',
  {
    model: 'jimeng-3.0-pro',
    content: [
      {
        type: 'text',
        text: '一个美丽的日落场景'
      }
    ]
  },
  {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  }
);
```

---

## 🔒 安全特性

- ✅ **密码加密**: 使用 bcrypt 加密存储用户密码
- ✅ **JWT Token**: 基于 JWT 的无状态认证
- ✅ **CORS 保护**: 配置了跨域资源共享策略
- ✅ **SQL 注入防护**: 使用 SQLAlchemy ORM
- ✅ **数据验证**: 使用 Pydantic 进行请求数据验证

---

## 📖 详细文档

### 项目文档
- [API设置指南](API_SETUP_GUIDE.md)
- [本地运行指南](LOCAL_RUN_GUIDE.md)
- [快速部署指南](QUICK_DEPLOY.md)
- [Docker故障排除](DOCKER_TROUBLESHOOTING.md)

### 前端文档 (frontend/docs/)
- [前端 README](frontend/docs/README.md)
- [认证指南](frontend/docs/AUTH_GUIDE.md)
- [快速开始](frontend/docs/QUICKSTART.md)

### 后端文档 (backend/docs/)
- [后端 README](backend/docs/README.md)
- [认证指南](backend/docs/AUTH_GUIDE.md)
- [配置指南](backend/docs/CONFIG_GUIDE.md)
- [快速开始](backend/docs/QUICKSTART.md)

---

## 🐛 故障排除

### 后端无法启动
1. 检查 Python 版本是否 >= 3.9
2. 确保所有依赖已安装: `pip install -r requirements.txt`
3. 检查端口 8000 是否被占用

### 前端无法启动
1. 检查 Node.js 版本是否 >= 14.0.0
2. 删除 `node_modules` 并重新安装: `rm -rf node_modules && npm install`
3. 检查端口 3000 是否被占用

### API 调用失败
1. 检查网络连接
2. 验证 API Key 是否正确
3. 确认是否配置了 AccessKey（即梦系列需要）
4. 查看浏览器开发者工具的控制台错误信息

### CORS 错误
1. 确认后端 CORS 配置包含前端地址
2. 检查前端请求的后端地址是否正确

### ECS部署问题
1. 确认安全组已开放端口3000和8000
2. 检查防火墙设置
3. 使用 `curl http://你的IP:8000/health` 测试后端连接

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献流程
1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 🙏 致谢

- [FastAPI](https://fastapi.tiangolo.com/) - 现代化的 Python Web 框架
- [React](https://reactjs.org/) - 用户界面库
- [Bootstrap](https://getbootstrap.com/) - UI 组件库
- [火山引擎](https://www.volcengine.com/) - AI 能力提供商

---

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- **Issues**: [GitHub Issues](https://github.com/bolecodex/volcano-ai-tools/issues)
- **Discussions**: [GitHub Discussions](https://github.com/bolecodex/volcano-ai-tools/discussions)

---

**✨ 享受 AI 创作的乐趣！**

如果这个项目对你有帮助，请给一个 ⭐️ Star 支持一下！
