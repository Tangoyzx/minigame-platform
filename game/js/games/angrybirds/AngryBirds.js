/**
 * 愤怒的小鸟 - AngryBirds
 * 
 * 游戏主类，继承自 BaseGame
 * 负责管理整个游戏的逻辑、渲染和交互
 */

import BaseGame from '../../base/BaseGame.js';
import PhysicsWorld from '../../physics/PhysicsWorld.js';
import Bird from './Bird.js';
import Pig from './Pig.js';
import Block from './Block.js';
import Slingshot from './Slingshot.js';
import LevelManager from './LevelManager.js';
import { drawRoundRect } from '../../utils/utils.js';

export default class AngryBirds extends BaseGame {
  /**
   * 初始化游戏
   */
  init() {
    super.init();
    
    console.log('🐦 愤怒的小鸟游戏初始化');
    
    // ===== 创建物理世界 =====
    this.physicsWorld = new PhysicsWorld();
    this.physicsWorld.setDebugMode(false);
    
    // ===== 游戏状态 =====
    this.gameState = 'ready'; // ready | aiming | flying | levelComplete | gameOver
    this.score = 0;
    this.currentLevel = 0;
    this.bestScore = this.loadBestScore();
    
    // ===== 创建关卡管理器 =====
    this.levelManager = new LevelManager(this.screenWidth, this.screenHeight);
    
    // ===== 创建弹弓 =====
    this.slingshot = new Slingshot(100, this.screenHeight - 150, this.screenHeight);
    
    // ===== 游戏对象 =====
    this.birds = [];
    this.pigs = [];
    this.blocks = [];
    this.currentBird = null;
    
    // ===== 游戏配置 =====
    this.groundY = this.screenHeight - 100;
    this.remainingBirds = 0;
    
    // ===== 初始化当前关卡 =====
    this.loadLevel(this.levelManager.currentLevel);
    
    // ===== UI 元素 =====
    this.uiElements = {
      levelComplete: null,
      gameOver: null
    };
    
    console.log('✅ 愤怒的小鸟游戏初始化完成');
  }
  
  /**
   * 加载关卡
   */
  loadLevel(levelIndex) {
    // 清空物理世界
    this.physicsWorld.clear();
    
    // 清空游戏对象
    this.birds = [];
    this.pigs = [];
    this.blocks = [];
    
    // 获取关卡配置
    const level = this.levelManager.getCurrentLevel();
    this.currentLevel = levelIndex;
    this.remainingBirds = level.birds;
    
    console.log(`🎯 加载关卡 ${levelIndex + 1}: ${level.name}`);
    
    // 创建小鸟队列
    for (let i = 0; i < level.birds; i++) {
      const bird = new Bird(this.slingshot.x, this.slingshot.y, this.screenHeight);
      bird.setType(i % 3 === 0 ? 'red' : i % 3 === 1 ? 'blue' : 'yellow');
      this.birds.push(bird);
    }
    
    // 准备第一只小鸟
    this.currentBird = this.birds[0];
    this.physicsWorld.addBody(this.currentBird.getBody());
    
    // 创建猪
    level.pigs.forEach(pigConfig => {
      const pig = new Pig(pigConfig.x, pigConfig.y, this.screenHeight);
      this.pigs.push(pig);
      this.physicsWorld.addBody(pig.getBody());
    });
    
    // 创建障碍物
    level.blocks.forEach(blockConfig => {
      const block = new Block(
        blockConfig.x,
        blockConfig.y,
        blockConfig.width,
        blockConfig.height,
        blockConfig.type
      );
      this.blocks.push(block);
      this.physicsWorld.addBody(block.getBody());
    });
    
    // 重置游戏状态
    this.gameState = 'ready';
    this.slingshot.reset();
  }
  
  /**
   * 更新游戏逻辑
   */
  update(dt) {
    super.update(dt);
    
    if (this.isPaused || this.isGameOver) return;
    
    // 更新物理世界
    this.physicsWorld.update(dt);
    
    // 根据游戏状态更新
    switch (this.gameState) {
      case 'ready':
        this.updateReadyState(dt);
        break;
      case 'aiming':
        this.updateAimingState(dt);
        break;
      case 'flying':
        this.updateFlyingState(dt);
        break;
      case 'levelComplete':
        this.updateLevelCompleteState(dt);
        break;
      case 'gameOver':
        this.updateGameOverState(dt);
        break;
    }
    
    // 更新所有游戏对象
    this.updateGameObjects(dt);
    
    // 检查碰撞
    this.checkCollisions();
    
    // 检查游戏状态
    this.checkGameState();
  }
  
  /**
   * 更新准备状态
   */
  updateReadyState(dt) {
    // 小鸟在弹弓上轻微浮动
    if (this.currentBird) {
      const birdBody = this.currentBird.getBody();
      birdBody.y = this.slingshot.y + Math.sin(Date.now() / 300) * 5;
    }
  }
  
  /**
   * 更新瞄准状态
   */
  updateAimingState(dt) {
    // 瞄准状态下不需要特殊更新
  }
  
  /**
   * 更新飞行状态
   */
  updateFlyingState(dt) {
    // 检查当前小鸟是否停止运动
    if (this.currentBird && this.currentBird.isActive) {
      const birdBody = this.currentBird.getBody();
      const speed = Math.sqrt(birdBody.vx * birdBody.vx + birdBody.vy * birdBody.vy);
      
      // 如果小鸟速度很慢且在地面上，准备下一只小鸟
      if (speed < 50 && birdBody.y >= this.groundY - birdBody.radius) {
        this.nextBird();
      }
    }
  }
  
  /**
   * 更新关卡完成状态
   */
  updateLevelCompleteState(dt) {
    // 关卡完成状态下的动画
  }
  
  /**
   * 更新游戏结束状态
   */
  updateGameOverState(dt) {
    // 游戏结束状态下的动画
  }
  
  /**
   * 更新所有游戏对象
   */
  updateGameObjects(dt) {
    // 更新小鸟
    this.birds.forEach(bird => bird.update(dt));
    
    // 更新猪
    this.pigs.forEach(pig => pig.update(dt));
    
    // 更新障碍物
    this.blocks.forEach(block => block.update(dt));
  }
  
  /**
   * 检查碰撞
   */
  checkCollisions() {
    if (this.gameState !== 'flying') return;
    
    // 检查小鸟与障碍物的碰撞
    if (this.currentBird && this.currentBird.isActive) {
      const birdBody = this.currentBird.getBody();
      
      // 检查与障碍物的碰撞
      this.blocks.forEach(block => {
        if (!block.isDestroyed) {
          const blockBody = block.getBody();
          if (this.physicsWorld.circleVsRect(birdBody, blockBody)) {
            block.takeDamage(1);
          }
        }
      });
      
      // 检查与猪的碰撞
      this.pigs.forEach(pig => {
        if (pig.isAlive) {
          const pigBody = pig.getBody();
          if (this.physicsWorld.circleVsCircle(birdBody, pigBody)) {
            pig.takeDamage(1);
            this.score += 100;
          }
        }
      });
    }
  }
  
  /**
   * 检查游戏状态
   */
  checkGameState() {
    // 检查是否所有猪都被消灭
    const allPigsDead = this.pigs.every(pig => !pig.isAlive);
    
    if (allPigsDead) {
      this.handleLevelComplete();
      return;
    }
    
    // 检查是否没有小鸟了且没有猪被消灭
    if (this.remainingBirds <= 0 && this.pigs.some(pig => pig.isAlive)) {
      this.handleGameOver();
      return;
    }
  }
  
  /**
   * 处理关卡完成
   */
  handleLevelComplete() {
    if (this.gameState === 'levelComplete') return;
    
    this.gameState = 'levelComplete';
    console.log(`🎉 关卡 ${this.currentLevel + 1} 完成！`);
    
    // 加分奖励
    this.score += this.remainingBirds * 500;
    
    // 检查是否还有下一关
    if (this.levelManager.nextLevel()) {
      // 延迟后加载下一关
      setTimeout(() => {
        this.loadLevel(this.levelManager.currentLevel);
      }, 2000);
    } else {
      // 所有关卡完成
      this.handleGameComplete();
    }
  }
  
  /**
   * 处理游戏结束
   */
  handleGameOver() {
    if (this.gameState === 'gameOver') return;
    
    this.gameState = 'gameOver';
    console.log('💀 游戏结束！');
    
    // 更新最高分
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.saveBestScore();
      console.log(`🎉 新纪录: ${this.bestScore}`);
    }
  }
  
  /**
   * 处理游戏完成（所有关卡通关）
   */
  handleGameComplete() {
    console.log('🏆 恭喜！所有关卡通关！');
    this.gameState = 'gameOver';
    
    // 通关奖励
    this.score += 5000;
    
    // 更新最高分
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.saveBestScore();
    }
  }
  
  /**
   * 切换到下一只小鸟
   */
  nextBird() {
    if (this.remainingBirds <= 0) return;
    
    this.remainingBirds--;
    
    // 从队列中移除当前小鸟
    const currentIndex = this.birds.indexOf(this.currentBird);
    if (currentIndex !== -1) {
      this.birds.splice(currentIndex, 1);
    }
    
    // 准备下一只小鸟
    if (this.birds.length > 0) {
      this.currentBird = this.birds[0];
      this.currentBird.reset(this.slingshot.x, this.slingshot.y);
      this.physicsWorld.addBody(this.currentBird.getBody());
      this.gameState = 'ready';
      this.slingshot.reset();
    } else {
      this.currentBird = null;
    }
  }
  
  /**
   * 渲染游戏画面
   */
  render(ctx) {
    // 1. 绘制背景
    this.renderBackground(ctx);
    
    // 2. 绘制地面
    this.renderGround(ctx);
    
    // 3. 绘制障碍物
    this.blocks.forEach(block => block.render(ctx));
    
    // 4. 绘制猪
    this.pigs.forEach(pig => pig.render(ctx));
    
    // 5. 绘制小鸟
    this.birds.forEach(bird => bird.render(ctx));
    
    // 6. 绘制弹弓
    this.slingshot.render(ctx);
    
    // 7. 绘制物理调试信息（如果开启）
    this.physicsWorld.debugDraw(ctx);
    
    // 8. 绘制 UI
    this.renderUI(ctx);
    
    // 9. 绘制返回按钮
    this.renderBackButton(ctx);
    
    // 10. 根据游戏状态绘制特殊界面
    this.renderGameStateUI(ctx);
  }
  
  /**
   * 绘制背景
   */
  renderBackground(ctx) {
    // 渐变背景（天空）
    const gradient = ctx.createLinearGradient(0, 0, 0, this.screenHeight);
    gradient.addColorStop(0, '#87CEEB');    // 天蓝色
    gradient.addColorStop(0.7, '#B0E0E6');  // 粉蓝色
    gradient.addColorStop(1, '#E0F4FF');    // 接近白色
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
    
    // 绘制云朵
    this.renderClouds(ctx);
  }
  
  /**
   * 绘制云朵
   */
  renderClouds(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    // 固定的云朵位置
    const clouds = [
      { x: 200, y: 100, size: 60 },
      { x: 400, y: 150, size: 80 },
      { x: 600, y: 80, size: 70 },
      { x: 800, y: 120, size: 90 }
    ];
    
    clouds.forEach(cloud => {
      // 画三个重叠的圆形成云朵
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
      ctx.arc(cloud.x + cloud.size * 0.4, cloud.y - cloud.size * 0.2, cloud.size * 0.4, 0, Math.PI * 2);
      ctx.arc(cloud.x + cloud.size * 0.8, cloud.y, cloud.size * 0.45, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  /**
   * 绘制地面
   */
  renderGround(ctx) {
    // 地面
    ctx.fillStyle = '#8B4513';  // 棕色
    ctx.fillRect(0, this.groundY, this.screenWidth, this.screenHeight - this.groundY);
    
    // 草地
    ctx.fillStyle = '#228B22';  // 绿色
    ctx.fillRect(0, this.groundY, this.screenWidth, 15);
    
    // 草地纹理
    ctx.fillStyle = '#32CD32';
    for (let x = 0; x < this.screenWidth; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, this.groundY + 15);
      ctx.lineTo(x + 10, this.groundY);
      ctx.lineTo(x + 20, this.groundY + 15);
      ctx.fill();
    }
  }
  
  /**
   * 绘制 UI
   */
  renderUI(ctx) {
    const level = this.levelManager.getCurrentLevel();
    
    // 分数显示
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // 文字描边
    ctx.strokeText(`分数: ${this.score}`, 20, 20);
    ctx.fillText(`分数: ${this.score}`, 20, 20);
    
    // 关卡信息
    ctx.strokeText(`关卡: ${this.currentLevel + 1}/${this.levelManager.getTotalLevels()}`, 20, 50);
    ctx.fillText(`关卡: ${this.currentLevel + 1}/${this.levelManager.getTotalLevels()}`, 20, 50);
    
    // 剩余小鸟
    ctx.strokeText(`剩余小鸟: ${this.remainingBirds}`, 20, 80);
    ctx.fillText(`剩余小鸟: ${this.remainingBirds}`, 20, 80);
    
    // 关卡名称
    ctx.textAlign = 'center';
    ctx.strokeText(level.name, this.screenWidth / 2, 20);
    ctx.fillText(level.name, this.screenWidth / 2, 20);
  }
  
  /**
   * 根据游戏状态绘制特殊界面
   */
  renderGameStateUI(ctx) {
    switch (this.gameState) {
      case 'ready':
        this.renderReadyUI(ctx);
        break;
      case 'levelComplete':
        this.renderLevelCompleteUI(ctx);
        break;
      case 'gameOver':
        this.renderGameOverUI(ctx);
        break;
    }
  }
  
  /**
   * 绘制准备状态 UI
   */
  renderReadyUI(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = 'bold 20px PingFang SC';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const text = '拖动小鸟进行发射';
    ctx.fillText(text, this.screenWidth / 2, this.screenHeight / 2);
  }
  
  /**
   * 绘制关卡完成 UI
   */
  renderLevelCompleteUI(ctx) {
    // 半透明遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
    
    // 完成面板
    const panelWidth = this.screenWidth * 0.8;
    const panelHeight = 200;
    const panelX = (this.screenWidth - panelWidth) / 2;
    const panelY = (this.screenHeight - panelHeight) / 2;
    
    // 面板背景
    ctx.fillStyle = '#FFFFFF';
    drawRoundRect(ctx, panelX, panelY, panelWidth, panelHeight, 20);
    ctx.fill();
    
    // 标题
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 28px PingFang SC';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('关卡完成！', this.screenWidth / 2, panelY + 40);
    
    // 分数信息
    ctx.font = '18px PingFang SC';
    ctx.fillText(`得分: ${this.score}`, this.screenWidth / 2, panelY + 90);
    
    // 下一关提示
    if (this.currentLevel < this.levelManager.getTotalLevels() - 1) {
      ctx.font = '16px PingFang SC';
      ctx.fillText('准备进入下一关...', this.screenWidth / 2, panelY + 130);
    } else {
      ctx.font = 'bold 20px PingFang SC';
      ctx.fillText('🎉 恭喜通关所有关卡！', this.screenWidth / 2, panelY + 130);
    }
  }
  
  /**
   * 绘制游戏结束 UI
   */
  renderGameOverUI(ctx) {
    // 半透明遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
    
    // 游戏结束面板
    const panelWidth = this.screenWidth * 0.8;
    const panelHeight = 280;
    const panelX = (this.screenWidth - panelWidth) / 2;
    const panelY = (this.screenHeight - panelHeight) / 2;
    
    // 面板背景
    ctx.fillStyle = '#FFFFFF';
    drawRoundRect(ctx, panelX, panelY, panelWidth, panelHeight, 20);
    ctx.fill();
    
    // 标题
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 32px PingFang SC';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('游戏结束', this.screenWidth / 2, panelY + 45);
    
    // 分数
    ctx.font = '20px PingFang SC';
    ctx.fillText(`得分: ${this.score}`, this.screenWidth / 2, panelY + 100);
    ctx.fillText(`最高分: ${this.bestScore}`, this.screenWidth / 2, panelY + 135);
    
    // 新纪录标记
    if (this.score >= this.bestScore && this.score > 0) {
      ctx.fillStyle = '#FF6B35';
      ctx.font = 'bold 16px PingFang SC';
      ctx.fillText('🎉 新纪录！', this.screenWidth / 2, panelY + 170);
    }
    
    // 重新开始按钮
    this.restartButton = {
      x: panelX + 20,
      y: panelY + panelHeight - 70,
      width: (panelWidth - 50) / 2,
      height: 50
    };
    
    ctx.fillStyle = '#4CAF50';
    drawRoundRect(
      ctx,
      this.restartButton.x,
      this.restartButton.y,
      this.restartButton.width,
      this.restartButton.height,
      10
    );
    ctx.fill();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px PingFang SC';
    ctx.fillText('重新开始', this.restartButton.x + this.restartButton.width / 2, this.restartButton.y + 25);
    
    // 返回大厅按钮
    this.lobbyButton = {
      x: panelX + panelWidth / 2 + 5,
      y: panelY + panelHeight - 70,
      width: (panelWidth - 50) / 2,
      height: 50
    };
    
    ctx.fillStyle = '#2196F3';
    drawRoundRect(
      ctx,
      this.lobbyButton.x,
      this.lobbyButton.y,
      this.lobbyButton.width,
      this.lobbyButton.height,
      10
    );
    ctx.fill();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('返回大厅', this.lobbyButton.x + this.lobbyButton.width / 2, this.lobbyButton.y + 25);
  }
  
  /**
   * 触摸开始事件
   */
  onTouchStart(touch) {
    // 检查返回按钮
    if (super.onTouchStart(touch)) {
      return;
    }
    
    // 根据游戏状态处理触摸
    switch (this.gameState) {
      case 'ready':
        this.handleReadyTouch(touch);
        break;
      case 'aiming':
        this.handleAimingTouch(touch);
        break;
      case 'levelComplete':
      case 'gameOver':
        this.handleGameOverTouch(touch);
        break;
    }
  }
  
  /**
   * 处理准备状态的触摸
   */
  handleReadyTouch(touch) {
    // 检查是否点击了小鸟
    if (this.currentBird && this.currentBird.isActive) {
      const birdBody = this.currentBird.getBody();
      const distance = Math.sqrt(
        Math.pow(touch.x - birdBody.x, 2) + Math.pow(touch.y - birdBody.y, 2)
      );
      
      if (distance <= birdBody.radius + 20) {
        this.gameState = 'aiming';
        this.slingshot.startDrag(touch.x, touch.y);
      }
    }
  }
  
  /**
   * 处理瞄准状态的触摸
   */
  handleAimingTouch(touch) {
    this.slingshot.updateDrag(touch.x, touch.y);
  }
  
  /**
   * 触摸移动事件
   */
  onTouchMove(touch) {
    if (this.gameState === 'aiming') {
      this.slingshot.updateDrag(touch.x, touch.y);
    }
  }
  
  /**
   * 触摸结束事件
   */
  onTouchEnd(touch) {
    if (this.gameState === 'aiming') {
      const launchParams = this.slingshot.endDrag();
      if (launchParams && this.currentBird) {
        this.currentBird.launch(launchParams.power, launchParams.angle);
        this.gameState = 'flying';
      }
    }
  }
  
  /**
   * 处理游戏结束状态的触摸
   */
  handleGameOverTouch(touch) {
    // 检查是否点击了重新开始按钮
    if (this.restartButton && this.isPointInButton(touch.x, touch.y, this.restartButton)) {
      this.restartGame();
    }
    // 检查是否点击了返回大厅按钮
    else if (this.lobbyButton && this.isPointInButton(touch.x, touch.y, this.lobbyButton)) {
      this.backToLobby();
    }
  }
  
  /**
   * 检查点击是否在按钮范围内
   */
  isPointInButton(x, y, button) {
    return x >= button.x && x <= button.x + button.width &&
           y >= button.y && y <= button.y + button.height;
  }
  
  /**
   * 重新开始游戏
   */
  restartGame() {
    this.levelManager.reset();
    this.loadLevel(0);
    this.score = 0;
    console.log('🔄 游戏重新开始');
  }
  
  /**
   * 销毁游戏（清理资源）
   */
  destroy() {
    // 清空物理世界
    this.physicsWorld.clear();
    
    super.destroy();
    console.log('🐦 愤怒的小鸟游戏已关闭');
  }
  
  /**
   * 加载最高分
   */
  loadBestScore() {
    try {
      const score = wx.getStorageSync('angrybirds_bestscore');
      return score || 0;
    } catch (e) {
      return 0;
    }
  }
  
  /**
   * 保存最高分
   */
  saveBestScore() {
    try {
      wx.setStorageSync('angrybirds_bestscore', this.bestScore);
    } catch (e) {
      console.error('保存最高分失败', e);
    }
  }
}