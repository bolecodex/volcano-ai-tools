#!/bin/bash

# Python 3.8兼容性修复脚本

echo "🔧 修复Python 3.8兼容性问题..."

# 检查当前目录
if [ ! -f "backend/schemas.py" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 备份原文件
echo "💾 备份原文件..."
cp backend/schemas.py backend/schemas.py.backup
cp backend/requirements.txt backend/requirements.txt.backup

# 修复schemas.py中的类型注解
echo "🔧 修复类型注解..."
sed -i 's/list\[/List[/g' backend/schemas.py
sed -i 's/dict\[/Dict[/g' backend/schemas.py
sed -i 's/tuple\[/Tuple[/g' backend/schemas.py
sed -i 's/set\[/Set[/g' backend/schemas.py

# 添加必要的import
if ! grep -q "from typing import.*List" backend/schemas.py; then
    sed -i 's/from typing import Optional/from typing import Optional, List, Dict, Tuple, Set/' backend/schemas.py
fi

# 修复requirements.txt中的email-validator版本
echo "🔧 修复email-validator版本..."
sed -i 's/email-validator==2.1.0/email-validator>=2.0.0,<2.1.0/' backend/requirements.txt

# 检查其他可能的Python 3.9+语法
echo "🔍 检查其他兼容性问题..."
grep -r "list\[" backend/ --include="*.py" || echo "✅ 未发现list[]语法"
grep -r "dict\[" backend/ --include="*.py" || echo "✅ 未发现dict[]语法"
grep -r "tuple\[" backend/ --include="*.py" || echo "✅ 未发现tuple[]语法"
grep -r "set\[" backend/ --include="*.py" || echo "✅ 未发现set[]语法"

echo "✅ Python 3.8兼容性修复完成！"
echo "🚀 现在可以运行: ./start-cloud-simple.sh"
