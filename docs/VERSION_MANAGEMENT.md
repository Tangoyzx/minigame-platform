# 版本管理指南

## 概述

本项目现在使用统一的版本配置文件来管理版本号，确保游戏界面和上传工具使用相同的版本信息。

## 配置文件位置

### 1. 主配置文件 (JSON格式)
- 文件路径: `game/config/version.json`
- 用途: Node.js 环境使用 (upload.js)
- 格式:
```json
{
  "version": "1.2.0",
  "description": "小游戏集合平台 - 新增贪吃蛇游戏"
}
```

### 2. ES6模块配置文件
- 文件路径: `game/config/version.js`
- 用途: 小游戏环境使用 (GameLobby.js)
- 格式: ES6模块导出

## 使用方法

### 在 upload.js 中使用
```javascript
// 读取版本配置
const versionConfigPath = path.join(__dirname, '../game/config/version.json');
let versionConfig = {};

try {
  versionConfig = JSON.parse(fs.readFileSync(versionConfigPath, 'utf8'));
} catch (error) {
  console.warn('⚠️  警告: 无法读取版本配置文件，使用默认配置');
  versionConfig = {
    version: '1.2.0',
    description: '小游戏集合平台 - 新增贪吃蛇游戏'
  };
}

// 使用版本号
const config = {
  version: versionConfig.version,
  desc: versionConfig.description
};
```

### 在 GameLobby.js 中使用
```javascript
// 导入版本配置
import versionConfig from '../../config/version.js';

// 使用版本号
renderFooter(ctx) {
  ctx.fillText(`${versionConfig.getVersionWithPrefix()} | Made with ❤️`, x, y);
}
```

## 更新版本号

当需要更新版本时，只需修改以下文件：

1. **更新 `game/config/version.json`**:
   ```json
   {
     "version": "1.3.0",
     "description": "小游戏集合平台 - 新增连连看游戏"
   }
   ```

2. **更新 `game/config/version.js`**:
   ```javascript
   export default {
     major: 1,
     minor: 3,
     patch: 0,
     // ... 其他方法保持不变
   };
   ```

## 版本号规范

- **主版本号 (major)**: 重大功能更新，不向下兼容
- **次版本号 (minor)**: 新功能添加，向下兼容
- **修订版本号 (patch)**: Bug修复，向下兼容

## 验证配置

运行以下命令验证配置是否正确：
```bash
cd /data/workspace/codeworkspace/minigame-platform
node -e "console.log(require('./game/config/version.json'))"
```

## 注意事项

1. 两个配置文件必须保持版本号一致
2. 修改版本号后需要重新上传游戏才能生效
3. 版本描述应该清晰说明本次更新的主要内容

## 文件结构

```
game/config/
├── version.js     # ES6模块版本配置
└── version.json   # JSON版本配置
```

通过这种配置方式，我们实现了版本号的统一管理，避免了硬编码版本号带来的不一致问题。