/**
 * 矩形碰撞体 - RectBody
 * 
 * 继承自 PhysicsBody，专门用于矩形物体的碰撞检测
 * 
 * 适用于：
 * - 管道 🟩
 * - 墙壁 🧱
 * - 平台
 * - 任何矩形的物体
 * 
 * 注意：这里的 (x, y) 是矩形的中心点，不是左上角！
 * 这样做是为了方便旋转和物理计算
 */

import PhysicsBody from './PhysicsBody.js';

export default class RectBody extends PhysicsBody {
  /**
   * 创建矩形碰撞体
   * 
   * @param {number} x - 矩形中心 X 坐标
   * @param {number} y - 矩形中心 Y 坐标
   * @param {number} width - 矩形宽度
   * @param {number} height - 矩形高度
   */
  constructor(x = 0, y = 0, width = 10, height = 10) {
    super(x, y);
    
    // 矩形的宽度和高度
    this.width = width;
    this.height = height;
    
    // 标记类型为矩形
    this.type = 'rect';
  }
  
  /**
   * 设置尺寸
   * 
   * @param {number} width - 宽度
   * @param {number} height - 高度
   */
  setSize(width, height) {
    this.width = width;
    this.height = height;
  }
  
  /**
   * 获取矩形的左上角坐标
   * 因为 (x, y) 是中心点，所以需要计算
   */
  get left() {
    return this.x - this.width / 2;
  }
  
  get right() {
    return this.x + this.width / 2;
  }
  
  get top() {
    return this.y - this.height / 2;
  }
  
  get bottom() {
    return this.y + this.height / 2;
  }
  
  /**
   * 获取边界框
   * 
   * @returns {Object} 边界框 {x, y, width, height}
   *                   注意：这里的 x, y 是左上角坐标
   */
  getBounds() {
    return {
      x: this.left,
      y: this.top,
      width: this.width,
      height: this.height
    };
  }
  
  /**
   * 调试绘制
   * 在屏幕上画出矩形的边界，方便调试
   * 
   * 颜色规则：
   * - 蓝色：正常状态
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
      ctx.strokeStyle = '#0088FF';  // 蓝色 - 正常
      ctx.fillStyle = 'rgba(0, 136, 255, 0.2)';
    }
    
    ctx.lineWidth = 2;
    
    // 画矩形（从左上角开始）
    ctx.fillRect(this.left, this.top, this.width, this.height);
    ctx.strokeRect(this.left, this.top, this.width, this.height);
    
    // 画中心点（一个小点）
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // 显示标签（如果有的话）
    if (this.tag) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(this.tag, this.x, this.y);
    }
    
    ctx.restore();
  }
  
  /**
   * 检查点是否在矩形内
   * 
   * @param {number} px - 点的 X 坐标
   * @param {number} py - 点的 Y 坐标
   * @returns {boolean} 点是否在矩形内
   */
  containsPoint(px, py) {
    return px >= this.left && px <= this.right &&
           py >= this.top && py <= this.bottom;
  }
}
