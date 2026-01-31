/**
 * 跑酷游戏主类 - RunnerGame
 * 
 * 这个类是跑酷游戏的核心，负责：
 * 1. 游戏初始化
 * 2. 游戏主循环更新
 * 3. 渲染游戏画面
 * 4. 触摸事件处理
 * 5. 障碍物生成
 * 6. 金币生成
 * 7. 碰撞检测
 * 8. 分数计算
 * 9. 游戏结束逻辑
 */

import BaseGame from '../../base/BaseGame.js';
import Player from './Player.js';
import Obstacle from './Obstacle.js';
import Coin from './Coin.js';
import { drawRoundRect } from '../../utils/utils.js';

export default class RunnerGame extends BaseGame {
  /**
   * 构造函数
   * @param {GameManager} gameManager - 游戏管理器
   */
  constructor(gameManager) {
    super(gameManager);
    
    // 玩家
    this.player = null;
    
    // 障碍物
    this.obstacles = [];
    this.obstacleTypes = ['rock', 'cactus', 'log'];
    this.obstacleSpawnTimer = 0;
    this.obstacleSpawnInterval = 1.5; // 秒
    
    // 金币
    this.coins = [];
    this.coinSpawnTimer = 0;
    this.coinSpawnInterval = 1; // 秒
    this.coinSpawnChance = 0.3; // 30% 概率生成金币
    
    // 游戏状态
    this.score = 0;
    this.highScore = 0;
    this.distance = 0;
    this.gameSpeed = 300;
    this.speedIncrease = 0.5; // 每秒增加的速度
    
    // 地面
    this.groundY = 0;
    
    // 背景
    this.backgroundX = 0;
    this.backgroundSpeed = 50;
    
    // 触摸相关
    this.touchStartX = 0;
    this.touchStartY = 0;
    
    // 对象池（复用对象，提高性能）
    this.obstaclePool = [];
    this.coinPool = [];
    
    // 跳跃按钮（已删除，改为点击屏幕任意位置跳跃）
  }
  
  /**
   * 初始化游戏
   */
  init() {
    super.init();
    
    // 设置地面位置
    this.groundY = this.screenHeight - 50;
    
    // 创建玩家
    const playerWidth = 40;
    const playerHeight = 50;
    this.player = new Player(
      this.screenWidth / 4,
      this.groundY - playerHeight,
      playerWidth,
      playerHeight
    );
    
    // 重置游戏状态
    this.score = 0;
    this.distance = 0;
    this.gameSpeed = 300;
    this.obstacleSpawnTimer = 0;
    this.coinSpawnTimer = 0;
    
    // 加载最高得分
    this.loadHighScore();
    
    // 清空障碍物和金币
    this.obstacles = [];
    this.coins = [];
    
    // 重置对象池
    this.obstaclePool = [];
    this.coinPool = [];
    
    // 跳跃按钮已删除，改为点击屏幕任意位置跳跃
    
    console.log('🏃‍♂️ 跑酷游戏初始化完成，最高得分:', this.highScore);
  }
  
  /**
   * 更新游戏逻辑
   * @param {number} deltaTime - 时间增量
   */
  update(deltaTime) {
    super.update(deltaTime);
    
    if (this.isGameOver) {
      return;
    }
    
    // 更新游戏速度
    this.gameSpeed += this.speedIncrease * deltaTime;
    
    // 更新距离和分数
    this.distance += this.gameSpeed * deltaTime;
    this.score = Math.floor(this.distance / 10);
    
    // 更新背景位置
    this.backgroundX -= this.backgroundSpeed * deltaTime;
    if (this.backgroundX < -this.screenWidth) {
      this.backgroundX = 0;
    }
    
    // 更新玩家
    this.player.update(deltaTime, this.groundY, this.screenWidth);
    
    // 生成障碍物
    this.obstacleSpawnTimer += deltaTime;
    if (this.obstacleSpawnTimer >= this.obstacleSpawnInterval) {
      this.spawnObstacle();
      this.obstacleSpawnTimer = 0;
      // 随着游戏速度增加，障碍物生成间隔减小
      this.obstacleSpawnInterval = Math.max(0.8, 1.5 - (this.gameSpeed - 300) * 0.001);
    }
    
    // 生成金币
    this.coinSpawnTimer += deltaTime;
    if (this.coinSpawnTimer >= this.coinSpawnInterval) {
      if (Math.random() < this.coinSpawnChance) {
        this.spawnCoin();
      }
      this.coinSpawnTimer = 0;
    }
    
    // 更新障碍物
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.setSpeed(this.gameSpeed);
      obstacle.update(deltaTime);
      
      // 检查是否与玩家碰撞
      if (obstacle.collidesWith(this.player.getBounds())) {
        this.gameOver();
        return;
      }
      
      // 如果障碍物超出屏幕，从数组中移除并加入对象池
      if (!obstacle.active) {
        this.obstaclePool.push(obstacle);
        this.obstacles.splice(i, 1);
      }
    }
    
    // 更新金币
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.setSpeed(this.gameSpeed);
      coin.update(deltaTime);
      
      // 检查是否与玩家碰撞
      if (coin.collidesWith(this.player.getBounds())) {
        coin.collect();
        this.score += 10;
        // 从数组中移除并加入对象池
        this.coinPool.push(coin);
        this.coins.splice(i, 1);
      }
      
      // 如果金币超出屏幕，从数组中移除并加入对象池
      if (!coin.active) {
        this.coinPool.push(coin);
        this.coins.splice(i, 1);
      }
    }
  }
  
  /**
   * 渲染游戏画面
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  render(ctx) {
    // 绘制背景
    this.renderBackground(ctx);
    
    // 绘制地面
    this.renderGround(ctx);
    
    // 绘制金币
    for (const coin of this.coins) {
      coin.render(ctx);
    }
    
    // 绘制障碍物
    for (const obstacle of this.obstacles) {
      obstacle.render(ctx);
    }
    
    // 绘制玩家
    this.player.render(ctx);
    
    // 绘制操作提示
    this.renderControls(ctx);
    
    // 绘制分数
    this.renderScore(ctx);
    
    // 绘制返回按钮
    this.renderBackButton(ctx);
    
    // 如果游戏结束，绘制游戏结束界面
    if (this.isGameOver) {
      this.renderGameOver(ctx);
    }
  }
  
  /**
   * 绘制背景
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  renderBackground(ctx) {
    // 绘制天空
    const gradient = ctx.createLinearGradient(0, 0, 0, this.screenHeight);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F7FA');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
    
    // 绘制云朵
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 5; i++) {
      const cloudX = (this.backgroundX * 0.5 + i * 200) % (this.screenWidth + 100) - 50;
      const cloudY = 100 + Math.sin(i) * 50;
      this.drawCloud(ctx, cloudX, cloudY, 80 + Math.sin(i) * 20);
    }
  }
  
  /**
   * 绘制云朵
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} size - 大小
   */
  drawCloud(ctx, x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
    ctx.arc(x + size * 0.2, y - size * 0.1, size * 0.25, 0, Math.PI * 2);
    ctx.arc(x + size * 0.4, y, size * 0.3, 0, Math.PI * 2);
    ctx.arc(x + size * 0.2, y + size * 0.1, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * 绘制地面
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  renderGround(ctx) {
    // 绘制地面
    ctx.fillStyle = '#795548';
    ctx.fillRect(0, this.groundY, this.screenWidth, this.screenHeight - this.groundY);
    
    // 绘制地面纹理
    ctx.fillStyle = '#8D6E63';
    for (let i = 0; i < this.screenWidth / 40; i++) {
      const x = (this.backgroundX * 2 + i * 40) % this.screenWidth;
      ctx.fillRect(x, this.groundY - 10, 20, 10);
    }
  }
  
  /**
   * 绘制分数
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  renderScore(ctx) {
    ctx.fillStyle = '#333333';
    ctx.font = '32px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`分数: ${this.score}`, this.screenWidth - 20, 20);
    
    // 绘制最高得分
    ctx.font = '16px Arial';
    ctx.fillText(`最高得分: ${this.highScore}`, this.screenWidth - 20, 60);
    
    // 绘制距离
    ctx.font = '16px Arial';
    ctx.fillText(`距离: ${Math.floor(this.distance)}m`, this.screenWidth - 20, 85);
  }
  
  /**
   * 绘制操作提示
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  renderControls(ctx) {
    // 绘制提示背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    drawRoundRect(ctx, 20, 100, this.screenWidth - 40, 80, 10);
    ctx.fill();
    
    // 绘制提示文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('操作提示：点击屏幕任意位置跳跃', this.screenWidth / 2, 120);
    ctx.fillText('或按空格键跳跃，收集金币获得分数！', this.screenWidth / 2, 145);
  }
  
  /**
   * 加载最高得分
   * 从本地存储中读取之前的最高得分记录
   */
  loadHighScore() {
    try {
      const storedHighScore = wx.getStorageSync('runner_high_score');
      if (storedHighScore !== '') {
        this.highScore = parseInt(storedHighScore, 10);
      }
    } catch (e) {
      console.error('加载最高得分失败:', e);
    }
  }
  
  /**
   * 保存最高得分
   * 将当前最高得分存储到本地存储中
   */
  saveHighScore() {
    try {
      wx.setStorageSync('runner_high_score', this.highScore.toString());
    } catch (e) {
      console.error('保存最高得分失败:', e);
    }
  }
  

  
  /**
   * 绘制游戏结束界面
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  renderGameOver(ctx) {
    // 绘制半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
    
    // 绘制游戏结束文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('游戏结束', this.screenWidth / 2, this.screenHeight / 2 - 60);
    
    // 绘制最终分数
    ctx.font = '32px Arial';
    ctx.fillText(`最终分数: ${this.score}`, this.screenWidth / 2, this.screenHeight / 2);
    
    // 绘制最高得分
    ctx.font = '24px Arial';
    ctx.fillText(`最高得分: ${this.highScore}`, this.screenWidth / 2, this.screenHeight / 2 + 40);
    
    // 绘制重新开始按钮
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(this.screenWidth / 2 - 80, this.screenHeight / 2 + 80, 160, 50);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText('重新开始', this.screenWidth / 2, this.screenHeight / 2 + 105);
  }
  
  /**
   * 触摸开始事件
   * @param {Object} touch - 触摸信息
   */
  onTouchStart(touch) {
    if (super.onTouchStart(touch)) {
      return true;
    }
    
    if (this.isGameOver) {
      // 检查是否点击了重新开始按钮
      if (
        touch.x >= this.screenWidth / 2 - 80 &&
        touch.x <= this.screenWidth / 2 + 80 &&
        touch.y >= this.screenHeight / 2 + 80 &&
        touch.y <= this.screenHeight / 2 + 130
      ) {
        this.restart();
        return true;
      }
      return false;
    }
    
    // 触摸屏幕任意位置都跳跃
    this.player.jump();
    
    return true;
  }
  
  /**
   * 触摸结束事件
   * @param {Object} touch - 触摸信息
   */
  onTouchEnd(touch) {
    // 不需要处理，因为已经移除了左右移动功能
    return true;
  }
  

  
  /**
   * 生成障碍物
   */
  spawnObstacle() {
    let obstacle;
    
    // 从对象池获取障碍物，如果没有则创建新的
    if (this.obstaclePool.length > 0) {
      obstacle = this.obstaclePool.pop();
    } else {
      obstacle = new Obstacle(0, 0, 0, 0);
    }
    
    // 随机选择障碍物类型
    const type = this.obstacleTypes[Math.floor(Math.random() * this.obstacleTypes.length)];
    
    // 根据类型设置大小
    let width, height;
    switch (type) {
      case 'rock':
        width = 30 + Math.random() * 20;
        height = 30 + Math.random() * 20;
        break;
      case 'cactus':
        width = 40 + Math.random() * 20;
        height = 60 + Math.random() * 20;
        break;
      case 'log':
        width = 60 + Math.random() * 30;
        height = 20 + Math.random() * 10;
        break;
      default:
        width = 30;
        height = 30;
    }
    
    // 设置位置
    const x = this.screenWidth + 50;
    const y = this.groundY - height;
    
    // 重置障碍物
    obstacle.reset(x, y, type);
    obstacle.width = width;
    obstacle.height = height;
    
    // 添加到障碍物列表
    this.obstacles.push(obstacle);
  }
  
  /**
   * 生成金币
   */
  spawnCoin() {
    let coin;
    
    // 从对象池获取金币，如果没有则创建新的
    if (this.coinPool.length > 0) {
      coin = this.coinPool.pop();
    } else {
      coin = new Coin(0, 0, 30);
    }
    
    // 设置位置
    const x = this.screenWidth + 50;
    const y = this.groundY - 100 - Math.random() * 100;
    
    // 重置金币
    coin.reset(x, y);
    
    // 添加到金币列表
    this.coins.push(coin);
  }
  
  /**
   * 游戏结束处理
   */
  gameOver() {
    super.gameOver();
    
    // 更新最高得分
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
      console.log('🎉 新纪录！最高得分:', this.highScore);
    }
    
    console.log('💀 游戏结束，最终分数:', this.score);
  }
  
  /**
   * 重新开始游戏
   */
  restart() {
    this.init();
  }
  
  /**
   * 销毁游戏
   */
  destroy() {
    super.destroy();
    
    // 清空数组
    this.obstacles = [];
    this.coins = [];
    this.obstaclePool = [];
    this.coinPool = [];
    
    console.log('🗑️ 跑酷游戏资源已释放');
  }
}