# 快速开始指南

这是 HS ADK 项目的快速启动指南，帮助您快速运行前后端应用。

## 前置要求

确保您的系统已安装以下软件：

- **Node.js** >= 18.x
- **Python** >= 3.10
- **npm** 或 **yarn**

## 快速启动

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
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 启动服务
python main.py
```

后端服务将在 http://localhost:8000 启动

#### 2. 启动前端应用

打开新的终端窗口：

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
```

前端应用将在 http://localhost:3000 自动打开

## 访问应用

- **前端应用**: http://localhost:3000
- **后端API文档**: http://localhost:8000/docs
- **后端ReDoc**: http://localhost:8000/redoc

## 测试连接

1. 打开浏览器访问 http://localhost:3000
2. 点击页面上的"测试后端连接"按钮
3. 如果显示绿色提示框，说明前后端连接成功！

## 常见问题

### Q: 后端启动失败

**解决方案**:
1. 确保Python版本 >= 3.10
2. 检查8000端口是否被占用
3. 确保虚拟环境已激活

### Q: 前端启动失败

**解决方案**:
1. 确保Node.js版本 >= 18.x
2. 删除 `node_modules` 文件夹，重新运行 `npm install`
3. 检查3000端口是否被占用

### Q: 前端无法连接后端

**解决方案**:
1. 确保后端服务已启动（访问 http://localhost:8000 应该能看到JSON响应）
2. 检查浏览器控制台是否有CORS错误
3. 确认后端的CORS配置正确

## 下一步

- 查看 [README.md](./README.md) 了解项目详情
- 查看 [frontend/docs/README.md](./frontend/docs/README.md) 了解前端开发
- 查看 [backend/docs/README.md](./backend/docs/README.md) 了解后端API开发

## 开发建议

1. **使用两个终端窗口**：一个运行后端，一个运行前端
2. **热重载**：修改代码后会自动重新加载，无需手动重启
3. **查看日志**：遇到问题时查看终端输出的日志信息
4. **使用API文档**：访问 http://localhost:8000/docs 测试API

## 停止服务

- **前端**: 在终端中按 `Ctrl + C`
- **后端**: 在终端中按 `Ctrl + C`

---

Happy Coding! 🎉

