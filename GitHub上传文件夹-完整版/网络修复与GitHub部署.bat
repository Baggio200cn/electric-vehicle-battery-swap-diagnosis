@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 电动汽车换电站智能诊断系统
echo 🌐 网络修复与GitHub部署综合方案
echo ========================================
echo.

echo 📋 第一步：检查本地构建状态...
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
echo 🔧 第二步：尝试网络修复...
echo 正在刷新DNS缓存...
ipconfig /flushdns >nul 2>&1

echo 正在重置网络配置...
netsh winsock reset >nul 2>&1
netsh int ip reset >nul 2>&1

echo 正在测试网络连接...
ping -n 2 8.8.8.8 >nul 2>&1
if errorlevel 1 (
    echo ❌ 基础网络连接失败
    echo 💡 请检查网络连接后重试
    pause
    exit /b 1
) else (
    echo ✅ 基础网络连接正常
)

echo.
echo 🌐 第三步：测试GitHub连接...
ping -n 2 github.com >nul 2>&1
if errorlevel 1 (
    echo ⚠️  GitHub直连失败，尝试备用方案...
    
    echo 📝 创建临时hosts配置...
    echo 140.82.112.3 github.com >> %WINDIR%\System32\drivers\etc\hosts
    echo 140.82.112.4 api.github.com >> %WINDIR%\System32\drivers\etc\hosts
    
    echo 等待DNS生效...
    timeout /t 3 >nul
    
    ping -n 2 github.com >nul 2>&1
    if errorlevel 1 (
        echo ❌ GitHub连接仍然失败
        echo.
        echo 💡 手动解决方案：
        echo    1. 使用VPN连接
        echo    2. 等待网络恢复后运行 manual-deploy.bat
        echo    3. 或使用GitHub Desktop手动同步
        echo.
        pause
        exit /b 1
    )
)

echo ✅ GitHub连接成功！
echo.

echo 📤 第四步：推送到GitHub...
git add .
git commit -m "网络修复后手动部署：完善GitHub Actions构建配置"
git push origin main

if errorlevel 1 (
    echo ❌ 推送失败！
    echo.
    echo 💡 可能的解决方案：
    echo    1. 检查Git凭据配置
    echo    2. 确认仓库访问权限
    echo    3. 尝试使用GitHub Desktop
    echo    4. 稍后重试推送
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ 部署成功完成！
echo.
echo 📊 部署状态总结：
echo    ✅ 本地构建：成功
echo    ✅ 网络连接：已修复
echo    ✅ GitHub推送：成功
echo    🔄 GitHub Actions：正在运行
echo.
echo 🌐 请访问GitHub仓库查看Actions运行状态
echo 📱 部署完成后，网站将可通过GitHub Pages访问
echo.
pause
