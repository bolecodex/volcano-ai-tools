from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import init_db
from routers import api_router
from auth_routes import auth_router
from config_routes import router as config_router
from volcano_routes import router as volcano_router
from tos_routes import router as tos_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时初始化数据库
    await init_db()
    print("数据库初始化完成")
    yield
    # 关闭时的清理工作
    print("应用关闭")

app = FastAPI(
    title="火山AI工具 API",
    description="基于 FastAPI 和 SQLite 的后端服务",
    version="1.0.0",
    lifespan=lifespan
)

# 配置CORS - 允许前端应用访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://0.0.0.0:3000"],  # 开发环境
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 根路由
@app.get("/")
async def root():
    return {
        "message": "欢迎使用 火山AI工具 API",
        "version": "1.0.0",
        "status": "运行中"
    }

# 健康检查
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# 注册API路由
app.include_router(api_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(config_router)
app.include_router(volcano_router)
app.include_router(tos_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

