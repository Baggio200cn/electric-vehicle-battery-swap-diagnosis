@echo off
echo ========================================
echo 🚀 电动汽车换电站智能诊断系统
echo 📦 手动GitHub部署脚本
echo ========================================
echo.

echo 📋 检查构建文件...
if not exist "build" (
    echo ❌ 构建文件夹不存在，正在构建...
    node build-no-eslint.js
    if errorlevel 1 (
        echo ❌ 构建失败！
        pause
        exit /b 1
    )
) else (
    echo ✅ 构建文件夹已存在
)

echo.
echo 📡 检查网络连接...
ping -n 1 github.com >nul 2>&1
if errorlevel 1 (
    echo ❌ 无法连接到GitHub，请检查网络连接
    echo 💡 建议：
    echo    1. 检查网络连接
    echo    2. 尝试使用VPN
    echo    3. 稍后重试
    pause
    exit /b 1
)

echo ✅ 网络连接正常
echo.

echo 📤 准备推送到GitHub...
git add .
git commit -m "手动部署：修复GitHub Actions构建问题"
git push origin main

if errorlevel 1 (
    echo ❌ 推送失败！
    echo 💡 可能的解决方案：
    echo    1. 检查Git凭据
    echo    2. 确认仓库权限
    echo    3. 重试推送
    pause
    exit /b 1
)

echo.
echo ✅ 部署完成！
echo 🌐 GitHub Actions将自动构建和部署
echo 📱 请访问GitHub仓库查看Actions状态
echo.
pause 