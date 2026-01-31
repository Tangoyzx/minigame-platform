# 🎮 微信小游戏集合平台

一个可扩展的微信小游戏平台，包含多个有趣的小游戏！

## 📖 项目简介

这是一个微信小游戏集合平台，玩家可以在主界面选择不同的小游戏进入游玩。项目采用可扩展的架构设计，所有小游戏继承统一基类，便于后续新游戏的添加。

### 特色功能

- 🏠 **游戏大厅**：精美的游戏选择界面
- 🐦 **FlappyBird**：经典的小鸟飞行游戏
- ⚡ **物理系统**：可复用的物理引擎，支持碰撞检测和调试可视化
- 🛠️ **自动化上传**：一键上传到微信平台

## 📁 项目结构

```
minigame-platform/
├── game/                    # 微信小游戏主体
│   ├── game.js              # 游戏入口
│   ├── game.json            # 游戏配置
│   ├── project.config.json  # 项目配置
│   └── js/
│       ├── base/            # 基础类
│       │   └── BaseGame.js  # 游戏基类
│       ├── physics/         # 物理系统
│       │   ├── PhysicsWorld.js   # 物理世界
│       │   ├── PhysicsBody.js    # 物理体基类
│       │   ├── CircleBody.js     # 圆形碰撞体
│       │   └── RectBody.js       # 矩形碰撞体
│       ├── manager/
│       │   └── GameManager.js    # 游戏管理器
│       ├── scenes/
│       │   └── GameLobby.js      # 游戏大厅
│       ├── games/
│       │   └── flappybird/       # FlappyBird游戏
│       └── utils/
│           └── utils.js          # 工具函数
├── tools/                   # 工具脚本
│   ├── upload.js            # 自动上传脚本
│   ├── package.json
│   └── README.md
└── docs/                    # 项目文档
    ├── README.md            # 本文件
    ├── AI-Development-Guide.md    # AI开发指南
    └── Cloud-Server-Setup.md      # 云服务器配置指南
```

## 🚀 快速开始

### 1. 使用微信开发者工具打开

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开工具，选择 **小游戏** 项目
3. 导入 `game` 文件夹
4. 点击编译即可预览

### 2. 使用自动化工具上传

详见 `tools/README.md`

## 🎮 游戏列表

### FlappyBird

经典的小鸟飞行游戏！

- 点击屏幕让小鸟往上飞
- 躲避管道障碍物
- 每成功穿过一个管道得 1 分
- 初始拥有 3 点生命值
- 碰到管道会减少 1 点生命值，并获得 1 秒无敌时间
- 落地会直接死亡，不管剩余生命值
- 上下两条管道之间的空间会随机变化，增加游戏挑战性

**物理调试功能**：点击左下角的"调试"按钮，可以看到碰撞体的边界！

**生命值系统**：
- 初始生命值：3 点
- 碰撞管道：-1 生命值，获得 1 秒无敌时间
- 落地：直接死亡
- 无敌状态：小鸟会变成蓝色并闪烁

**补血包系统**：
- 生成概率：晚稻尖有 20% 的概率出现补血包
- 生成条件：当生命值低于最大值时才会生成
- 效果：收集后增加 1 点生命值（不超过最大值）
- 外观：红色圆形，带有十字标记，会闪烁发光

### 贪吃蛇

经典的贪吃蛇游戏！

- 按住屏幕并拖动来控制蛇的移动方向
- 松手后蛇会沿当前方向继续移动
- 每吃一个食物得 10 分，蛇身变长
- 碰到墙壁或自己的身体游戏结束

**特色功能**：独特的触摸拖动控制方式，比传统按键更直观！

## 🔧 架构说明

### 游戏基类 (BaseGame)

所有小游戏都继承自 `BaseGame`，需要实现以下方法：

```javascript
class MyGame extends BaseGame {
  init() {}           // 初始化游戏
  update(dt) {}       // 更新游戏逻辑
  render(ctx) {}      // 渲染游戏画面
  onTouchStart(touch) {} // 触摸事件
  destroy() {}        // 销毁资源
}
```

### 物理系统

独立可复用的物理系统，包含：

- **PhysicsWorld**：物理世界管理器
- **PhysicsBody**：物理体基类（位置、速度、加速度）
- **CircleBody**：圆形碰撞体
- **RectBody**：矩形碰撞体

支持的碰撞检测：
- 圆形 vs 圆形
- 圆形 vs 矩形
- 矩形 vs 矩形

### 添加新游戏

1. 在 `js/games/` 目录下创建新游戏文件夹
2. 创建游戏主类，继承 `BaseGame`
3. 在 `game.js` 中注册游戏：

```javascript
import NewGame from './js/games/newgame/NewGame.js';

gameManager.registerGame({
  id: 'newgame',
  name: '新游戏',
  description: '游戏描述',
  icon: '🎯',
  GameClass: NewGame
});
```

## 📝 开发笔记

### 跨环境开发

如果你需要在云服务器或其他环境使用AI(如Gemini CLI)继续开发:
- 📖 查看 `AI-Development-Guide.md` - AI开发完整指南
- ☁️ 查看 `Cloud-Server-Setup.md` - 云服务器快速配置

这些文档会帮助AI工具正确理解和遵守项目规则。

### 微信小游戏特点

- 入口文件必须是 `game.js`
- 使用 `wx.createCanvas()` 创建画布
- 使用 `wx.onTouchStart/End` 处理触摸
- 使用 `requestAnimationFrame` 实现游戏循环

### 兼容性处理

微信小游戏环境可能不支持某些较新的 Canvas API，项目已做兼容性处理：

- **roundRect()**: 使用自定义 `drawRoundRect()` 函数代替，手动绘制圆角矩形
- 所有绘图相关的工具函数都在 `utils/utils.js` 中提供

### 物理系统使用示例

```javascript
// 创建物理世界
const world = new PhysicsWorld();

// 创建圆形碰撞体（小鸟）
const bird = new CircleBody(100, 200, 20);
bird.ay = 1000; // 设置重力
world.addBody(bird);

// 创建矩形碰撞体（管道）
const pipe = new RectBody(300, 200, 60, 400);
world.addBody(pipe);

// 在游戏循环中更新
world.update(deltaTime);

// 碰撞检测
if (world.circleVsRect(bird, pipe)) {
  console.log('碰撞了！');
}

// 开启调试显示
world.setDebugMode(true);
world.debugDraw(ctx);
```

## 📄 License

MIT
