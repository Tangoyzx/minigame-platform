/**
 * 游戏管理器 - GameManager
 * 
 * 这是整个游戏平台的"大脑"！
 * 它负责：
 * 1. 创建和管理画布（Canvas）- 游戏画面显示的地方
 * 2. 管理游戏主循环 - 让游戏动起来
 * 3. 处理触摸事件 - 响应玩家的点击
 * 4. 管理场景切换 - 在大厅和各个游戏之间切换
 * 
 * 使用"单例模式"：整个游戏只有一个 GameManager
 */

import GameLobby from '../scenes/GameLobby.js';

// 单例实例
let instance = null;

export default class GameManager {
  /**
   * 获取 GameManager 的唯一实例
   * 单例模式确保整个游戏只有一个管理器
   */
  static getInstance() {
    if (!instance) {
      instance = new GameManager();
    }
    return instance;
  }
  
  /**
   * 构造函数
   * 私有构造，只能通过 getInstance() 获取实例
   */
  constructor() {
    // 画布相关
    this.canvas = null;       // 主画布
    this.ctx = null;          // 画布上下文（用于绑定）
    
    // 屏幕尺寸
    this.screenWidth = 0;
    this.screenHeight = 0;
    
    // 当前场景（可以是大厅或某个游戏）
    this.currentScene = null;
    
    // 游戏大厅实例
    this.lobby = null;
    
    // 已注册的游戏列表
    this.registeredGames = [];
    
    // 游戏循环相关
    this.lastTime = 0;        // 上一帧的时间戳
    this.isRunning = false;   // 是否正在运行
    
    // 触摸事件处理函数（需要保存引用以便移除）
    this.touchStartHandler = null;
    this.touchMoveHandler = null;
    this.touchEndHandler = null;
  }
  
  /**
   * 初始化游戏管理器
   * 创建画布、获取屏幕信息、设置触摸事件
   */
  init() {
    console.log('🎮 GameManager 初始化中...');
    
    // 1. 获取系统信息（屏幕尺寸等）
    const systemInfo = wx.getSystemInfoSync();
    this.screenWidth = systemInfo.windowWidth;
    this.screenHeight = systemInfo.windowHeight;
    console.log(`📱 屏幕尺寸: ${this.screenWidth} x ${this.screenHeight}`);
    
    // 2. 创建主画布
    // 微信小游戏中，第一个创建的 canvas 就是主画布，会自动全屏显示
    this.canvas = wx.createCanvas();
    this.ctx = this.canvas.getContext('2d');
    
    // 3. 设置画布尺寸
    this.canvas.width = this.screenWidth;
    this.canvas.height = this.screenHeight;
    
    // 4. 注册所有游戏
    this.registerAllGames();
    
    // 5. 创建游戏大厅
    this.lobby = new GameLobby(this);
    
    // 6. 设置触摸事件监听
    this.setupTouchEvents();
    
    console.log('✅ GameManager 初始化完成');
  }
  
  /**
   * 注册所有可用的游戏
   * 这个方法现在为空，因为游戏注册已经在game.js中完成
   */
  registerAllGames() {
    console.log('📝 游戏注册已在game.js中完成');
    console.log(`✅ 已注册 ${this.registeredGames.length} 个游戏`);
  }
  
  /**
   * 设置触摸事件监听
   * 微信小游戏使用 wx.onTouchStart、wx.onTouchMove 和 wx.onTouchEnd
   */
  setupTouchEvents() {
    // 触摸开始
    this.touchStartHandler = (event) => {
      const touch = event.touches[0];
      if (touch && this.currentScene) {
        this.currentScene.onTouchStart({
          x: touch.clientX,
          y: touch.clientY
        });
      }
    };
    
    // 触摸移动
    this.touchMoveHandler = (event) => {
      const touch = event.touches[0];
      if (touch && this.currentScene && this.currentScene.onTouchMove) {
        this.currentScene.onTouchMove({
          x: touch.clientX,
          y: touch.clientY
        });
      }
    };
    
    // 触摸结束
    this.touchEndHandler = (event) => {
      const touch = event.changedTouches[0];
      if (touch && this.currentScene) {
        this.currentScene.onTouchEnd({
          x: touch.clientX,
          y: touch.clientY
        });
      }
    };
    
    // 注册事件
    wx.onTouchStart(this.touchStartHandler);
    wx.onTouchMove(this.touchMoveHandler);
    wx.onTouchEnd(this.touchEndHandler);
  }
  
  /**
   * 注册一个小游戏
   * 将游戏信息添加到列表中，游戏大厅会显示这些游戏
   * 
   * @param {Object} gameInfo - 游戏信息
   * @param {string} gameInfo.id - 游戏唯一标识
   * @param {string} gameInfo.name - 游戏名称
   * @param {string} gameInfo.description - 游戏描述
   * @param {string} gameInfo.icon - 游戏图标（emoji 或图片路径）
   * @param {Function} gameInfo.GameClass - 游戏类（继承自 BaseGame）
   */
  registerGame(gameInfo) {
    this.registeredGames.push(gameInfo);
    console.log(`📝 注册游戏: ${gameInfo.name}`);
  }
  
  /**
   * 获取所有已注册的游戏
   */
  getRegisteredGames() {
    return this.registeredGames;
  }
  
  /**
   * 显示游戏大厅
   */
  showLobby() {
    console.log('🏠 显示游戏大厅');
    
    // 如果当前有游戏在运行，先销毁它
    if (this.currentScene && this.currentScene !== this.lobby) {
      this.currentScene.destroy();
    }
    
    // 切换到大厅
    this.currentScene = this.lobby;
    this.lobby.init();
  }
  
  /**
   * 切换到指定游戏
   * 
   * @param {Object} gameInfo - 游戏信息
   */
  switchToGame(gameInfo) {
    console.log(`🎮 切换到游戏: ${gameInfo.name}`);
    
    // 如果当前有场景，先销毁
    if (this.currentScene) {
      this.currentScene.destroy();
    }
    
    // 根据游戏ID动态导入游戏类
    this.loadGameClass(gameInfo.id).then(GameClass => {
      if (GameClass) {
        // 创建新游戏实例并初始化
        const game = new GameClass(this);
        this.currentScene = game;
        game.init();
        console.log(`✅ ${gameInfo.name} 游戏启动成功`);
      } else {
        console.error(`❌ 无法加载游戏类: ${gameInfo.name}`);
        // 如果加载失败，返回大厅
        this.showLobby();
      }
    }).catch(error => {
      console.error(`❌ 加载游戏类失败: ${gameInfo.name}`, error);
      this.showLobby();
    });
  }
  
  /**
   * 动态加载游戏类
   * 
   * @param {string} gameId - 游戏ID
   * @returns {Promise<Function>} - 游戏类
   */
  async loadGameClass(gameId) {
    try {
      // 由于游戏类已经在game.js中导入，我们直接从注册的游戏信息中获取
      const gameInfo = this.registeredGames.find(game => game.id === gameId);
      if (gameInfo && gameInfo.GameClass) {
        return gameInfo.GameClass;
      }
      
      console.error(`❌ 未找到游戏类: ${gameId}`);
      return null;
    } catch (error) {
      console.error(`❌ 加载游戏类失败: ${gameId}`, error);
      return null;
    }
  }
  
  /**
   * 启动游戏主循环
   * 使用 requestAnimationFrame 实现约 60fps 的循环
   */
  startGameLoop() {
    if (this.isRunning) {
      return; // 已经在运行了
    }
    
    this.isRunning = true;
    this.lastTime = Date.now();
    
    console.log('🔄 游戏主循环启动');
    
    // 主循环函数
    const loop = () => {
      if (!this.isRunning) {
        return;
      }
      
      // 计算 deltaTime（距离上一帧的时间，单位：秒）
      const currentTime = Date.now();
      const deltaTime = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;
      
      // 限制 deltaTime 最大值，避免切后台回来时跳帧太多
      const clampedDeltaTime = Math.min(deltaTime, 0.1);
      
      // 更新当前场景
      if (this.currentScene) {
        this.currentScene.update(clampedDeltaTime);
      }
      
      // 清空画布
      this.ctx.clearRect(0, 0, this.screenWidth, this.screenHeight);
      
      // 渲染当前场景
      if (this.currentScene) {
        this.currentScene.render(this.ctx);
      }
      
      // 继续下一帧
      requestAnimationFrame(loop);
    };
    
    // 启动循环
    loop();
  }
  
  /**
   * 停止游戏主循环
   */
  stopGameLoop() {
    this.isRunning = false;
    console.log('⏹️ 游戏主循环停止');
  }
}
