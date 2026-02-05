/**
 * 愤怒的小鸟 - Pig
 * 
 * 猪类，继承自 CircleBody
 * 负责猪的绘制和物理行为
 */

import CircleBody from '../../physics/CircleBody.js';

export default class Pig {
  constructor(x, y, screenHeight) {
    // 创建猪的物理体
    this.body = new CircleBody(x, y, 20);
    this.body.tag = 'pig';
    
    // 猪的状态
    this.screenHeight = screenHeight;
    this.isAlive = true;
    this.health = 1;
    
    // 猪的颜色配置
    this.colors = {
      body: '#8BC34A',      // 绿色身体
      nose: '#FF5722',       // 橙色鼻子
      eye: '#FFFFFF',       // 白色眼睛
      pupil: '#000000'      // 黑色瞳孔
    };
  }
  
  /**
   * 获取物理体
   */
  getBody() {
    return this.body;
  }
  
  /**
   * 更新猪的状态
   */
  update(dt) {
    if (!this.isAlive) return;
    
    // 检查猪是否掉出屏幕
    if (this.body.y > this.screenHeight + 50) {
      this.isAlive = false;
    }
  }
  
  /**
   * 绘制猪
   */
  render(ctx) {
    if (!this.isAlive) return;
    
    const x = this.body.x;
    const y = this.body.y;
    const radius = this.body.radius;
    
    ctx.save();
    
    // 绘制猪身体（圆形）
    ctx.fillStyle = this.colors.body;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制猪轮廓
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 绘制猪鼻子（小圆形）
    ctx.fillStyle = this.colors.nose;
    ctx.beginPath();
    ctx.arc(x + radius * 0.3, y, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // 绘制鼻孔（两个小圆）
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x + radius * 0.2, y - radius * 0.1, radius * 0.1, 0, Math.PI * 2);
    ctx.arc(x + radius * 0.4, y - radius * 0.1, radius * 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制眼睛
    ctx.fillStyle = this.colors.eye;
    ctx.beginPath();
    ctx.arc(x - radius * 0.3, y - radius * 0.2, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制瞳孔
    ctx.fillStyle = this.colors.pupil;
    ctx.beginPath();
    ctx.arc(x - radius * 0.3, y - radius * 0.2, radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制耳朵（两个小三角形）
    ctx.fillStyle = this.colors.body;
    
    // 左耳
    ctx.beginPath();
    ctx.moveTo(x - radius * 0.8, y - radius * 0.5);
    ctx.lineTo(x - radius * 1.2, y - radius * 0.8);
    ctx.lineTo(x - radius * 0.9, y - radius * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 右耳
    ctx.beginPath();
    ctx.moveTo(x - radius * 0.2, y - radius * 0.5);
    ctx.lineTo(x - radius * 0.4, y - radius * 0.8);
    ctx.lineTo(x - radius * 0.1, y - radius * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }
  
  /**
   * 猪受到伤害
   */
  takeDamage(damage = 1) {
    this.health -= damage;
    if (this.health <= 0) {
      this.isAlive = false;
      return true; // 猪被消灭
    }
    return false;
  }
  
  /**
   * 检查猪是否存活
   */
  isAlive() {
    return this.isAlive;
  }
  
  /**
   * 重置猪的状态
   */
  reset(x, y) {
    this.body.setPosition(x, y);
    this.body.reset();
    this.isAlive = true;
    this.health = 1;
  }
}