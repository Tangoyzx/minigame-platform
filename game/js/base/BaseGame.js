/**
 * 游戏基类 - BaseGame
 * 
 * 这是所有小游戏的"爸爸类"！
 * 所有小游戏（比如 FlappyBird、贪吃蛇等）都要继承这个类。
 * 
 * 就像所有汽车都有方向盘、油门、刹车一样，
 * 所有游戏都有：初始化、更新、渲染、暂停、恢复、销毁这些基本功能。
 */

import { drawRoundRect } from '../utils/utils.js';

export default class BaseGame {
  /**
   * 构造函数 - 创建游戏时自动调用
   * @param {GameManager} gameManager - 游戏管理器，用于访问画布和返回大厅
   */
  constructor(gameManager) {
    // 保存游戏管理器的引用，以便后续使用
    this.gameManager = gameManager;
    
    // 获取画布和绑定上下文
    this.canvas = gameManager.canvas;
    this.ctx = gameManager.ctx;
    
    // 获取屏幕尺寸
    this.screenWidth = gameManager.screenWidth;
    this.screenHeight = gameManager.screenHeight;
    
    // 游戏状态标记
    this.isRunning = false;   // 游戏是否正在运行
    this.isPaused = false;    // 游戏是否暂停
    this.isGameOver = false;  // 游戏是否结束
    
    // 返回按钮的位置和大小（左上角）
    this.backButton = {
      x: 20,
      y: 40,
      width: 80,
      height: 40
    };
  }
  
  /**
   * 初始化游戏
   * 子类需要重写这个方法来设置游戏的初始状态
   * 比如：创建小鸟、设置分数为0等
   */
  init() {
    this.isRunning = true;
    this.isPaused = false;
    this.isGameOver = false;
    console.log('🎮 游戏初始化完成');
  }
  
  /**
   * 更新游戏逻辑
   * 每一帧都会调用这个方法（大约每秒60次）
   * 
   * @param {number} deltaTime - 距离上一帧的时间（秒）
   *                             用于保证不同设备上游戏速度一致
   * 
   * 子类需要重写这个方法来更新游戏状态
   * 比如：移动小鸟、检查碰撞等
   */
  update(deltaTime) {
    // 如果游戏暂停或结束，不更新
    if (this.isPaused || this.isGameOver) {
      return;
    }
    // 子类实现具体逻辑
  }
  
  /**
   * 渲染游戏画面
   * 每一帧都会调用这个方法来绘制画面
   * 
   * @param {CanvasRenderingContext2D} ctx - 画布上下文，用于绘制图形
   * 
   * 子类需要重写这个方法来绘制游戏画面
   * 比如：画背景、画小鸟、画管道等
   */
  render(ctx) {
    // 子类实现具体渲染
  }
  
  /**
   * 渲染返回按钮
   * 所有游戏都有一个返回大厅的按钮
   */
  renderBackButton(ctx) {
    const btn = this.backButton;
    
    // 绘制半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    drawRoundRect(ctx, btn.x, btn.y, btn.width, btn.height, 8);
    ctx.fill();
    
    // 绘制文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px PingFang SC';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('← 返回', btn.x + btn.width / 2, btn.y + btn.height / 2);
  }
  
  /**
   * 暂停游戏
   * 当玩家切到后台或点击暂停按钮时调用
   */
  pause() {
    this.isPaused = true;
    console.log('⏸️ 游戏暂停');
  }
  
  /**
   * 恢复游戏
   * 当玩家从后台切回来或点击继续按钮时调用
   */
  resume() {
    this.isPaused = false;
    console.log('▶️ 游戏继续');
  }
  
  /**
   * 销毁游戏
   * 当玩家退出游戏（返回大厅）时调用
   * 用于清理资源，释放内存
   * 
   * 子类如果有额外资源需要清理，应该重写这个方法
   */
  destroy() {
    this.isRunning = false;
    console.log('🗑️ 游戏资源已释放');
  }
  
  /**
   * 触摸开始事件
   * 当玩家手指按下屏幕时调用
   * 
   * @param {Object} touch - 触摸信息，包含 x, y 坐标
   * 
   * 子类可以重写这个方法来处理触摸操作
   * 比如：让小鸟跳起来
   */
  onTouchStart(touch) {
    // 检查是否点击了返回按钮
    if (this.isPointInBackButton(touch.x, touch.y)) {
      this.backToLobby();
      return true; // 表示事件已处理
    }
    return false;
  }
  
  /**
   * 触摸结束事件
   * 当玩家手指离开屏幕时调用
   * 
   * @param {Object} touch - 触摸信息，包含 x, y 坐标
   */
  onTouchEnd(touch) {
    // 子类可以重写
  }
  
  /**
   * 检查点击是否在返回按钮范围内
   */
  isPointInBackButton(x, y) {
    const btn = this.backButton;
    return x >= btn.x && x <= btn.x + btn.width &&
           y >= btn.y && y <= btn.y + btn.height;
  }
  
  /**
   * 返回游戏大厅
   * 清理当前游戏并显示主界面
   */
  backToLobby() {
    console.log('🏠 返回游戏大厅');
    this.destroy();
    this.gameManager.showLobby();
  }
  
  /**
   * 游戏结束处理
   * 子类可以重写这个方法来显示游戏结束界面
   */
  gameOver() {
    this.isGameOver = true;
    console.log('💀 游戏结束');
  }
  
  /**
   * 重新开始游戏
   * 重置游戏状态，重新初始化
   */
  restart() {
    this.init();
    console.log('🔄 重新开始游戏');
  }
}
