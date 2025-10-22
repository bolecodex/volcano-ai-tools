#!/bin/bash

# 兼容旧版Node.js的前端启动脚本

echo "🌐 启动前端服务 (兼容模式)..."

cd frontend

# 检查Node.js版本
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
echo "📦 当前Node.js版本: v$(node --version | cut -d'v' -f2)"

if [ "$NODE_VERSION" -lt 14 ]; then
    echo "⚠️  Node.js版本过低，尝试使用兼容模式..."
    
    # 清理node_modules
    echo "🧹 清理node_modules..."
    rm -rf node_modules package-lock.json
    
    # 安装兼容版本的依赖
    echo "📦 安装兼容版本依赖..."
    npm install --legacy-peer-deps
    
    # 修改webpack配置以兼容旧版本
    echo "🔧 修改webpack配置..."
    if [ -f webpack.config.js ]; then
        # 备份原配置
        cp webpack.config.js webpack.config.js.backup
        
        # 创建兼容版本的webpack配置
        cat > webpack.config.js << 'EOF'
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ],
  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: true
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
EOF
    fi
    
    # 启动开发服务器
    echo "🚀 启动开发服务器..."
    npx webpack serve --mode development --port 3000
    
else
    echo "✅ Node.js版本支持，使用标准模式..."
    npm start
fi
