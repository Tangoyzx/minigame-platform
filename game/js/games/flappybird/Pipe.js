/**
 * 管道类 - Pipe
 * 
 * FlappyBird 游戏中的障碍物！🟩
 * 
 * 每个管道由上下两部分组成：
 * - 上管道：从屏幕顶部向下延伸
 * - 下管道：从屏幕底部向上延伸
 * - 中间留一个缺口让小鸟飞过
 * 
 * 使用两个矩形碰撞体（RectBody）来检测碰撞
 */

import RectBody from '../../physics/RectBody.js';

export default class Pipe {
  /**
   * 创建管道
   * 
   * @param {number} x - 管道的 X 位置
   * @param {number} gapY - 缺口中心的 Y 位置
   * @param {number} gapHeight - 缺口的高度（小鸟要从这里飞过）
   * @param {number} screenWidth - 屏幕宽度
   * @param {number} screenHeight - 屏幕高度
   */
  constructor(x, gapY, gapHeight, screenWidth, screenHeight) {
    // 管道宽度
    this.width = 60;
    
    // 保存参数
    this.x = x;
    this.gapY = gapY;
    this.gapHeight = gapHeight;
    this.screenHeight = screenHeight;
    
    // 计算上下管道的尺寸
    // 上管道：从屏幕顶部到缺口上边缘
    const topPipeHeight = gapY - gapHeight / 2;
    // 下管道：从缺口下边缘到屏幕底部
    const bottomPipeHeight = screenHeight - (gapY + gapHeight / 2);
    
    // 创建上管道的物理体
    // 注意：RectBody 的 (x, y) 是中心点
    this.topBody = new RectBody(
      x,
      topPipeHeight / 2,  // Y 中心点
      this.width,
      topPipeHeight
    );
    this.topBody.tag = 'pipe-top';
    
    // 创建下管道的物理体
    this.bottomBody = new RectBody(
      x,
      screenHeight - bottomPipeHeight / 2,  // Y 中心点
      this.width,
      bottomPipeHeight
    );
    this.bottomBody.tag = 'pipe-bottom';
    
    // 管道移动速度（向左移动）
    this.speed = 150;
    
    // 是否已经计分（小鸟飞过后只计一次分）
    this.scored = false;
    
    // 是否已经移出屏幕（可以回收）
    this.isOffScreen = false;
    
    // 颜色配置
    this.pipeColor = '#4CAF50';       // 管道主体颜色（绿色）
    this.pipeEdgeColor = '#388E3C';   // 管道边缘颜色（深绿色）
    this.capColor = '#66BB6A';        // 管道帽颜色（浅绿色）
  }
  
  /**
   * 更新管道位置
   * 管道会不断向左移动
   * 
   * @param {number} dt - deltaTime
   */
  update(dt) {
    // 向左移动
    const dx = -this.speed * dt;
    
    // 更新两个物理体的位置
    this.topBody.x += dx;
    this.bottomBody.x += dx;
    this.x += dx;
    
    // 检查是否移出屏幕
    if (this.x + this.width / 2 < 0) {
      this.isOffScreen = true;
    }
  }
  
  /**
   * 渲染管道
   * 
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  render(ctx) {
    // 绘制上管道
    this.renderSinglePipe(ctx, this.topBody, true);
    
    // 绘制下管道
    this.renderSinglePipe(ctx, this.bottomBody, false);
  }
  
  /**
   * 绘制单个管道
   * 
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {RectBody} body - 管道的物理体
   * @param {boolean} isTop - 是否是上管道
   */
  renderSinglePipe(ctx, body, isTop) {
    const x = body.left;
    const y = body.top;
    const w = body.width;
    const h = body.height;
    
    // 管道帽的尺寸
    const capWidth = w + 10;
    const capHeight = 30;
    const capX = x - 5;  // 让帽子比管道宽一点
    
    ctx.save();
    
    // 绘制管道主体
    // 渐变效果让管道看起来有立体感
    const gradient = ctx.createLinearGradient(x, y, x + w, y);
    gradient.addColorStop(0, this.pipeEdgeColor);
    gradient.addColorStop(0.2, this.pipeColor);
    gradient.addColorStop(0.8, this.pipeColor);
    gradient.addColorStop(1, this.pipeEdgeColor);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, w, h);
    
    // 绘制管道帽（在缺口那一端）
    const capGradient = ctx.createLinearGradient(capX, 0, capX + capWidth, 0);
    capGradient.addColorStop(0, this.pipeEdgeColor);
    capGradient.addColorStop(0.2, this.capColor);
    capGradient.addColorStop(0.8, this.capColor);
    capGradient.addColorStop(1, this.pipeEdgeColor);
    
    ctx.fillStyle = capGradient;
    
    if (isTop) {
      // 上管道的帽子在底部
      ctx.fillRect(capX, y + h - capHeight, capWidth, capHeight);
      // 帽子边框
      ctx.strokeStyle = this.pipeEdgeColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(capX, y + h - capHeight, capWidth, capHeight);
    } else {
      // 下管道的帽子在顶部
      ctx.fillRect(capX, y, capWidth, capHeight);
      // 帽子边框
      ctx.strokeStyle = this.pipeEdgeColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(capX, y, capWidth, capHeight);
    }
    
    // 管道高光效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(x + 5, y, 10, h);
    
    ctx.restore();
  }
  
  /**
   * 获取所有物理体（用于碰撞检测）
   * 
   * @returns {RectBody[]} 包含上下管道的数组
   */
  getBodies() {
    return [this.topBody, this.bottomBody];
  }
  
  /**
   * 设置管道移动速度
   * 
   * @param {number} speed - 新的速度值
   */
  setSpeed(speed) {
    this.speed = speed;
  }
  
  /**
   * 重置管道位置
   * 
   * @param {number} x - 新的 X 位置
   * @param {number} gapY - 新的缺口 Y 位置
   */
  reset(x, gapY) {
    this.x = x;
    this.gapY = gapY;
    this.scored = false;
    this.isOffScreen = false;
    
    // 重新计算管道位置
    const topPipeHeight = gapY - this.gapHeight / 2;
    const bottomPipeHeight = this.screenHeight - (gapY + this.gapHeight / 2);
    
    // 更新物理体
    this.topBody.setPosition(x, topPipeHeight / 2);
    this.topBody.setSize(this.width, topPipeHeight);
    
    this.bottomBody.setPosition(x, this.screenHeight - bottomPipeHeight / 2);
    this.bottomBody.setSize(this.width, bottomPipeHeight);
  }
}
