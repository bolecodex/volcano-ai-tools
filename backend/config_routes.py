from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func as sql_func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from database import get_db, SystemConfig
from schemas import (
    SystemConfigCreate, 
    SystemConfigUpdate, 
    SystemConfigResponse,
    SystemConfigListResponse,
    MessageResponse
)
from auth import get_current_active_user, User

router = APIRouter(
    prefix="/api/configs",
    tags=["系统配置"]
)

@router.post("/", response_model=SystemConfigResponse, status_code=status.HTTP_201_CREATED)
async def create_config(
    config: SystemConfigCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    创建系统配置
    需要登录
    """
    # 检查配置键是否已存在
    result = await db.execute(
        select(SystemConfig).where(SystemConfig.config_key == config.config_key)
    )
    existing_config = result.scalar_one_or_none()
    
    if existing_config:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"配置键 '{config.config_key}' 已存在"
        )
    
    # 创建新配置
    new_config = SystemConfig(
        config_key=config.config_key,
        config_value=config.config_value,
        config_type=config.config_type,
        category=config.category,
        description=config.description,
        is_encrypted=config.is_encrypted,
        is_active=config.is_active
    )
    
    db.add(new_config)
    await db.commit()
    await db.refresh(new_config)
    
    return new_config

@router.get("/", response_model=SystemConfigListResponse)
async def get_configs(
    category: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    获取系统配置列表
    可以按分类和启用状态筛选
    """
    query = select(SystemConfig)
    
    # 添加筛选条件
    if category:
        query = query.where(SystemConfig.category == category)
    if is_active is not None:
        query = query.where(SystemConfig.is_active == is_active)
    
    # 获取总数
    count_query = select(sql_func.count()).select_from(SystemConfig)
    if category:
        count_query = count_query.where(SystemConfig.category == category)
    if is_active is not None:
        count_query = count_query.where(SystemConfig.is_active == is_active)
    
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # 获取配置列表
    query = query.offset(skip).limit(limit).order_by(SystemConfig.category, SystemConfig.config_key)
    result = await db.execute(query)
    configs = result.scalars().all()
    
    return SystemConfigListResponse(configs=configs, total=total)

@router.get("/{config_id}", response_model=SystemConfigResponse)
async def get_config(
    config_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    根据ID获取单个配置
    """
    result = await db.execute(
        select(SystemConfig).where(SystemConfig.id == config_id)
    )
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="配置不存在"
        )
    
    return config

@router.get("/key/{config_key}", response_model=SystemConfigResponse)
async def get_config_by_key(
    config_key: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    根据配置键获取配置
    """
    result = await db.execute(
        select(SystemConfig).where(SystemConfig.config_key == config_key)
    )
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"配置键 '{config_key}' 不存在"
        )
    
    return config

@router.put("/{config_id}", response_model=SystemConfigResponse)
async def update_config(
    config_id: int,
    config_update: SystemConfigUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    更新系统配置
    """
    result = await db.execute(
        select(SystemConfig).where(SystemConfig.id == config_id)
    )
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="配置不存在"
        )
    
    # 更新配置
    update_data = config_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(config, field, value)
    
    await db.commit()
    await db.refresh(config)
    
    return config

@router.delete("/{config_id}", response_model=MessageResponse)
async def delete_config(
    config_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    删除系统配置
    """
    result = await db.execute(
        select(SystemConfig).where(SystemConfig.id == config_id)
    )
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="配置不存在"
        )
    
    await db.delete(config)
    await db.commit()
    
    return MessageResponse(message="配置删除成功")

@router.get("/category/{category}", response_model=SystemConfigListResponse)
async def get_configs_by_category(
    category: str,
    is_active: Optional[bool] = True,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    获取指定分类的所有配置
    常用分类：volcano_ark, volcano_engine, tos
    """
    query = select(SystemConfig).where(SystemConfig.category == category)
    
    if is_active is not None:
        query = query.where(SystemConfig.is_active == is_active)
    
    # 获取总数
    count_query = select(sql_func.count()).select_from(SystemConfig).where(
        SystemConfig.category == category
    )
    if is_active is not None:
        count_query = count_query.where(SystemConfig.is_active == is_active)
    
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    result = await db.execute(query.order_by(SystemConfig.config_key))
    configs = result.scalars().all()
    
    return SystemConfigListResponse(configs=configs, total=total)

