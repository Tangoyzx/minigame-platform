/**
 * 微信小游戏入口文件
 * 这是整个游戏的起点，就像一本书的第一页！
 * 
 * 微信小游戏会自动执行这个文件来启动游戏
 */

// 导入游戏管理器 - 它负责管理整个游戏的运行
import GameManager from './js/manager/GameManager.js';

// 导入游戏大厅 - 玩家选择游戏的地方
import GameLobby from './js/scenes/GameLobby.js';

// 导入 FlappyBird 游戏
import FlappyBird from './js/games/flappybird/FlappyBird.js';

// 导入贪吃蛇游戏
import SnakeGame from './js/games/snake/SnakeGame.js';

// 导入2048游戏
import Game2048 from './js/games/2048/2048Game.js';

// 导入连连看游戏
import LinkGame from './js/games/linkgame/index.js';

/**
 * 游戏启动函数
 * 就像按下游戏机的开机按钮一样！
 */
function startGame() {
  console.log('🎮 小游戏集合平台启动中...');
  
  // 获取游戏管理器（单例模式，整个游戏只有一个管理器）
  const gameManager = GameManager.getInstance();
  
  // 初始化游戏管理器（创建画布、设置触摸事件等）
  gameManager.init();
  
  // 注册所有可用的小游戏
  // 每注册一个游戏，游戏大厅里就会多一个选项
  gameManager.registerGame({
    id: 'flappybird',
    name: 'Flappy Bird',
    description: '点击屏幕让小鸟飞起来，躲避管道！',
    icon: '🐦',
    GameClass: FlappyBird
  });
  
  // 注册贪吃蛇游戏
  gameManager.registerGame({
    id: 'snake',
    name: '贪吃蛇',
    description: '控制小蛇吃食物，越吃越长！',
    icon: '🐍',
    GameClass: SnakeGame
  });
  
  // 注册2048游戏
  gameManager.registerGame({
    id: '2048',
    name: '2048',
    description: '滑动合并相同数字，目标是合成2048！',
    icon: '🔢',
    GameClass: Game2048
  });
  
  // 注册连连看游戏
  gameManager.registerGame({
    id: 'linkgame',
    name: '连连看',
    description: '找到相同的图案并用不超过两个拐角的线连接！',
    icon: '🔗',
    GameClass: LinkGame
  });
  
  // 显示游戏大厅（主界面）
  gameManager.showLobby();
  
  // 启动游戏主循环（让游戏动起来！）
  gameManager.startGameLoop();
  
  console.log('✅ 游戏启动完成！');
}

// 启动游戏！
startGame();
