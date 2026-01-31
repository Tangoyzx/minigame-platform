/**
 * 跑酷游戏金币类 - Coin
 * 
 * 这个类负责处理游戏中的金币：
 * 1. 移动（向左移动，模拟玩家向前跑）
 * 2. 旋转动画效果
 * 3. 碰撞检测
 */

export default class Coin {
  /**
   * 构造函数
   * @param {number} x - 初始X坐标
   * @param {number} y - 初始Y坐标
   * @param {number} size - 金币大小
   */
  constructor(x, y, size) {
    // 位置
    this.x = x;
    this.y = y;
    
    // 大小
    this.size = size;
    
    // 旋转角度
    this.rotation = 0;
    this.rotationSpeed = 0.1;
    
    // 移动速度
    this.speed = 0;
    
    // 是否激活（在屏幕内）
    this.active = true;
    
    // 是否被收集
    this.collected = false;
    
    // 闪烁效果
    this.blink = 0;
    this.blinkSpeed = 0.05;
  }
  
  /**
   * 设置移动速度
   * @param {number} speed - 移动速度
   */
  setSpeed(speed) {
    this.speed = speed;
  }
  
  /**
   * 更新金币状态
   * @param {number} deltaTime - 时间增量
   */
  update(deltaTime) {
    if (!this.active || this.collected) {
      return;
    }
    
    // 向左移动
    this.x -= this.speed * deltaTime;
    
    // 旋转动画
    this.rotation += this.rotationSpeed;
    if (this.rotation > Math.PI * 2) {
      this.rotation -= Math.PI * 2;
    }
    
    // 闪烁效果
    this.blink += this.blinkSpeed;
    if (this.blink > 1) {
      this.blink = 0;
    }
    
    // 检查是否超出屏幕左侧
    if (this.x + this.size < 0) {
      this.active = false;
    }
  }
  
  /**
   * 渲染金币
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  render(ctx) {
    if (!this.active || this.collected) {
      return;
    }
    
    ctx.save();
    
    // 移动到金币位置
    ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
    
    // 旋转
    ctx.rotate(this.rotation);
    
    // 计算闪烁透明度
    const alpha = 0.7 + Math.sin(this.blink * Math.PI * 2) * 0.3;
    ctx.globalAlpha = alpha;
    
    // 绘制金币外圈
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制金币内圈
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.arc(0, 0, this.size / 3, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制金币中心
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(0, 0, this.size / 6, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制金币光芒
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const startX = Math.cos(angle) * this.size / 2;
      const startY = Math.sin(angle) * this.size / 2;
      const endX = Math.cos(angle) * this.size * 0.7;
      const endY = Math.sin(angle) * this.size * 0.7;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
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
      width: this.size,
      height: this.size
    };
  }
  
  /**
   * 检查是否与玩家碰撞
   * @param {Object} playerBounds - 玩家碰撞边界
   * @returns {boolean} 是否碰撞
   */
  collidesWith(playerBounds) {
    if (!this.active || this.collected) {
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
   * 收集金币
   */
  collect() {
    this.collected = true;
    this.active = false;
  }
  
  /**
   * 重置金币
   * @param {number} x - 新的X坐标
   * @param {number} y - 新的Y坐标
   */
  reset(x, y) {
    this.x = x;
    this.y = y;
    this.rotation = 0;
    this.active = true;
    this.collected = false;
    this.blink = 0;
  }
}