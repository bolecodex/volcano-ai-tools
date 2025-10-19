from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
from typing import Optional

# 用户相关的Schema

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    email: EmailStr = Field(..., description="邮箱地址")

class UserCreate(UserBase):
    """创建用户的请求模型（不使用，改用UserRegister）"""
    pass

class UserRegister(BaseModel):
    """用户注册请求模型"""
    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    email: EmailStr = Field(..., description="邮箱地址")
    password: str = Field(..., min_length=6, max_length=100, description="密码")
    
    @field_validator('password')
    @classmethod
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError('密码长度至少6个字符')
        return v

class UserLogin(BaseModel):
    """用户登录请求模型"""
    username: str = Field(..., description="用户名")
    password: str = Field(..., description="密码")

class UserUpdate(BaseModel):
    """更新用户的请求模型"""
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None

class UserResponse(UserBase):
    """用户响应模型"""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    """Token响应模型"""
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    """Token数据模型"""
    username: Optional[str] = None

class MessageResponse(BaseModel):
    """通用消息响应"""
    message: str
    status: str = "success"

# 系统配置相关的Schema

class SystemConfigBase(BaseModel):
    """系统配置基础模型"""
    config_key: str = Field(..., min_length=1, max_length=100, description="配置键名")
    config_value: Optional[str] = Field(None, description="配置值")
    config_type: str = Field(default="string", description="配置类型: string, token, key, json")
    category: str = Field(default="general", description="配置分类: volcano_ark, volcano_engine, tos, general等")
    description: Optional[str] = Field(None, max_length=500, description="配置描述")
    is_encrypted: bool = Field(default=False, description="是否加密存储")
    is_active: bool = Field(default=True, description="是否启用")

class SystemConfigCreate(SystemConfigBase):
    """创建系统配置的请求模型"""
    pass

class SystemConfigUpdate(BaseModel):
    """更新系统配置的请求模型"""
    config_value: Optional[str] = None
    config_type: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    is_encrypted: Optional[bool] = None
    is_active: Optional[bool] = None

class SystemConfigResponse(SystemConfigBase):
    """系统配置响应模型"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class SystemConfigListResponse(BaseModel):
    """系统配置列表响应"""
    configs: list[SystemConfigResponse]
    total: int

