"""
火山引擎 API 路由
提供图片生成、视频生成、动作模仿、数字人等功能的HTTP接口
"""
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from volcano_api_service import VolcanoAPIService

router = APIRouter()
api_service = VolcanoAPIService()


# 请求模型定义
class ImageGenerationRequest(BaseModel):
    """图片生成请求"""
    model: str
    prompt: str
    size: Optional[str] = "2K"
    sequential_image_generation: Optional[str] = "disabled"
    stream: Optional[bool] = False
    response_format: Optional[str] = "url"
    watermark: Optional[bool] = True
    guidance_scale: Optional[float] = None
    seed: Optional[int] = None
    sequential_image_generation_options: Optional[Dict[str, Any]] = None


class VideoTaskRequest(BaseModel):
    """视频任务创建请求"""
    model: str
    content: List[Dict[str, Any]]
    callback_url: Optional[str] = None
    return_last_frame: Optional[bool] = False


class VisualTaskRequest(BaseModel):
    """视觉服务任务请求"""
    req_key: str
    binary_data_base64: Optional[List[str]] = None
    image_urls: Optional[List[str]] = None
    video_urls: Optional[List[str]] = None
    do_risk_check: Optional[bool] = True
    # 即梦 4.0 参数
    prompt: Optional[str] = None
    model_version: Optional[str] = None
    scale: Optional[float] = None
    seed: Optional[int] = None
    use_sr: Optional[bool] = None
    logo_info: Optional[Dict[str, Any]] = None
    # Inpainting 参数
    custom_prompt: Optional[str] = None
    steps: Optional[int] = None
    return_url: Optional[bool] = None
    # 其他通用参数
    
    class Config:
        extra = "allow"  # 允许额外的字段
        protected_namespaces = ()  # 允许 model_ 前缀的字段


class VisualQueryRequest(BaseModel):
    """视觉服务任务查询请求"""
    req_key: str
    task_id: str


# API路由
@router.post("/api/volcano/images/generate")
async def generate_images(
    request: ImageGenerationRequest,
    authorization: str = Header(...)
):
    """
    生成图片 (Seedream 4.0)
    
    需要在请求头中提供 Authorization: Bearer <api_key>
    """
    # 从 Authorization 头中提取 API Key
    if not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    api_key = authorization[7:]  # 移除 "Bearer " 前缀
    
    # 构建请求数据
    request_data = {
        'apiKey': api_key,
        **request.dict()
    }
    
    # 调用API服务
    result = await api_service.generate_images(request_data)
    
    if not result['success']:
        raise HTTPException(status_code=500, detail=result['error'])
    
    return result['data']


@router.post("/api/volcano/video/create")
async def create_video_task(
    request: VideoTaskRequest,
    authorization: str = Header(...)
):
    """
    创建视频生成任务
    
    需要在请求头中提供 Authorization: Bearer <api_key>
    """
    try:
        print(f"📥 收到视频生成请求: model={request.model}")
        print(f"📝 请求内容: {request.dict()}")
        
        if not authorization.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="Invalid authorization header")
        
        api_key = authorization[7:]
        
        request_data = {
            'apiKey': api_key,
            **request.dict()
        }
        
        print(f"🔑 API Key: {api_key[:10]}...{api_key[-4:] if len(api_key) > 14 else ''}")
        
        result = await api_service.create_video_task(request_data)
        
        if not result['success']:
            print(f"❌ 视频任务创建失败: {result.get('error')}")
            raise HTTPException(status_code=500, detail=result['error'])
        
        print(f"✅ 视频任务创建成功")
        return result['data']
    except Exception as e:
        print(f"❌ 视频任务创建异常: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise


@router.get("/api/volcano/video/tasks/{task_id}")
async def get_video_task(
    task_id: str,
    authorization: str = Header(...)
):
    """
    查询单个视频任务状态
    
    需要在请求头中提供 Authorization: Bearer <api_key>
    """
    if not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    api_key = authorization[7:]
    
    result = await api_service.get_video_task(task_id, api_key)
    
    if not result['success']:
        raise HTTPException(status_code=500, detail=result['error'])
    
    return result['data']


@router.get("/api/volcano/video/tasks")
async def get_video_tasks(
    page_num: Optional[int] = 1,
    page_size: Optional[int] = 20,
    status: Optional[str] = None,
    task_ids: Optional[str] = None,
    model: Optional[str] = None,
    authorization: str = Header(...)
):
    """
    批量查询视频任务
    
    需要在请求头中提供 Authorization: Bearer <api_key>
    """
    if not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    api_key = authorization[7:]
    
    query_params = {
        'page_num': page_num,
        'page_size': page_size
    }
    
    if status:
        query_params['filter.status'] = status
    if task_ids:
        query_params['filter.task_ids'] = task_ids
    if model:
        query_params['filter.model'] = model
    
    result = await api_service.get_video_tasks(query_params, api_key)
    
    if not result['success']:
        raise HTTPException(status_code=500, detail=result['error'])
    
    return result['data']


@router.delete("/api/volcano/video/tasks/{task_id}")
async def delete_video_task(
    task_id: str,
    authorization: str = Header(...)
):
    """
    删除视频任务
    
    需要在请求头中提供 Authorization: Bearer <api_key>
    """
    if not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    api_key = authorization[7:]
    
    result = await api_service.delete_video_task(task_id, api_key)
    
    if not result['success']:
        raise HTTPException(status_code=500, detail=result['error'])
    
    return result['data']


@router.post("/api/volcano/visual/{action}")
async def submit_visual_task(
    action: str,
    request: VisualTaskRequest,
    version: str = "2022-08-31",
    x_access_key_id: str = Header(..., alias="X-Access-Key-Id"),
    x_secret_access_key: str = Header(..., alias="X-Secret-Access-Key")
):
    """
    提交视觉服务任务（即梦系列、动作模仿、数字人等）
    
    需要在请求头中提供：
    - X-Access-Key-Id: 访问密钥ID
    - X-Secret-Access-Key: 访问密钥密钥
    """
    try:
        print(f"📥 收到视觉服务请求: action={action}, version={version}")
        print(f"🔑 Access Key ID: {x_access_key_id[:10]}...{x_access_key_id[-4:] if len(x_access_key_id) > 14 else ''}")
        print(f"🔑 Secret Key: {'*' * 20}")
        print(f"📝 请求数据: {request.dict()}")
        
        result = await api_service.submit_visual_task(
            action=action,
            version=version,
            request_data=request.dict(),
            access_key_id=x_access_key_id,
            secret_access_key=x_secret_access_key
        )
        
        if not result['success']:
            print(f"❌ 任务提交失败: {result.get('error')}")
            raise HTTPException(status_code=500, detail=result['error'])
        
        print(f"✅ 任务提交成功")
        return result['data']
    except Exception as e:
        print(f"❌ 异常: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise


@router.post("/api/volcano/visual/{action}/query")
async def query_visual_task(
    action: str,
    request: VisualQueryRequest,
    version: str = "2022-08-31",
    x_access_key_id: str = Header(..., alias="X-Access-Key-Id"),
    x_secret_access_key: str = Header(..., alias="X-Secret-Access-Key")
):
    """
    查询视觉服务任务结果
    
    需要在请求头中提供：
    - X-Access-Key-Id: 访问密钥ID
    - X-Secret-Access-Key: 访问密钥密钥
    """
    try:
        print(f"📥 收到查询请求: action={action}, version={version}")
        print(f"🔑 Access Key ID: {x_access_key_id[:10]}...{x_access_key_id[-4:] if len(x_access_key_id) > 14 else ''}")
        print(f"🔑 Secret Key: {'*' * 20}")
        print(f"📝 查询数据: {request.dict()}")
        
        result = await api_service.query_visual_task(
            action=action,
            version=version,
            request_data=request.dict(),
            access_key_id=x_access_key_id,
            secret_access_key=x_secret_access_key
        )
        
        if not result['success']:
            print(f"❌ 查询失败: {result.get('error')}")
            raise HTTPException(status_code=500, detail=result['error'])
        
        print(f"✅ 查询成功")
        return result['data']
    except Exception as e:
        print(f"❌ 异常: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise


@router.get("/api/volcano/test")
async def test_connection(authorization: str = Header(...)):
    """
    测试API连接
    
    需要在请求头中提供 Authorization: Bearer <api_key>
    """
    if not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    api_key = authorization[7:]
    
    result = await api_service.test_connection(api_key)
    
    return result

