# 本地运行指南

## 快速启动

### 方法1：使用启动脚本（推荐）
```bash
./start-local.sh
```

### 方法2：手动启动

#### 启动后端
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

#### 启动前端
```bash
cd frontend
npm install
npm start
```

## 访问地址

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:8000
- **健康检查**: http://localhost:8000/health
- **API文档**: http://localhost:8000/docs

## Docker方式（可选）

如果Docker网络正常，也可以使用Docker方式：

```bash
# 启动所有服务
docker-compose -f docker-compose.local.yml up --build -d

# 查看日志
docker-compose -f docker-compose.local.yml logs -f

# 停止服务
docker-compose -f docker-compose.local.yml down
```

## 服务状态检查

```bash
# 检查端口占用
lsof -i :8000  # 后端
lsof -i :3000  # 前端

# 测试后端健康状态
curl http://localhost:8000/health

# 测试前端
curl http://localhost:3000
```

## 停止服务

### 本地模式
- 按 `Ctrl+C` 停止启动脚本
- 或手动杀死进程：
  ```bash
  pkill -f "python main.py"
  pkill -f "npm start"
  ```

### Docker模式
```bash
docker-compose -f docker-compose.local.yml down
```

## 故障排除

1. **端口被占用**：检查是否有其他服务占用8000或3000端口
2. **Python依赖问题**：重新创建虚拟环境并安装依赖
3. **Node.js依赖问题**：删除node_modules并重新安装
4. **Docker网络问题**：使用本地模式启动

## 开发模式

前端支持热重载，修改代码后会自动刷新。
后端需要重启才能看到更改。
