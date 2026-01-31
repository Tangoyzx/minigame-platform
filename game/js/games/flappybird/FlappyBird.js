/**
 * FlappyBird 游戏主类
 * 
 * 经典的小鸟飞行游戏！🐦
 * 
 * 游戏规则：
 * 1. 点击屏幕让小鸟往上飞
 * 2. 小鸟会受重力影响往下掉
 * 3. 躲避管道障碍物
 * 4. 每成功穿过一个管道得 1 分
 * 5. 碰到管道或边界就游戏结束
 * 
 * 这个游戏使用了我们创建的物理系统：
 * - 小鸟使用 CircleBody（圆形碰撞体）
 * - 管道使用 RectBody（矩形碰撞体）
 */

import BaseGame from '../../base/BaseGame.js';
import PhysicsWorld from '../../physics/PhysicsWorld.js';
import Bird from './Bird.js';
import Pipe from './Pipe.js';
import HealthPack from './HealthPack.js';
import { randomInt, drawRoundRect } from '../../utils/utils.js';

export default class FlappyBird extends BaseGame {
  /**
   * 初始化游戏
   */
  init() {
    super.init();
    
    console.log('🐦 FlappyBird 游戏初始化');
    
    // ===== 创建物理世界 =====
    this.physicsWorld = new PhysicsWorld();
    
    // 默认关闭调试模式，可以通过点击屏幕左下角开启
    this.physicsWorld.setDebugMode(false);
    
    // ===== 游戏状态 =====
    this.gameState = 'ready';  // ready | playing | gameover
    this.score = 0;
    this.bestScore = this.loadBestScore();
    
    // ===== 生命值系统 =====
    this.lives = 3;           // 初始生命值
    this.isInvincible = false; // 是否处于无敌状态
    this.invincibleTimer = 0;  // 无敌状态计时器
    this.invincibleDuration = 1; // 无敌持续时间（秒）
    
    // ===== 创建小鸟 =====
    this.bird = new Bird(
      this.screenWidth * 0.3,   // 小鸟在屏幕左侧 1/3 处
      this.screenHeight * 0.5,  // 垂直居中
      this.screenHeight
    );
    
    // 将小鸟的物理体添加到物理世界
    this.physicsWorld.addBody(this.bird.getBody());
    
    // ===== 管道配置 =====
    this.pipes = [];
    this.pipeSpawnTimer = 1.5;  // 让第一根管道在0.5秒后出现
    this.pipeSpawnInterval = 2;  // 每 2 秒生成一个管道
    // 管道缺口高度范围（随机）
    this.minPipeGapHeight = this.screenHeight * 0.2;  // 最小缺口高度
    this.maxPipeGapHeight = this.screenHeight * 0.35;  // 最大缺口高度
    
    // ===== 补血包配置 =====
    this.healthPacks = [];  // 补血包数组
    this.healthPackChance = 0.2;  // 20%的概率生成补血包
    this.maxLives = 3;  // 最大生命值
    
    // 管道缺口 Y 位置的范围
    this.gapMinY = this.screenHeight * 0.25;
    this.gapMaxY = this.screenHeight * 0.75;
    
    // ===== 背景元素 =====
    this.clouds = this.createClouds();
    this.groundY = this.screenHeight - 50;  // 地面高度
    
    // ===== 调试按钮位置 =====
    this.debugButton = {
      x: 10,
      y: this.screenHeight - 50,
      width: 80,
      height: 40
    };
    
    // ===== UI 动画 =====
    this.readyTextAlpha = 0;
    this.readyTextDirection = 1;
  }
  
  /**
   * 创建背景云朵
   */
  createClouds() {
    const clouds = [];
    for (let i = 0; i < 5; i++) {
      clouds.push({
        x: randomInt(0, this.screenWidth),
        y: randomInt(50, this.screenHeight * 0.4),
        size: randomInt(40, 80),
        speed: randomInt(10, 30)
      });
    }
    return clouds;
  }
  
  /**
   * 更新游戏逻辑
   * 
   * @param {number} dt - deltaTime
   */
  update(dt) {
    super.update(dt);
    
    // 更新背景云朵
    this.updateClouds(dt);
    
    // 根据游戏状态更新
    switch (this.gameState) {
      case 'ready':
        this.updateReadyState(dt);
        break;
      case 'playing':
        this.updatePlayingState(dt);
        break;
      case 'gameover':
        this.updateGameOverState(dt);
        break;
    }
  }
  
  /**
   * 更新准备状态
   */
  updateReadyState(dt) {
    // "点击开始"文字的呼吸动画
    this.readyTextAlpha += this.readyTextDirection * dt * 2;
    if (this.readyTextAlpha >= 1) {
      this.readyTextAlpha = 1;
      this.readyTextDirection = -1;
    } else if (this.readyTextAlpha <= 0.3) {
      this.readyTextAlpha = 0.3;
      this.readyTextDirection = 1;
    }
    
    // 小鸟上下浮动
    this.bird.getBody().y = this.screenHeight * 0.5 + Math.sin(Date.now() / 300) * 20;
  }
  
  /**
   * 更新游戏进行状态
   */
  updatePlayingState(dt) {
    // 更新物理世界（会更新所有物理体的位置）
    this.physicsWorld.update(dt);
    
    // 更新小鸟
    this.bird.update(dt);
    
    // 更新管道
    this.updatePipes(dt);
    
    // 生成新管道
    this.spawnPipes(dt);
    
    // 更新补血包
    this.updateHealthPacks(dt);
    
    // 更新无敌状态
    this.updateInvincibleState(dt);
    
    // 检查碰撞
    this.checkCollisions();
    
    // 检查计分
    this.checkScore();
    
    // 检查边界
    this.checkBoundaries();
  }
  
  /**
   * 更新游戏结束状态
   */
  updateGameOverState(dt) {
    // 物理继续更新（让小鸟掉下去）
    this.physicsWorld.update(dt);
    this.bird.update(dt);
  }
  
  /**
   * 更新云朵
   */
  updateClouds(dt) {
    for (const cloud of this.clouds) {
      cloud.x -= cloud.speed * dt;
      if (cloud.x + cloud.size < 0) {
        cloud.x = this.screenWidth + cloud.size;
        cloud.y = randomInt(50, this.screenHeight * 0.4);
      }
    }
  }
  
  /**
   * 更新管道
   */
  updatePipes(dt) {
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.update(dt);
      
      // 移除屏幕外的管道
      if (pipe.isOffScreen) {
        // 从物理世界移除管道的碰撞体
        for (const body of pipe.getBodies()) {
          this.physicsWorld.removeBody(body);
        }
        this.pipes.splice(i, 1);
      }
    }
  }
  
  /**
   * 生成新管道
   */
  spawnPipes(dt) {
    this.pipeSpawnTimer += dt;
    
    if (this.pipeSpawnTimer >= this.pipeSpawnInterval) {
      this.pipeSpawnTimer = 0;
      
      // 随机生成缺口位置
      const gapY = randomInt(this.gapMinY, this.gapMaxY);
      
      // 随机生成缺口高度（在最小和最大之间）
      const pipeGapHeight = randomInt(this.minPipeGapHeight, this.maxPipeGapHeight);
      
      // 创建新管道
      const pipe = new Pipe(
        this.screenWidth + 30,  // 从屏幕右边外面开始
        gapY,
        pipeGapHeight,
        this.screenWidth,
        this.screenHeight
      );
      
      // 将管道的物理体添加到物理世界
      for (const body of pipe.getBodies()) {
        this.physicsWorld.addBody(body);
      }
      
      this.pipes.push(pipe);
      
      // 检查是否生成补血包
      // 条件：1. 不是满血状态 2. 20%的概率
      if (this.lives < this.maxLives && Math.random() < this.healthPackChance) {
        this.spawnHealthPack(this.screenWidth + 30, gapY);
      }
    }
  }
  
  /**
   * 生成补血包
   * 
   * @param {number} pipeX - 管道的 X 位置
   * @param {number} gapY - 管道缺口的 Y 位置
   */
  spawnHealthPack(pipeX, gapY) {
    // 计算补血包的位置（在管道缺口中心上方或下方随机位置）
    // 这里我们选择在缺口中心位置生成
    const healthPackX = pipeX;
    const healthPackY = gapY;
    
    // 创建新补血包
    const healthPack = new HealthPack(healthPackX, healthPackY);
    
    // 将补血包的物理体添加到物理世界
    this.physicsWorld.addBody(healthPack.getBody());
    
    this.healthPacks.push(healthPack);
    console.log('❤️ 生成补血包！');
  }
  
  /**
   * 检查碰撞
   */
  checkCollisions() {
    const birdBody = this.bird.getBody();
    
    // 检查小鸟是否与任何补血包碰撞
    for (const healthPack of this.healthPacks) {
      if (!healthPack.isCollected() && this.physicsWorld.circleVsCircle(birdBody, healthPack.getBody())) {
        this.handleHealthPackCollect(healthPack);
        // 补血包碰撞后继续检测其他碰撞
      }
    }
    
    // 如果处于无敌状态，不检测管道碰撞
    if (this.isInvincible) {
      return;
    }
    
    // 检查小鸟是否与任何管道碰撞
    for (const pipe of this.pipes) {
      for (const pipeBody of pipe.getBodies()) {
        if (this.physicsWorld.circleVsRect(birdBody, pipeBody)) {
          this.handleCollision();
          return;
        }
      }
    }
  }
  
  /**
   * 检查计分
   */
  checkScore() {
    const birdX = this.bird.getBody().x;
    
    for (const pipe of this.pipes) {
      // 如果小鸟飞过了管道中心，且还没计分
      if (!pipe.scored && birdX > pipe.x) {
        pipe.scored = true;
        this.score++;
        console.log(`🎯 得分: ${this.score}`);
      }
    }
  }
  
  /**
   * 更新无敌状态
   */
  updateInvincibleState(dt) {
    if (this.isInvincible) {
      this.invincibleTimer += dt;
      if (this.invincibleTimer >= this.invincibleDuration) {
        this.isInvincible = false;
        this.invincibleTimer = 0;
      }
    }
  }
  
  /**
   * 更新补血包
   */
  updateHealthPacks(dt) {
    for (let i = this.healthPacks.length - 1; i >= 0; i--) {
      const healthPack = this.healthPacks[i];
      
      // 更新补血包位置
      healthPack.update(dt);
      
      // 检查是否已收集或移出屏幕
      if (healthPack.isCollected() || healthPack.isOutOfScreen()) {
        // 从物理世界移除补血包的物理体
        this.physicsWorld.removeBody(healthPack.getBody());
        // 从数组中移除
        this.healthPacks.splice(i, 1);
      }
    }
  }
  
  /**
   * 检查边界
   */
  checkBoundaries() {
    const birdBody = this.bird.getBody();
    
    // 检查是否撞到地面（落地直接死亡）
    if (birdBody.y + birdBody.radius > this.groundY) {
      birdBody.y = this.groundY - birdBody.radius;
      // 落地直接游戏结束，不管剩余生命值
      this.lives = 0;
      this.handleGameOver();
      return;
    }
    
    // 检查是否飞出顶部
    if (birdBody.y - birdBody.radius < 0) {
      birdBody.y = birdBody.radius;
      birdBody.vy = 0;
    }
  }
  
  /**
   * 处理碰撞事件
   */
  handleCollision() {
    // 减少生命值
    this.lives--;
    console.log(`❤️ 生命值: ${this.lives}`);
    
    // 检查是否游戏结束
    if (this.lives <= 0) {
      this.handleGameOver();
      return;
    }
    
    // 设置无敌状态
    this.isInvincible = true;
    this.invincibleTimer = 0;
    console.log('🛡️ 无敌状态激活！');
  }
  
  /**
   * 处理收集补血包
   */
  handleHealthPackCollect(healthPack) {
    // 标记补血包为已收集
    healthPack.collect();
    
    // 增加生命值（不超过最大生命值）
    if (this.lives < this.maxLives) {
      this.lives++;
      console.log(`❤️ 收集补血包！生命值: ${this.lives}`);
    }
  }
  
  /**
   * 处理游戏结束
   */
  handleGameOver() {
    if (this.gameState === 'gameover') return;
    
    this.gameState = 'gameover';
    console.log('💀 游戏结束！');
    
    // 更新最高分
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.saveBestScore();
      console.log(`🎉 新纪录: ${this.bestScore}`);
    }
  }
  
  /**
   * 渲染游戏画面
   * 
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  render(ctx) {
    // 1. 绘制背景
    this.renderBackground(ctx);
    
    // 2. 绘制云朵
    this.renderClouds(ctx);
    
    // 3. 绘制管道
    for (const pipe of this.pipes) {
      pipe.render(ctx);
    }
    
    // 4. 绘制补血包
    for (const healthPack of this.healthPacks) {
      healthPack.render(ctx);
    }
    
    // 5. 绘制地面
    this.renderGround(ctx);
    
    // 6. 绘制小鸟（传递无敌状态）
    this.bird.render(ctx, this.isInvincible);
    
    // 7. 绘制物理调试信息（如果开启）
    this.physicsWorld.debugDraw(ctx);
    
    // 8. 绘制 UI
    this.renderUI(ctx);
    
    // 9. 绘制返回按钮
    this.renderBackButton(ctx);
    
    // 10. 绘制调试按钮
    this.renderDebugButton(ctx);
  }
  
  /**
   * 绘制背景
   */
  renderBackground(ctx) {
    // 渐变背景（蓝天）
    const gradient = ctx.createLinearGradient(0, 0, 0, this.screenHeight);
    gradient.addColorStop(0, '#87CEEB');    // 浅蓝色
    gradient.addColorStop(0.7, '#B0E0E6');  // 粉蓝色
    gradient.addColorStop(1, '#E0F4FF');    // 接近白色
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
  }
  
  /**
   * 绘制云朵
   */
  renderClouds(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    for (const cloud of this.clouds) {
      // 画三个重叠的圆形成云朵
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
      ctx.arc(cloud.x + cloud.size * 0.4, cloud.y - cloud.size * 0.2, cloud.size * 0.4, 0, Math.PI * 2);
      ctx.arc(cloud.x + cloud.size * 0.8, cloud.y, cloud.size * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
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
    // 分数显示
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // 文字描边
    ctx.strokeText(this.score.toString(), this.screenWidth / 2, 100);
    ctx.fillText(this.score.toString(), this.screenWidth / 2, 100);
    
    // 生命值显示
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // 文字描边
    ctx.strokeText(`生命: ${this.lives}`, 30, 30);
    ctx.fillText(`生命: ${this.lives}`, 30, 30);
    
    // 根据游戏状态显示不同的 UI
    switch (this.gameState) {
      case 'ready':
        this.renderReadyUI(ctx);
        break;
      case 'gameover':
        this.renderGameOverUI(ctx);
        break;
    }
  }
  
  /**
   * 绘制准备状态 UI
   */
  renderReadyUI(ctx) {
    ctx.globalAlpha = this.readyTextAlpha;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.font = 'bold 24px PingFang SC';
    ctx.textAlign = 'center';
    
    const text = '点击屏幕开始游戏';
    ctx.strokeText(text, this.screenWidth / 2, this.screenHeight * 0.7);
    ctx.fillText(text, this.screenWidth / 2, this.screenHeight * 0.7);
    
    ctx.globalAlpha = 1;
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
   * 绘制调试按钮
   */
  renderDebugButton(ctx) {
    const btn = this.debugButton;
    
    // 按钮背景
    ctx.fillStyle = this.physicsWorld.debugMode ? 
      'rgba(0, 255, 0, 0.7)' : 'rgba(100, 100, 100, 0.7)';
    drawRoundRect(ctx, btn.x, btn.y, btn.width, btn.height, 8);
    ctx.fill();
    
    // 按钮文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px PingFang SC';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      this.physicsWorld.debugMode ? '调试:开' : '调试:关',
      btn.x + btn.width / 2,
      btn.y + btn.height / 2
    );
  }
  
  /**
   * 触摸开始事件
   */
  onTouchStart(touch) {
    // 检查返回按钮
    if (super.onTouchStart(touch)) {
      return;
    }
    
    // 检查调试按钮
    if (this.isPointInButton(touch.x, touch.y, this.debugButton)) {
      this.physicsWorld.toggleDebugMode();
      return;
    }
    
    // 根据游戏状态处理
    switch (this.gameState) {
      case 'ready':
        // 开始游戏
        this.gameState = 'playing';
        this.bird.jump();
        break;
        
      case 'playing':
        // 让小鸟跳跃
        this.bird.jump();
        break;
        
      case 'gameover':
        // 检查是否点击了重新开始按钮
        if (this.restartButton && this.isPointInButton(touch.x, touch.y, this.restartButton)) {
          this.restartGame();
        }
        // 检查是否点击了返回大厅按钮
        else if (this.lobbyButton && this.isPointInButton(touch.x, touch.y, this.lobbyButton)) {
          this.backToLobby();
        }
        break;
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
    // 清除管道
    for (const pipe of this.pipes) {
      for (const body of pipe.getBodies()) {
        this.physicsWorld.removeBody(body);
      }
    }
    this.pipes = [];
    
    // 重置小鸟
    this.bird.reset(this.screenWidth * 0.3, this.screenHeight * 0.5);
    
    // 重置游戏状态
    this.score = 0;
    this.lives = 3;
    this.isInvincible = false;
    this.invincibleTimer = 0;
    this.healthPacks = [];
    this.pipeSpawnTimer = 0;
    this.gameState = 'ready';
    
    console.log('🔄 游戏重新开始');
  }
  
  /**
   * 销毁游戏（清理资源）
   */
  destroy() {
    // 清空物理世界
    this.physicsWorld.clear();
    
    super.destroy();
    console.log('🐦 FlappyBird 游戏已关闭');
  }
  
  /**
   * 加载最高分
   */
  loadBestScore() {
    try {
      const score = wx.getStorageSync('flappybird_bestscore');
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
      wx.setStorageSync('flappybird_bestscore', this.bestScore);
    } catch (e) {
      console.error('保存最高分失败', e);
    }
  }
}
