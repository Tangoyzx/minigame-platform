/**
 * 跑酷游戏角色类 - Player
 * 
 * 这个类负责处理玩家角色的所有行为：
 * 1. 移动（左右移动）
 * 2. 跳跃
 * 3. 动画效果
 * 4. 碰撞检测
 */

export default class Player {
  /**
   * 构造函数
   * @param {number} x - 初始X坐标
   * @param {number} y - 初始Y坐标
   * @param {number} width - 角色宽度
   * @param {number} height - 角色高度
   */
  constructor(x, y, width, height) {
    // 位置
    this.x = x;
    this.y = y;
    
    // 大小
    this.width = width;
    this.height = height;
    
    // 速度
    this.vx = 0;
    this.vy = 0;
    
    // 加速度
    this.ax = 0;
    this.ay = 0;
    
    // 移动速度
    this.speed = 500;
    
    // 跳跃相关
    this.jumpForce = -800;
    this.gravity = 2000;
    this.isJumping = false;
    this.isOnGround = true;
    
    // 动画相关
    this.runFrame = 0;
    this.runSpeed = 0.2;
    this.jumpFrame = 0;
    
    // 状态（移除了左右移动相关的状态）
  }
  

  
  /**
   * 跳跃
   */
  jump() {
    if (this.isOnGround) {
      this.vy = this.jumpForce;
      this.isJumping = true;
      this.isOnGround = false;
    }
  }
  
  /**
   * 更新角色状态
   * @param {number} deltaTime - 时间增量
   * @param {number} groundY - 地面Y坐标
   * @param {number} screenWidth - 屏幕宽度
   */
  update(deltaTime, groundY, screenWidth) {
    // 应用重力
    this.ay = this.gravity;
    this.vy += this.ay * deltaTime;
    
    // 更新位置（只更新Y坐标，移除了X坐标的更新）
    this.y += this.vy * deltaTime;
    
    // 地面检查
    if (this.y + this.height > groundY) {
      this.y = groundY - this.height;
      this.vy = 0;
      this.isJumping = false;
      this.isOnGround = true;
    }
    
    // 更新动画
    if (this.isJumping) {
      this.jumpFrame += 0.1;
      if (this.jumpFrame >= 1) {
        this.jumpFrame = 1;
      }
    } else {
      this.jumpFrame = 0;
    }
  }
  
  /**
   * 渲染角色
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  render(ctx) {
    ctx.save();
    
    // 绘制角色主体
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // 绘制角色头部
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y - this.height / 4, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制眼睛
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(this.x + this.width * 0.3, this.y - this.height / 4, this.width / 6, 0, Math.PI * 2);
    ctx.arc(this.x + this.width * 0.7, this.y - this.height / 4, this.width / 6, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制瞳孔
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.arc(this.x + this.width * 0.3, this.y - this.height / 4, this.width / 12, 0, Math.PI * 2);
    ctx.arc(this.x + this.width * 0.7, this.y - this.height / 4, this.width / 12, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制嘴巴
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y - this.height / 8, this.width / 4, 0, Math.PI);
    ctx.stroke();
    
    // 绘制手臂（固定为下垂状态，移除了左右移动相关的动画）
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(this.x - this.width / 6, this.y + this.height / 2, this.width / 3, this.width / 6);
    ctx.fillRect(this.x + this.width - this.width / 6, this.y + this.height / 2, this.width / 3, this.width / 6);
    
    // 绘制腿部（固定为站立状态，移除了左右移动相关的动画）
    if (this.isOnGround) {
      // 站立
      ctx.fillStyle = '#FF6B6B';
      ctx.fillRect(this.x + this.width / 4, this.y + this.height, this.width / 3, this.width / 6);
      ctx.fillRect(this.x + this.width * 0.6, this.y + this.height, this.width / 3, this.width / 6);
    } else {
      // 跳跃姿势
      ctx.fillStyle = '#FF6B6B';
      ctx.fillRect(this.x + this.width / 4, this.y + this.height, this.width / 3, this.width / 6);
      ctx.fillRect(this.x + this.width * 0.6, this.y + this.height, this.width / 3, this.width / 6);
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
}