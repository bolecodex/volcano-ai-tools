from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """应用配置"""
    
    # 应用信息
    app_name: str = "火山AI工具 API"
    app_version: str = "1.0.0"
    debug: bool = True
    
    # 数据库配置
    database_url: str = "sqlite+aiosqlite:///./hs_adk.db"
    
    # API配置
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    
    # CORS配置
    cors_origins: list = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()

