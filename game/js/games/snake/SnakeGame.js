/**
 * 贪吃蛇游戏 - SnakeGame
 * 
 * 经典的贪吃蛇游戏！控制小蛇吃食物，每吃一个食物蛇身变长，
 * 碰到墙壁或自己的身体游戏结束。
 * 
 * 特色功能：
 * - 通过手指按住并拖动来控制方向
 * - 松手后沿当前方向继续移动
 * - 自动生成食物
 * - 碰撞检测和得分计算
 */

import BaseGame from '../../base/BaseGame.js';

export default class SnakeGame extends BaseGame {
  /**
   * 构造函数
   */
  constructor(gameManager) {
    super(gameManager);
    
    // 游戏配置
    this.gridSize = 20;  // 网格大小
    this.gridWidth = Math.floor(this.screenWidth / this.gridSize);   // 网格宽度
    this.gridHeight = Math.floor(this.screenHeight / this.gridSize); // 网格高度
    
    // 蛇的初始属性
    this.snake = [];
    this.direction = { x: 1, y: 0 };  // 初始向右移动
    this.nextDirection = { x: 1, y: 0 };  // 下一个移动方向
    this.food = { x: 0, y: 0 };  // 食物位置
    this.score = 0;  // 得分
    this.speed = 150;  // 移动间隔（毫秒）
    this.lastMoveTime = 0;  // 上次移动时间
    
    // 触摸控制相关
    this.touchStartPos = null;      // 触摸开始位置
    this.currentTouchPos = null;    // 当前触摸位置（用于绘制拖动线）
    this.isTouching = false;        // 是否正在触摸
    this.swipeThreshold = 20;       // 滑动阈值
    this.currentDragDirection = null; // 当前拖动方向显示
    
    // 游戏状态
    this.gameStarted = false;
    this.isGameOver = false;
  }
  
  /**
   * 初始化游戏
   */
  init() {
    super.init();
    
    // 初始化蛇的位置（居中）
    this.snake = [
      { x: Math.floor(this.gridWidth / 2), y: Math.floor(this.gridHeight / 2) },  // 蛇头
      { x: Math.floor(this.gridWidth / 2) - 1, y: Math.floor(this.gridHeight / 2) },  // 蛇身
      { x: Math.floor(this.gridWidth / 2) - 2, y: Math.floor(this.gridHeight / 2) }   // 蛇尾
    ];
    
    // 重置方向
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    
    // 生成第一个食物
    this.generateFood();
    
    // 重置得分
    this.score = 0;
    
    // 重置触摸状态
    this.touchStartPos = null;
    this.currentTouchPos = null;
    this.isTouching = false;
    this.currentDragDirection = null;
    
    // 重置游戏状态 - 游戏开始时显示开始界面，等待用户点击
    this.gameStarted = false;
    this.isGameOver = false;
    this.lastMoveTime = 0; // 重置移动时间，确保游戏开始时重新计时
    
    console.log('🐍 贪吃蛇游戏初始化完成，等待用户点击开始');
  }
  
  /**
   * 更新游戏逻辑
   */
  update(deltaTime) {
    super.update(deltaTime);
    
    if (!this.gameStarted || this.isGameOver) {
      return;
    }
    
    // 获取当前时间
    const currentTime = Date.now();
    
    // 检查是否到达移动时间
    if (currentTime - this.lastMoveTime > this.speed) {
      this.moveSnake();
      this.lastMoveTime = currentTime;
    }
  }
  
  /**
   * 移动蛇
   */
  moveSnake() {
    // 更新方向（防止180度转向）
    if (this.nextDirection.x !== -this.direction.x || this.nextDirection.y !== -this.direction.y) {
      this.direction = { ...this.nextDirection };
    }
    
    // 计算新蛇头位置
    const head = { ...this.snake[0] };
    head.x += this.direction.x;
    head.y += this.direction.y;
    
    // 检查碰撞边界
    if (head.x < 0 || head.x >= this.gridWidth || head.y < 0 || head.y >= this.gridHeight) {
      this.gameOver();
      return;
    }
    
    // 检查碰撞自己身体
    for (let i = 0; i < this.snake.length; i++) {
      if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
        this.gameOver();
        return;
      }
    }
    
    // 将新蛇头添加到数组开头
    this.snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === this.food.x && head.y === this.food.y) {
      // 增加得分
      this.score += 10;
      
      // 生成新食物
      this.generateFood();
      
      // 稍微提高速度（但不超过一定限制）
      if (this.speed > 80) {
        this.speed -= 2;
      }
    } else {
      // 没吃到食物，移除蛇尾
      this.snake.pop();
    }
  }
  
  /**
   * 生成食物
   */
  generateFood() {
    let newFood;
    let foodOnSnake;
    
    do {
      // 随机生成食物位置
      newFood = {
        x: Math.floor(Math.random() * this.gridWidth),
        y: Math.floor(Math.random() * this.gridHeight)
      };
      
      // 检查食物是否在蛇身上
      foodOnSnake = false;
      for (let segment of this.snake) {
        if (segment.x === newFood.x && segment.y === newFood.y) {
          foodOnSnake = true;
          break;
        }
      }
    } while (foodOnSnake);
    
    this.food = newFood;
  }
  
  /**
   * 游戏结束处理
   */
  gameOver() {
    this.isGameOver = true;
    this.gameStarted = false; // 游戏结束后需要重新点击开始
    console.log('💀 贪吃蛇游戏结束，得分:', this.score);
  }
  
  /**
   * 渲染游戏画面
   */
  render(ctx) {
    // 清空画布
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
    
    if (!this.gameStarted) {
      this.renderStartScreen(ctx);
      return;
    }
    
    if (this.isGameOver) {
      this.renderGameOver(ctx);
      return;
    }
    
    // 绘制网格（可选，帮助玩家观察）
    this.drawGrid(ctx);
    
    // 绘制蛇
    this.drawSnake(ctx);
    
    // 绘制食物
    this.drawFood(ctx);
    
    // 绘制得分
    this.drawScore(ctx);
    
    // 绘制返回按钮
    this.renderBackButton(ctx);
    
    // 绘制触摸提示
    if (this.isTouching) {
      this.drawTouchIndicator(ctx);
    }
  }
  
  /**
   * 绘制网格
   */
  drawGrid(ctx) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 0.5;
    
    // 绘制垂直线
    for (let x = 0; x <= this.screenWidth; x += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.screenHeight);
      ctx.stroke();
    }
    
    // 绘制水平线
    for (let y = 0; y <= this.screenHeight; y += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.screenWidth, y);
      ctx.stroke();
    }
  }
  
  /**
   * 绘制蛇
   */
  drawSnake(ctx) {
    for (let i = 0; i < this.snake.length; i++) {
      const segment = this.snake[i];
      
      // 蛇头和蛇身使用不同颜色
      if (i === 0) {
        // 蛇头
        ctx.fillStyle = '#4CAF50';  // 绿色
      } else {
        // 蛇身，使用渐变色
        const intensity = 150 + Math.floor((this.snake.length - i) / this.snake.length * 105);
        ctx.fillStyle = `rgb(50, ${intensity}, 50)`;
      }
      
      // 绘制蛇段
      ctx.fillRect(
        segment.x * this.gridSize, 
        segment.y * this.gridSize, 
        this.gridSize, 
        this.gridSize
      );
      
      // 绘制边框
      ctx.strokeStyle = '#388E3C';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        segment.x * this.gridSize, 
        segment.y * this.gridSize, 
        this.gridSize, 
        this.gridSize
      );
      
      // 如果是蛇头，绘制眼睛
      if (i === 0) {
        ctx.fillStyle = '#000000';
        
        // 根据移动方向确定眼睛位置
        let eyeOffsetX = 0;
        let eyeOffsetY = 0;
        
        if (this.direction.x !== 0) {
          eyeOffsetX = this.gridSize * 0.25 * this.direction.x;
          eyeOffsetY = this.gridSize * 0.25;
        } else {
          eyeOffsetX = this.gridSize * 0.25;
          eyeOffsetY = this.gridSize * 0.25 * this.direction.y;
        }
        
        // 左眼
        ctx.beginPath();
        ctx.arc(
          segment.x * this.gridSize + this.gridSize / 2 - eyeOffsetX,
          segment.y * this.gridSize + this.gridSize / 3 - eyeOffsetY,
          this.gridSize / 8,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        // 右眼
        ctx.beginPath();
        ctx.arc(
          segment.x * this.gridSize + this.gridSize / 2 + eyeOffsetX,
          segment.y * this.gridSize + this.gridSize / 3 + eyeOffsetY,
          this.gridSize / 8,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }
  
  /**
   * 绘制食物
   */
  drawFood(ctx) {
    const centerX = this.food.x * this.gridSize + this.gridSize / 2;
    const centerY = this.food.y * this.gridSize + this.gridSize / 2;
    const radius = this.gridSize / 2 - 2;
    
    // 绘制食物（苹果形状）
    ctx.fillStyle = '#FF5252';  // 红色
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 食物内部亮点
    ctx.fillStyle = '#FF8A80';
    ctx.beginPath();
    ctx.arc(
      centerX - radius / 3, 
      centerY - radius / 3, 
      radius / 3, 
      0, 
      Math.PI * 2
    );
    ctx.fill();
  }
  
  /**
   * 绘制得分
   */
  drawScore(ctx) {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`得分: ${this.score}`, 20, 30);
  }
  
  /**
   * 绘制触摸指示器
   */
  drawTouchIndicator(ctx) {
    if (!this.touchStartPos || !this.currentTouchPos) return;
    
    // 绘制触摸起点圆点
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(this.touchStartPos.x, this.touchStartPos.y, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制从起点到当前位置的拖动线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.touchStartPos.x, this.touchStartPos.y);
    ctx.lineTo(this.currentTouchPos.x, this.currentTouchPos.y);
    ctx.stroke();
    
    // 绘制当前触摸位置圆点
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(this.currentTouchPos.x, this.currentTouchPos.y, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // 显示当前拖动方向
    if (this.currentDragDirection) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`方向: ${this.currentDragDirection}`, this.screenWidth / 2, 60);
    }
  }
  
  /**
   * 绘制开始界面
   */
  renderStartScreen(ctx) {
    // 标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('贪吃蛇', this.screenWidth / 2, this.screenHeight / 2 - 50);
    
    // 说明文字
    ctx.font = '18px Arial';
    ctx.fillText('点击屏幕开始游戏', this.screenWidth / 2, this.screenHeight / 2);
    
    // 操作说明
    ctx.font = '14px Arial';
    ctx.fillText('按住屏幕并拖动来控制蛇的方向', this.screenWidth / 2, this.screenHeight / 2 + 40);
    ctx.fillText('松手后蛇会沿当前方向继续移动', this.screenWidth / 2, this.screenHeight / 2 + 70);
  }
  
  /**
   * 绘制游戏结束界面
   */
  renderGameOver(ctx) {
    // 半透明遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
    
    // 游戏结束文字
    ctx.fillStyle = '#FF5252';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束!', this.screenWidth / 2, this.screenHeight / 2 - 50);
    
    // 得分
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.fillText(`最终得分: ${this.score}`, this.screenWidth / 2, this.screenHeight / 2);
    
    // 重新开始提示
    ctx.font = '18px Arial';
    ctx.fillText('点击屏幕重新开始', this.screenWidth / 2, this.screenHeight / 2 + 50);
  }
  
  /**
   * 触摸开始事件
   */
  onTouchStart(touch) {
    // 检查是否点击了返回按钮
    if (super.onTouchStart(touch)) {
      return true;
    }
    
    // 如果游戏未开始且未结束，点击屏幕开始游戏
    if (!this.gameStarted && !this.isGameOver) {
      this.gameStarted = true;
      this.lastMoveTime = Date.now();
      console.log('▶️ 游戏开始');
      return true;
    }
    
    // 如果游戏结束，点击屏幕重新开始游戏
    if (this.isGameOver) {
      this.init();
      this.gameStarted = false; // 重新开始后显示开始界面，等待用户点击
      console.log('🔄 游戏重置，等待用户点击开始');
      return true;
    }
    
    // 记录触摸开始位置（仅在游戏进行中时）
    if (this.gameStarted && !this.isGameOver) {
      this.touchStartPos = { x: touch.x, y: touch.y };
      this.currentTouchPos = { x: touch.x, y: touch.y };
      this.isTouching = true;
      this.currentDragDirection = null;
    }
    
    return true;
  }
  
  /**
   * 触摸移动事件
   */
  onTouchMove(touch) {
    if (!this.touchStartPos || !this.isTouching) {
      return;
    }
    
    // 记录当前触摸位置用于绘制拖动线
    this.currentTouchPos = { x: touch.x, y: touch.y };
    
    // 计算滑动距离
    const deltaX = touch.x - this.touchStartPos.x;
    const deltaY = touch.y - this.touchStartPos.y;
    
    // 确定主要滑动方向（忽略小的滑动）
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.swipeThreshold) {
      // 水平滑动
      if (deltaX > 0) {
        // 向右滑动 - 向右移动
        if (this.direction.x !== -1) {
          this.nextDirection = { x: 1, y: 0 };
          this.currentDragDirection = '右';
        }
      } else {
        // 向左滑动 - 向左移动
        if (this.direction.x !== 1) {
          this.nextDirection = { x: -1, y: 0 };
          this.currentDragDirection = '左';
        }
      }
    } else if (Math.abs(deltaY) > this.swipeThreshold) {
      // 垂直滑动
      if (deltaY > 0) {
        // 向下滑动 - 向下移动
        if (this.direction.y !== -1) {
          this.nextDirection = { x: 0, y: 1 };
          this.currentDragDirection = '下';
        }
      } else {
        // 向上滑动 - 向上移动
        if (this.direction.y !== 1) {
          this.nextDirection = { x: 0, y: -1 };
          this.currentDragDirection = '上';
        }
      }
    }
  }
  
  /**
   * 触摸结束事件
   */
  onTouchEnd(touch) {
    // 重置触摸状态，但保持当前方向不变
    this.isTouching = false;
    this.currentTouchPos = null;
    this.currentDragDirection = null;
    
    // 注意：松手后蛇会继续沿当前方向移动，不需要额外处理
  }
  
  /**
   * 销毁游戏
   */
  destroy() {
    super.destroy();
    this.gameStarted = false;
  }
}