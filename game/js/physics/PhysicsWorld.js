/**
 * 物理世界 - PhysicsWorld
 * 
 * 这是物理系统的"管理中心"！
 * 
 * 它负责：
 * 1. 管理所有的物理体（圆形、矩形等）
 * 2. 更新所有物理体的状态
 * 3. 检测物体之间的碰撞
 * 4. 调试模式下绘制所有碰撞体的边界
 * 
 * 就像一个"迷你宇宙"，里面的所有物体都遵循物理法则！
 */

import CircleBody from './CircleBody.js';
import RectBody from './RectBody.js';

export default class PhysicsWorld {
  constructor() {
    // 存储所有物理体的数组
    this.bodies = [];
    
    // 调试模式开关
    // 开启后会在屏幕上显示所有碰撞体的边界
    this.debugMode = false;
    
    // 调试绘制的颜色配置
    this.debugColors = {
      circle: '#00FF00',      // 圆形：绿色
      rect: '#0088FF',        // 矩形：蓝色
      collision: '#FF0000'    // 碰撞：红色
    };
  }
  
  /**
   * 添加物理体到世界中
   * 
   * @param {PhysicsBody} body - 要添加的物理体
   */
  addBody(body) {
    if (!this.bodies.includes(body)) {
      this.bodies.push(body);
    }
  }
  
  /**
   * 从世界中移除物理体
   * 
   * @param {PhysicsBody} body - 要移除的物理体
   */
  removeBody(body) {
    const index = this.bodies.indexOf(body);
    if (index !== -1) {
      this.bodies.splice(index, 1);
    }
  }
  
  /**
   * 移除所有物理体
   */
  clear() {
    this.bodies = [];
  }
  
  /**
   * 更新所有物理体的状态
   * 
   * @param {number} dt - deltaTime，距离上一帧的时间（秒）
   */
  update(dt) {
    // 重置所有碰撞状态
    for (const body of this.bodies) {
      body.isColliding = false;
    }
    
    // 更新每个物理体
    for (const body of this.bodies) {
      body.update(dt);
    }
  }
  
  /**
   * 调试绘制
   * 在屏幕上绘制所有物理体的边界
   * 
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  debugDraw(ctx) {
    if (!this.debugMode) {
      return;
    }
    
    // 绘制每个物理体
    for (const body of this.bodies) {
      body.debugDraw(ctx);
    }
    
    // 绘制调试信息
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Arial';
    ctx.fillText(`物理体数量: ${this.bodies.length}`, 10, this.debugMode ? 100 : 20);
    ctx.fillText('🟢 圆形  🔵 矩形  🔴 碰撞', 10, this.debugMode ? 120 : 40);
    ctx.restore();
  }
  
  /**
   * 开启/关闭调试模式
   * 
   * @param {boolean} enabled - 是否开启
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    console.log(`🔧 物理调试模式: ${enabled ? '开启' : '关闭'}`);
  }
  
  /**
   * 切换调试模式
   */
  toggleDebugMode() {
    this.setDebugMode(!this.debugMode);
  }
  
  // ==================== 碰撞检测方法 ====================
  
  /**
   * 圆形 vs 圆形 碰撞检测
   * 
   * 原理：如果两个圆心的距离 < 两个半径之和，就是碰撞了
   * 
   * @param {CircleBody} circle1 - 第一个圆
   * @param {CircleBody} circle2 - 第二个圆
   * @returns {boolean} 是否碰撞
   */
  circleVsCircle(circle1, circle2) {
    // 计算两个圆心之间的距离
    const dx = circle2.x - circle1.x;
    const dy = circle2.y - circle1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 两个半径之和
    const radiusSum = circle1.radius + circle2.radius;
    
    // 如果距离小于半径之和，就是碰撞了
    const isColliding = distance < radiusSum;
    
    // 更新碰撞状态（用于调试显示）
    if (isColliding) {
      circle1.isColliding = true;
      circle2.isColliding = true;
    }
    
    return isColliding;
  }
  
  /**
   * 圆形 vs 矩形 碰撞检测
   * 
   * 这是 FlappyBird 中最重要的碰撞检测！
   * 小鸟（圆形）撞到管道（矩形）
   * 
   * 原理：找到矩形上离圆心最近的点，
   *       如果这个点到圆心的距离 < 圆的半径，就是碰撞了
   * 
   * @param {CircleBody} circle - 圆形
   * @param {RectBody} rect - 矩形
   * @returns {boolean} 是否碰撞
   */
  circleVsRect(circle, rect) {
    // 找到矩形上离圆心最近的点
    // 使用 clamp 函数将圆心坐标限制在矩形范围内
    const closestX = Math.max(rect.left, Math.min(circle.x, rect.right));
    const closestY = Math.max(rect.top, Math.min(circle.y, rect.bottom));
    
    // 计算这个最近点到圆心的距离
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    const distanceSquared = dx * dx + dy * dy;
    
    // 如果距离小于半径，就是碰撞了
    // 注意：这里比较的是距离的平方，避免开方运算（更快）
    const isColliding = distanceSquared < (circle.radius * circle.radius);
    
    // 更新碰撞状态
    if (isColliding) {
      circle.isColliding = true;
      rect.isColliding = true;
    }
    
    return isColliding;
  }
  
  /**
   * 矩形 vs 矩形 碰撞检测
   * 
   * 原理：AABB（轴对齐边界框）碰撞检测
   *       如果两个矩形在 X 轴和 Y 轴上都有重叠，就是碰撞了
   * 
   * @param {RectBody} rect1 - 第一个矩形
   * @param {RectBody} rect2 - 第二个矩形
   * @returns {boolean} 是否碰撞
   */
  rectVsRect(rect1, rect2) {
    // AABB 碰撞检测
    // 如果以下任一条件为真，则没有碰撞：
    // - rect1 完全在 rect2 的左边
    // - rect1 完全在 rect2 的右边
    // - rect1 完全在 rect2 的上边
    // - rect1 完全在 rect2 的下边
    
    const noCollision = 
      rect1.right < rect2.left ||   // rect1 在 rect2 左边
      rect1.left > rect2.right ||   // rect1 在 rect2 右边
      rect1.bottom < rect2.top ||   // rect1 在 rect2 上边
      rect1.top > rect2.bottom;     // rect1 在 rect2 下边
    
    const isColliding = !noCollision;
    
    // 更新碰撞状态
    if (isColliding) {
      rect1.isColliding = true;
      rect2.isColliding = true;
    }
    
    return isColliding;
  }
  
  /**
   * 检测一个圆形是否与任何矩形碰撞
   * 
   * @param {CircleBody} circle - 要检测的圆形
   * @param {RectBody[]} rects - 矩形数组
   * @returns {RectBody|null} 碰撞的矩形，如果没有碰撞则返回 null
   */
  checkCircleVsRects(circle, rects) {
    for (const rect of rects) {
      if (this.circleVsRect(circle, rect)) {
        return rect;
      }
    }
    return null;
  }
  
  /**
   * 检测所有物体之间的碰撞
   * 返回所有碰撞对
   * 
   * @returns {Array} 碰撞对数组 [{body1, body2}, ...]
   */
  checkAllCollisions() {
    const collisions = [];
    
    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        const body1 = this.bodies[i];
        const body2 = this.bodies[j];
        
        let isColliding = false;
        
        // 根据物体类型选择合适的碰撞检测方法
        if (body1.type === 'circle' && body2.type === 'circle') {
          isColliding = this.circleVsCircle(body1, body2);
        } else if (body1.type === 'circle' && body2.type === 'rect') {
          isColliding = this.circleVsRect(body1, body2);
        } else if (body1.type === 'rect' && body2.type === 'circle') {
          isColliding = this.circleVsRect(body2, body1);
        } else if (body1.type === 'rect' && body2.type === 'rect') {
          isColliding = this.rectVsRect(body1, body2);
        }
        
        if (isColliding) {
          collisions.push({ body1, body2 });
        }
      }
    }
    
    return collisions;
  }
}
