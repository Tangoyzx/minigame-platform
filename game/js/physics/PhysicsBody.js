/**
 * 物理体基类 - PhysicsBody
 * 
 * 这是所有物理对象的"爸爸类"！
 * 
 * 在真实世界中，每个物体都有：
 * - 位置：它在哪里
 * - 速度：它移动的多快
 * - 加速度：它的速度变化多快（比如重力会让物体越落越快）
 * 
 * 这个类就是用来模拟这些物理属性的！
 */

export default class PhysicsBody {
  /**
   * 创建物理体
   * 
   * @param {number} x - 初始 X 位置
   * @param {number} y - 初始 Y 位置
   */
  constructor(x = 0, y = 0) {
    // ===== 位置 =====
    // 物体在屏幕上的坐标
    this.x = x;
    this.y = y;
    
    // ===== 速度 =====
    // 物体每秒移动多少像素
    // vx: 水平方向速度（正数向右，负数向左）
    // vy: 垂直方向速度（正数向下，负数向上）
    this.vx = 0;
    this.vy = 0;
    
    // ===== 加速度 =====
    // 速度每秒变化多少
    // 比如重力 ay = 1000，表示每秒速度增加 1000（越落越快）
    this.ax = 0;
    this.ay = 0;
    
    // ===== 其他属性 =====
    // 是否启用物理更新（可以用来"冻结"物体）
    this.enabled = true;
    
    // 物理体类型（用于碰撞检测时区分）
    this.type = 'body';
    
    // 标签，用于识别物体属于什么（比如 'bird', 'pipe'）
    this.tag = '';
    
    // 是否处于碰撞状态（用于调试显示）
    this.isColliding = false;
  }
  
  /**
   * 更新物理状态
   * 
   * 这是物理模拟的核心！每一帧都会调用这个方法。
   * 
   * 物理公式（还记得物理课吗？）：
   * - 新速度 = 旧速度 + 加速度 × 时间
   * - 新位置 = 旧位置 + 速度 × 时间
   * 
   * @param {number} dt - deltaTime，距离上一帧的时间（秒）
   */
  update(dt) {
    if (!this.enabled) {
      return;
    }
    
    // 根据加速度更新速度
    // 比如重力会让 vy 越来越大，物体就会越落越快
    this.vx += this.ax * dt;
    this.vy += this.ay * dt;
    
    // 根据速度更新位置
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }
  
  /**
   * 设置位置
   * 
   * @param {number} x - X 坐标
   * @param {number} y - Y 坐标
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }
  
  /**
   * 设置速度
   * 
   * @param {number} vx - 水平速度
   * @param {number} vy - 垂直速度
   */
  setVelocity(vx, vy) {
    this.vx = vx;
    this.vy = vy;
  }
  
  /**
   * 设置加速度
   * 
   * @param {number} ax - 水平加速度
   * @param {number} ay - 垂直加速度
   */
  setAcceleration(ax, ay) {
    this.ax = ax;
    this.ay = ay;
  }
  
  /**
   * 施加瞬间力（改变速度）
   * 
   * 比如小鸟跳跃时，给它一个向上的瞬间速度
   * 
   * @param {number} fx - 水平方向力
   * @param {number} fy - 垂直方向力
   */
  applyImpulse(fx, fy) {
    this.vx += fx;
    this.vy += fy;
  }
  
  /**
   * 重置物理状态
   * 将速度和加速度归零
   */
  reset() {
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.isColliding = false;
  }
  
  /**
   * 调试绘制
   * 子类需要重写这个方法来绘制碰撞体的边界
   * 
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  debugDraw(ctx) {
    // 子类实现
  }
  
  /**
   * 获取物理体的边界框（用于粗略碰撞检测）
   * 子类需要重写这个方法
   * 
   * @returns {Object} 边界框 {x, y, width, height}
   */
  getBounds() {
    return { x: this.x, y: this.y, width: 0, height: 0 };
  }
}
