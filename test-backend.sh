#!/bin/bash

echo "======================================"
echo "测试后端服务"
echo "======================================"

# 测试根路径
echo ""
echo "1. 测试根路径 (/):"
curl -s http://localhost:8000/ | jq '.' || echo "后端未启动或JSON解析失败"

# 测试健康检查
echo ""
echo "2. 测试健康检查 (/health):"
curl -s http://localhost:8000/health | jq '.' || echo "健康检查失败"

# 测试API文档
echo ""
echo "3. 测试API文档 (/docs):"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/docs)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ API 文档可访问: http://localhost:8000/docs"
else
    echo "❌ API 文档不可访问 (HTTP $HTTP_CODE)"
fi

# 测试注册端点（OPTIONS 请求 - CORS预检）
echo ""
echo "4. 测试CORS预检 (OPTIONS /api/auth/register):"
curl -s -X OPTIONS \
  http://localhost:8000/api/auth/register \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -i | head -20

# 测试注册端点（POST 请求）
echo ""
echo "5. 测试注册端点 (POST /api/auth/register):"
curl -s -X POST \
  http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "username": "testuser123",
    "email": "test@example.com",
    "password": "password123"
  }' | jq '.' || echo "注册请求失败"

echo ""
echo "======================================"
echo "测试完成"
echo "======================================"

