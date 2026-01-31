/**
 * 补血包类 - HealthPack
 * 
 * FlappyBird 游戏中的道具！❤️
 * 
 * 补血包会随机出现在管道的晚稻尖位置
 * 当小鸟碰到补血包时，会增加生命值
 */

import CircleBody from '../../physics/CircleBody.js';

export default class HealthPack {
  /**
   * 创建补血包
   * 
   * @param {number} x - 补血包的 X 位置
   * @param {number} y - 补血包的 Y 位置
   */
  constructor(x, y) {
    // 补血包的半径
    this.radius = 20;
    
    // 创建圆形物理体
    this.body = new CircleBody(x, y, this.radius);
    this.body.tag = 'healthpack';
    
    // 移动速度（与管道相同）
    this.speed = 150;
    
    // 是否已经被收集
    this.collected = false;
    
    // 是否已经移出屏幕
    this.isOffScreen = false;
    
    // 颜色
    this.mainColor = '#FF6B6B';  // 红色
    this.borderColor = '#FF3B3B';  // 深红色
    this.innerColor = '#FFFFFF';  // 白色
  }
  
  /**
   * 更新补血包位置
   * 补血包会随管道一起向左移动
   * 
   * @param {number} dt - deltaTime
   */
  update(dt) {
    // 向左移动
    const dx = -this.speed * dt;
    this.body.x += dx;
    
    // 检查是否移出屏幕
    if (this.body.x + this.body.radius < 0) {
      this.isOffScreen = true;
    }
  }
  
  /**
   * 渲染补血包
   * 
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  render(ctx) {
    if (this.collected) {
      return;
    }
    
    ctx.save();
    
    // 绘制补血包主体
    ctx.fillStyle = this.mainColor;
    ctx.beginPath();
    ctx.arc(this.body.x, this.body.y, this.body.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制边框
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // 绘制十字标记
    ctx.fillStyle = this.innerColor;
    ctx.strokeStyle = this.innerColor;
    ctx.lineWidth = 6;
    
    // 水平线
    ctx.beginPath();
    ctx.moveTo(this.body.x - this.body.radius * 0.5, this.body.y);
    ctx.lineTo(this.body.x + this.body.radius * 0.5, this.body.y);
    ctx.stroke();
    
    // 垂直线
    ctx.beginPath();
    ctx.moveTo(this.body.x, this.body.y - this.body.radius * 0.5);
    ctx.lineTo(this.body.x, this.body.y + this.body.radius * 0.5);
    ctx.stroke();
    
    // 闪烁效果
    const blinkAlpha = Math.sin(Date.now() / 200) * 0.3 + 0.7;
    ctx.globalAlpha = blinkAlpha;
    
    // 绘制高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(this.body.x - this.body.radius * 0.3, this.body.y - this.body.radius * 0.3, this.body.radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  /**
   * 获取物理体（用于碰撞检测）
   * 
   * @returns {CircleBody} 补血包的物理体
   */
  getBody() {
    return this.body;
  }
  
  /**
   * 标记为已收集
   */
  collect() {
    this.collected = true;
  }
  
  /**
   * 检查是否已收集
   * 
   * @returns {boolean} 是否已收集
   */
  isCollected() {
    return this.collected;
  }
  
  /**
   * 检查是否移出屏幕
   * 
   * @returns {boolean} 是否已移出屏幕
   */
  isOutOfScreen() {
    return this.isOffScreen;
  }
  
  /**
   * 设置移动速度
   * 
   * @param {number} speed - 新的速度值
   */
  setSpeed(speed) {
    this.speed = speed;
  }
}
