# 自动化提交脚本使用说明

## 功能概述

该脚本自动完成以下流程：
1. 调用gemini-internal总结本地修改（30字以内）
2. 将总结内容保存到LatestChange.md
3. 添加所有本地改动到git暂存区
4. 使用LatestChange.md内容作为提交信息提交到本地
5. 推送到远端仓库

## 使用方法

### 方法一：使用npm脚本（推荐）
```bash
cd tools
npm run auto-commit
```

### 方法二：直接运行Python脚本
```bash
cd tools
python auto_commit.py
```

### 方法三：直接执行脚本
```bash
cd tools
./auto_commit.py
```

## 注意事项

1. **gemini-internal命令**：脚本中假设gemini-internal命令可以直接调用，如果实际命令不同，请修改脚本中的`summary_command`变量

2. **文件权限**：确保脚本有执行权限，如果没有请运行：
   ```bash
   chmod +x auto_commit.py
   ```

3. **git配置**：确保git已正确配置用户名和邮箱

4. **网络连接**：推送需要网络连接访问远端仓库

## 错误处理

- 如果没有检测到本地修改，脚本会直接退出
- 如果gemini-internal调用失败，会使用默认提交信息
- 如果LatestChange.md文件不存在，会使用默认提交信息
- 每个步骤失败都会停止后续流程

## 自定义配置

如需修改默认行为，可以编辑`auto_commit.py`文件中的相关变量：

- `summary_command`：gemini-internal命令
- 默认提交信息："自动提交: 本地修改更新"