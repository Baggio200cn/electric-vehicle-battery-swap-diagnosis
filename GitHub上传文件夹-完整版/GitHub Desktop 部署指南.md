# 🚀 GitHub Desktop 完整部署指南

## 📥 第一步：下载和安装

### 1.1 下载GitHub Desktop
- 访问：https://desktop.github.com/
- 点击"Download for Windows"
- 下载完成后运行安装程序

### 1.2 安装过程
- 双击下载的安装文件
- 按照安装向导完成安装
- 安装完成后会自动启动GitHub Desktop

## 🔐 第二步：登录GitHub账户

### 2.1 首次启动
- 启动GitHub Desktop
- 点击"Sign in to GitHub.com"
- 输入您的GitHub用户名和密码
- 完成两步验证（如果启用）

### 2.2 授权应用
- 在浏览器中确认授权GitHub Desktop
- 返回GitHub Desktop应用

## 📁 第三步：添加现有仓库

### 3.1 添加仓库的方法
**方法A：从GitHub克隆**
- 点击"Clone a repository from the Internet"
- 在"GitHub.com"标签页中找到您的仓库
- 选择仓库并点击"Clone"

**方法B：添加本地仓库**
- 点击"Add an existing repository from your hard drive"
- 浏览到您的项目文件夹：`C:\Users\Zhaol\Desktop\机器视觉文献爬虫`
- 点击"Add repository"

### 3.2 验证仓库添加成功
- 在GitHub Desktop左侧应该显示您的仓库名
- 中间区域显示文件更改列表

## 🔄 第四步：查看和提交更改

### 4.1 查看更改的文件
您应该看到以下3个修改的文件：
- ✅ `src/App.tsx` - 状态持久化修复
- ✅ `src/types.ts` - 接口优化  
- ✅ `src/components/KnowledgeGraph/index.tsx` - 算法优化

### 4.2 检查更改内容
- 点击任意文件查看具体更改
- 绿色行表示新增内容
- 红色行表示删除内容
- 确认更改符合预期

### 4.3 提交更改
1. **添加提交信息**：
   - 在左下角"Summary"框中输入：
     ```
     🔥 修复状态持久化和知识图谱优化
     ```
   
2. **添加详细描述**（可选）：
   ```
   - 修复localStorage持久化机制，解决刷新后数据丢失问题
   - 优化知识图谱算法，提高连接阈值和布局效果
   - 完善自定义标识上传/删除功能
   ```

3. **点击"Commit to main"按钮**

## 🌐 第五步：推送到GitHub

### 5.1 推送更改
- 提交完成后，点击右上角的"Push origin"按钮
- GitHub Desktop会开始上传更改到GitHub

### 5.2 网络优化特性
GitHub Desktop在推送时会：
- 自动检测网络环境
- 使用优化的连接协议
- 在网络不稳定时自动重试
- 显示详细的进度信息

### 5.3 推送成功确认
- 推送成功后，"Push origin"按钮会消失
- 状态栏显示"Last fetched just now"
- 可以点击"View on GitHub"查看在线仓库

## 🎯 第六步：验证部署

### 6.1 检查GitHub Actions
1. 在GitHub Desktop中点击"View on GitHub"
2. 在GitHub网页中点击"Actions"标签页
3. 确认自动构建流程已启动
4. 等待构建完成（通常2-5分钟）

### 6.2 访问部署网站
- 构建完成后访问您的GitHub Pages网站
- 测试以下功能：
  - ✅ 添加自定义标识后刷新页面
  - ✅ 上传材料后刷新页面
  - ✅ 查看知识图谱显示效果

## 🔧 故障排除

### 问题1：无法连接到GitHub
**解决方案**：
- 检查网络连接
- 尝试重启GitHub Desktop
- 检查防火墙设置
- 尝试使用VPN

### 问题2：推送失败
**解决方案**：
- 点击"Try again"重试
- 检查GitHub账户权限
- 确认仓库访问权限
- 尝试先"Fetch origin"再推送

### 问题3：文件更改未显示
**解决方案**：
- 点击"Repository" → "Refresh"
- 确认文件确实已修改
- 检查.gitignore文件设置

### 问题4：认证失败
**解决方案**：
- 重新登录GitHub账户
- 检查两步验证设置
- 生成Personal Access Token（如需要）

## 💡 高级技巧

### 技巧1：批量操作
- 可以一次性选择多个文件提交
- 使用Ctrl+A选择所有更改

### 技巧2：分支管理
- 可以创建新分支进行测试
- 合并分支到main分支

### 技巧3：历史记录
- 查看提交历史
- 比较不同版本的差异

## 🎉 成功标志

当您看到以下情况时，说明部署成功：

1. ✅ GitHub Desktop显示"No local changes"
2. ✅ GitHub Actions构建成功（绿色勾号）
3. ✅ 网站功能测试通过：
   - 状态持久化正常
   - 自定义标识不再消失
   - 知识图谱显示优化

## 📞 需要帮助？

如果遇到问题，请提供：
- GitHub Desktop的错误信息截图
- 网络环境描述
- 具体的操作步骤

---

**记住**：GitHub Desktop的网络优化功能通常能够解决大部分连接问题，这是最可靠的部署方案！🚀 