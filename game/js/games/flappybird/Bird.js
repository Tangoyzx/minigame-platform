/**
 * 小鸟类 - Bird
 * 
 * FlappyBird 游戏的主角！🐦
 * 
 * 小鸟使用圆形碰撞体（CircleBody）来检测碰撞，
 * 因为圆形更接近小鸟的实际形状，碰撞检测更准确。
 * 
 * 物理特性：
 * - 受重力影响，会往下掉
 * - 点击屏幕时会获得一个向上的速度（跳跃）
 */

import CircleBody from '../../physics/CircleBody.js';

export default class Bird {
  /**
   * 创建小鸟
   * 
   * @param {number} x - 初始 X 位置
   * @param {number} y - 初始 Y 位置
   * @param {number} screenHeight - 屏幕高度（用于计算物理参数）
   */
  constructor(x, y, screenHeight) {
    // 小鸟的半径（用于碰撞检测和绘制）- 放大1.5倍
    this.radius = 30;
    
    // 创建圆形物理体
    this.body = new CircleBody(x, y, this.radius);
    this.body.tag = 'bird';
    
    // 物理参数（根据屏幕高度调整）
    // 重力：让小鸟往下掉的加速度
    this.gravity = screenHeight * 1.5;
    
    // 跳跃力度：点击时给小鸟的向上速度
    this.jumpForce = -screenHeight * 0.6;
    
    // 最大下落速度：防止小鸟掉得太快
    this.maxFallSpeed = screenHeight * 0.8;
    
    // 设置重力加速度
    this.body.setAcceleration(0, this.gravity);
    
    // 动画相关
    this.rotation = 0;           // 旋转角度
    this.wingAngle = 0;          // 翅膀角度（用于扇动动画）
    this.wingDirection = 1;      // 翅膀扇动方向
    
    // 颜色
    this.bodyColor = '#FFD700';  // 金黄色身体
    this.wingColor = '#FFA500';  // 橙色翅膀
    this.beakColor = '#FF6B35';  // 橙红色嘴巴
  }
  
  /**
   * 让小鸟跳跃
   * 当玩家点击屏幕时调用
   */
  jump() {
    // 设置向上的速度
    this.body.vy = this.jumpForce;
    
    // 重置翅膀动画
    this.wingAngle = -30;
  }
  
  /**
   * 更新小鸟状态
   * 
   * @param {number} dt - deltaTime
   */
  update(dt) {
    // 物理更新由 PhysicsWorld 统一处理
    // 这里只处理额外的逻辑
    
    // 限制最大下落速度
    if (this.body.vy > this.maxFallSpeed) {
      this.body.vy = this.maxFallSpeed;
    }
    
    // 更新旋转角度（根据垂直速度）
    // 向上飞时抬头，向下掉时低头
    const targetRotation = (this.body.vy / this.maxFallSpeed) * 45;
    this.rotation += (targetRotation - this.rotation) * 0.1;
    
    // 限制旋转角度范围
    this.rotation = Math.max(-30, Math.min(90, this.rotation));
    
    // 翅膀扇动动画
    this.wingAngle += this.wingDirection * dt * 500;
    if (this.wingAngle > 30) {
      this.wingAngle = 30;
      this.wingDirection = -1;
    } else if (this.wingAngle < -30) {
      this.wingAngle = -30;
      this.wingDirection = 1;
    }
  }
  
  /**
   * 渲染小鸟
   * 
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  render(ctx) {
    ctx.save();
    
    // 移动到小鸟位置并旋转
    ctx.translate(this.body.x, this.body.y);
    ctx.rotate(this.rotation * Math.PI / 180);
    
    const r = this.radius;
    
    // 绘制翅膀（在身体后面）
    ctx.save();
    ctx.rotate(this.wingAngle * Math.PI / 180);
    ctx.fillStyle = this.wingColor;
    ctx.beginPath();
    ctx.ellipse(-r * 0.3, 0, r * 0.6, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // 绘制身体（圆形）
    ctx.fillStyle = this.bodyColor;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制身体轮廓
    ctx.strokeStyle = '#E6B800';
    ctx.lineWidth = 3;  // 按比例增加线宽
    ctx.stroke();
    
    // 绘制眼睛
    // 白色眼白
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(r * 0.4, -r * 0.2, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    
    // 黑色眼珠
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(r * 0.5, -r * 0.15, r * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    // 眼睛高光
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(r * 0.55, -r * 0.2, r * 0.05, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制嘴巴（三角形）
    ctx.fillStyle = this.beakColor;
    ctx.beginPath();
    ctx.moveTo(r * 0.8, 0);
    ctx.lineTo(r * 1.3, r * 0.15);
    ctx.lineTo(r * 0.8, r * 0.3);
    ctx.closePath();
    ctx.fill();
    
    // 绘制腮红
    ctx.fillStyle = 'rgba(255, 150, 150, 0.5)';
    ctx.beginPath();
    ctx.arc(r * 0.2, r * 0.3, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  /**
   * 重置小鸟状态
   * 
   * @param {number} x - X 位置
   * @param {number} y - Y 位置
   */
  reset(x, y) {
    this.body.setPosition(x, y);
    this.body.setVelocity(0, 0);
    this.rotation = 0;
    this.wingAngle = 0;
  }
  
  /**
   * 获取物理体（用于碰撞检测）
   */
  getBody() {
    return this.body;
  }
}
