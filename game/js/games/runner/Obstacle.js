/**
 * 跑酷游戏障碍物类 - Obstacle
 * 
 * 这个类负责处理游戏中的障碍物：
 * 1. 移动（向左移动，模拟玩家向前跑）
 * 2. 不同类型的障碍物
 * 3. 碰撞检测
 */

export default class Obstacle {
  /**
   * 构造函数
   * @param {number} x - 初始X坐标
   * @param {number} y - 初始Y坐标
   * @param {number} width - 障碍物宽度
   * @param {number} height - 障碍物高度
   * @param {string} type - 障碍物类型：'rock'（岩石）或 'cactus'（仙人掌）或 'log'（木头）
   */
  constructor(x, y, width, height, type) {
    // 位置
    this.x = x;
    this.y = y;
    
    // 大小
    this.width = width;
    this.height = height;
    
    // 类型
    this.type = type || 'rock';
    
    // 移动速度
    this.speed = 0;
    
    // 是否激活（在屏幕内）
    this.active = true;
  }
  
  /**
   * 设置移动速度
   * @param {number} speed - 移动速度
   */
  setSpeed(speed) {
    this.speed = speed;
  }
  
  /**
   * 更新障碍物状态
   * @param {number} deltaTime - 时间增量
   */
  update(deltaTime) {
    if (!this.active) {
      return;
    }
    
    // 向左移动
    this.x -= this.speed * deltaTime;
    
    // 检查是否超出屏幕左侧
    if (this.x + this.width < 0) {
      this.active = false;
    }
  }
  
  /**
   * 渲染障碍物
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  render(ctx) {
    if (!this.active) {
      return;
    }
    
    ctx.save();
    
    switch (this.type) {
      case 'rock':
        // 绘制岩石
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width * 0.8, this.y + this.height);
        ctx.lineTo(this.x + this.width * 0.2, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height / 2);
        ctx.closePath();
        ctx.fill();
        
        // 绘制岩石纹理
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.arc(this.x + this.width * 0.3, this.y + this.height * 0.6, this.width * 0.1, 0, Math.PI * 2);
        ctx.arc(this.x + this.width * 0.7, this.y + this.height * 0.5, this.width * 0.12, 0, Math.PI * 2);
        ctx.arc(this.x + this.width * 0.5, this.y + this.height * 0.8, this.width * 0.15, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'cactus':
        // 绘制仙人掌主体
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(this.x + this.width * 0.4, this.y, this.width * 0.2, this.height);
        
        // 绘制仙人掌手臂
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(this.x, this.y + this.height * 0.3, this.width * 0.4, this.width * 0.15);
        ctx.fillRect(this.x + this.width * 0.6, this.y + this.height * 0.5, this.width * 0.4, this.width * 0.15);
        ctx.fillRect(this.x + this.width * 0.2, this.y + this.height * 0.7, this.width * 0.3, this.width * 0.15);
        
        // 绘制仙人掌尖刺
        ctx.fillStyle = '#388E3C';
        // 顶部尖刺
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.5, this.y);
        ctx.lineTo(this.x + this.width * 0.4, this.y - this.height * 0.1);
        ctx.lineTo(this.x + this.width * 0.6, this.y - this.height * 0.1);
        ctx.closePath();
        ctx.fill();
        
        // 手臂尖刺
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height * 0.3 + this.width * 0.075);
        ctx.lineTo(this.x - this.width * 0.1, this.y + this.height * 0.3);
        ctx.lineTo(this.x - this.width * 0.1, this.y + this.height * 0.3 + this.width * 0.15);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.x + this.width, this.y + this.height * 0.5 + this.width * 0.075);
        ctx.lineTo(this.x + this.width + this.width * 0.1, this.y + this.height * 0.5);
        ctx.lineTo(this.x + this.width + this.width * 0.1, this.y + this.height * 0.5 + this.width * 0.15);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.5, this.y + this.height * 0.7 + this.width * 0.075);
        ctx.lineTo(this.x + this.width * 0.5 - this.width * 0.1, this.y + this.height * 0.7);
        ctx.lineTo(this.x + this.width * 0.5 + this.width * 0.1, this.y + this.height * 0.7);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'log':
        // 绘制木头
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制木头纹理
        ctx.fillStyle = '#654321';
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.arc(this.x + this.width * 0.2 + (this.width * 0.6 / 4) * i, this.y + this.height / 2, this.height * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
        
      default:
        // 默认障碍物（岩石）
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    ctx.restore();
  }
  
  /**
   * 获取碰撞检测边界
   * @returns {Object} 碰撞边界
   */
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
  
  /**
   * 检查是否与玩家碰撞
   * @param {Object} playerBounds - 玩家碰撞边界
   * @returns {boolean} 是否碰撞
   */
  collidesWith(playerBounds) {
    if (!this.active) {
      return false;
    }
    
    const bounds = this.getBounds();
    
    return (
      playerBounds.x < bounds.x + bounds.width &&
      playerBounds.x + playerBounds.width > bounds.x &&
      playerBounds.y < bounds.y + bounds.height &&
      playerBounds.y + playerBounds.height > bounds.y
    );
  }
  
  /**
   * 重置障碍物
   * @param {number} x - 新的X坐标
   * @param {number} y - 新的Y坐标
   * @param {string} type - 新的障碍物类型
   */
  reset(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type || this.type;
    this.active = true;
  }
}