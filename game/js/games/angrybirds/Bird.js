/**
 * 愤怒的小鸟 - Bird
 * 
 * 小鸟类，继承自 CircleBody
 * 负责小鸟的绘制、发射和物理行为
 */

import CircleBody from '../../physics/CircleBody.js';

export default class Bird {
  constructor(x, y, screenHeight) {
    // 创建小鸟的物理体
    this.body = new CircleBody(x, y, 15);
    this.body.tag = 'bird';
    
    // 小鸟状态
    this.screenHeight = screenHeight;
    this.isLaunched = false;
    this.isActive = true;
    this.type = 'red'; // 小鸟类型：red, blue, yellow等
    
    // 小鸟颜色配置
    this.colors = {
      red: { body: '#FF5252', beak: '#FF9800', eye: '#FFFFFF', pupil: '#000000' },
      blue: { body: '#2196F3', beak: '#FF9800', eye: '#FFFFFF', pupil: '#000000' },
      yellow: { body: '#FFEB3B', beak: '#FF9800', eye: '#FFFFFF', pupil: '#000000' }
    };
  }
  
  /**
   * 获取物理体
   */
  getBody() {
    return this.body;
  }
  
  /**
   * 发射小鸟
   * 
   * @param {number} power - 发射力度
   * @param {number} angle - 发射角度（弧度）
   */
  launch(power, angle) {
    if (this.isLaunched) return;
    
    this.isLaunched = true;
    
    // 设置发射速度
    const vx = Math.cos(angle) * power;
    const vy = Math.sin(angle) * power;
    
    this.body.setVelocity(vx, vy);
    
    // 设置重力
    this.body.setAcceleration(0, 1000);
  }
  
  /**
   * 更新小鸟状态
   */
  update(dt) {
    if (!this.isLaunched || !this.isActive) return;
    
    // 检查小鸟是否飞出屏幕
    if (this.body.y > this.screenHeight + 100) {
      this.isActive = false;
    }
  }
  
  /**
   * 绘制小鸟
   */
  render(ctx) {
    if (!this.isActive) return;
    
    const x = this.body.x;
    const y = this.body.y;
    const radius = this.body.radius;
    const color = this.colors[this.type];
    
    ctx.save();
    
    // 根据速度方向旋转小鸟
    const angle = Math.atan2(this.body.vy, this.body.vx);
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    // 绘制小鸟身体（圆形）
    ctx.fillStyle = color.body;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制小鸟轮廓
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 绘制鸟嘴（三角形）
    ctx.fillStyle = color.beak;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(radius + 10, -5);
    ctx.lineTo(radius + 10, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 绘制眼睛
    ctx.fillStyle = color.eye;
    ctx.beginPath();
    ctx.arc(-radius * 0.3, -radius * 0.3, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制瞳孔
    ctx.fillStyle = color.pupil;
    ctx.beginPath();
    ctx.arc(-radius * 0.3, -radius * 0.3, radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  /**
   * 重置小鸟状态
   */
  reset(x, y) {
    this.body.setPosition(x, y);
    this.body.reset();
    this.isLaunched = false;
    this.isActive = true;
  }
  
  /**
   * 设置小鸟类型
   */
  setType(type) {
    if (this.colors[type]) {
      this.type = type;
    }
  }
}