# 火山引擎API签名修复

## 问题描述

视频编辑功能在调用火山引擎API时出现500错误，具体表现为：
- 前端错误：`POST http://localhost:8000/api/volcano/visual/CVSync2AsyncSubmitTask 500 (Internal Server Error)`
- 后端日志显示签名验证失败

## 根本原因

原有的签名实现使用了AWS4签名格式，但火山引擎API使用的是自己的签名规范，主要差异包括：

1. **算法名称**：火山引擎使用 `HMAC-SHA256`，而不是 `AWS4-HMAC-SHA256`
2. **时间戳头**：使用 `X-Date` 而不是 `X-Amz-Date`
3. **凭证范围**：使用 `{date}/{region}/{service}/request` 格式
4. **签名头格式**：使用 `host;x-date` 而不是 `host;x-amz-date`

## 修复方案

### 1. 更新签名算法

在 `backend/signature_v4.py` 中修改 `_sign_cv` 方法：

```python
def _sign_cv(self, method: str, url: str, headers: Dict[str, str], body: Optional[str] = None) -> Dict[str, str]:
    """火山引擎视觉服务签名方法 - 使用火山引擎官方签名格式"""
    # 使用 HMAC-SHA256 算法
    algorithm = 'HMAC-SHA256'
    
    # 使用 X-Date 时间戳头
    timestamp = now.strftime('%Y%m%dT%H%M%SZ')
    
    # 火山引擎凭证范围格式
    credential_scope = f"{date_stamp}/{self.region}/cv/request"
    
    # 火山引擎签名头格式
    signed_headers = "host;x-date"
    authorization = f"{algorithm} Credential={self.access_key_id}/{credential_scope}, SignedHeaders={signed_headers}, Signature={signature}"
```

### 2. 添加火山引擎规范请求方法

新增 `_create_volcano_canonical_request` 方法：

```python
def _create_volcano_canonical_request(self, method: str, path: str, query_string: str, 
                                     headers: Dict[str, str], body: Optional[str], host: str, timestamp: str) -> str:
    """创建火山引擎规范请求"""
    # 使用 x-date 而不是 x-amz-date
    canonical_headers = f"host:{host}\nx-date:{timestamp}\n"
    signed_headers = "host;x-date"
```

## 验证结果

修复后的签名格式符合火山引擎官方文档要求：

```
Authorization: HMAC-SHA256 Credential=AKLTYWViMTVmZGYzM2E0NDI5Mzk2MDZjNjFmMjc2MjRjMzg/20251020/cn-north-1/cv/request, SignedHeaders=host;x-date, Signature=4e5632f9117c6f63ea31acc735dffdea65b6af5ae77bda450654adb50698ca71
```

## 影响范围

此修复影响所有使用火山引擎视觉服务API的功能：
- 视频编辑 (CVSync2AsyncSubmitTask)
- 即梦图片生成 (CVSync2AsyncSubmitTask)
- 即梦视频生成 (CVSync2AsyncSubmitTask)
- 动作模仿 (CVSync2AsyncSubmitTask)
- 数字人 (CVSync2AsyncSubmitTask)

## 测试建议

1. 使用有效的火山引擎访问密钥测试视频编辑功能
2. 验证所有视觉服务API调用是否正常工作
3. 检查签名生成的一致性

## 参考文档

- [火山引擎API签名调用指南](https://www.volcengine.com/docs/6348/69824)
- [火山引擎视觉服务API文档](https://www.volcengine.com/docs/6348/69824)
