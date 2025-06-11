@echo off
echo 正在启动中石油配电站障碍处理AI助手...
echo.

cd /d "C:\Users\Zhaol\Desktop\机器视觉文献爬虫"

echo 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

echo 启动应用服务器...
start /b npm start

echo 等待服务器启动...
timeout /t 10 /nobreak >nul

echo 打开浏览器...
start http://localhost:3000

echo.
echo 配电站AI助手已启动！
echo 如果浏览器没有自动打开，请手动访问: http://localhost:3000
echo.
echo 按任意键关闭此窗口...
pause >nul 