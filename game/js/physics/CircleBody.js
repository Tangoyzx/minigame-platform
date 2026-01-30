/**
 * 圆形碰撞体 - CircleBody
 * 
 * 继承自 PhysicsBody，专门用于圆形物体的碰撞检测
 * 
 * 适用于：
 * - 小鸟 🐦
 * - 球 ⚽
 * - 泡泡 🫧
 * - 任何圆形或接近圆形的物体
 * 
 * 圆形碰撞检测比矩形简单：
 * 只要两个圆心的距离 < 两个半径之和，就是碰撞了！
 */

import PhysicsBody from './PhysicsBody.js';

export default class CircleBody extends PhysicsBody {
  /**
   * 创建圆形碰撞体
   * 
   * @param {number} x - 圆心 X 坐标
   * @param {number} y - 圆心 Y 坐标
   * @param {number} radius - 圆的半径
   */
  constructor(x = 0, y = 0, radius = 10) {
    super(x, y);
    
    // 圆的半径
    this.radius = radius;
    
    // 标记类型为圆形
    this.type = 'circle';
  }
  
  /**
   * 设置半径
   * 
   * @param {number} radius - 新的半径值
   */
  setRadius(radius) {
    this.radius = radius;
  }
  
  /**
   * 获取边界框（用于粗略碰撞检测）
   * 圆的边界框就是一个包围它的正方形
   * 
   * @returns {Object} 边界框
   */
  getBounds() {
    return {
      x: this.x - this.radius,
      y: this.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2
    };
  }
  
  /**
   * 调试绘制
   * 在屏幕上画出圆形的边界，方便调试
   * 
   * 颜色规则：
   * - 绿色：正常状态
   * - 红色：发生碰撞
   * 
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  debugDraw(ctx) {
    ctx.save();
    
    // 根据碰撞状态选择颜色
    if (this.isColliding) {
      ctx.strokeStyle = '#FF0000';  // 红色 - 碰撞中
      ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
    } else {
      ctx.strokeStyle = '#00FF00';  // 绿色 - 正常
      ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
    }
    
    ctx.lineWidth = 2;
    
    // 画圆
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // 画圆心（一个小点）
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // 显示标签（如果有的话）
    if (this.tag) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(this.tag, this.x, this.y - this.radius - 5);
    }
    
    ctx.restore();
  }
  
  /**
   * 检查点是否在圆内
   * 
   * @param {number} px - 点的 X 坐标
   * @param {number} py - 点的 Y 坐标
   * @returns {boolean} 点是否在圆内
   */
  containsPoint(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return (dx * dx + dy * dy) <= (this.radius * this.radius);
  }
}
