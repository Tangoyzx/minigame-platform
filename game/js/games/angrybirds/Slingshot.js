/**
 * 愤怒的小鸟 - Slingshot
 * 
 * 弹弓类，负责小鸟的发射机制
 * 包括弹弓的绘制、发射力度计算和角度控制
 */

export default class Slingshot {
  constructor(x, y, screenHeight) {
    this.x = x;
    this.y = y;
    this.screenHeight = screenHeight;
    
    // 弹弓状态
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragCurrentX = 0;
    this.dragCurrentY = 0;
    
    // 发射参数
    this.maxPullDistance = 150; // 最大拉动距离
    this.powerScale = 20;       // 力度缩放系数
    
    // 弹弓外观配置
    this.colors = {
      base: '#8B4513',     // 棕色底座
      rubber: '#FF0000',    // 红色橡皮筋
      handle: '#A0522D'     // 深棕色手柄
    };
  }
  
  /**
   * 开始拖动小鸟
   */
  startDrag(x, y) {
    this.isDragging = true;
    this.dragStartX = x;
    this.dragStartY = y;
    this.dragCurrentX = x;
    this.dragCurrentY = y;
  }
  
  /**
   * 更新拖动位置
   */
  updateDrag(x, y) {
    if (!this.isDragging) return;
    
    this.dragCurrentX = x;
    this.dragCurrentY = y;
  }
  
  /**
   * 结束拖动并计算发射参数
   */
  endDrag() {
    if (!this.isDragging) return null;
    
    this.isDragging = false;
    
    // 计算发射参数
    const dx = this.dragStartX - this.dragCurrentX;
    const dy = this.dragStartY - this.dragCurrentY;
    
    // 限制最大拉动距离
    const distance = Math.min(Math.sqrt(dx * dx + dy * dy), this.maxPullDistance);
    
    // 计算角度（从弹弓中心到拖动点的角度）
    const angle = Math.atan2(dy, dx);
    
    // 计算力度（距离越大，力度越大）
    const power = distance * this.powerScale;
    
    return { power, angle };
  }
  
  /**
   * 获取当前拖动位置
   */
  getDragPosition() {
    return {
      x: this.dragCurrentX,
      y: this.dragCurrentY
    };
  }
  
  /**
   * 检查是否正在拖动
   */
  isDragging() {
    return this.isDragging;
  }
  
  /**
   * 绘制弹弓
   */
  render(ctx) {
    ctx.save();
    
    // 绘制弹弓底座
    this.drawBase(ctx);
    
    // 如果正在拖动，绘制橡皮筋
    if (this.isDragging) {
      this.drawRubberBand(ctx);
    }
    
    ctx.restore();
  }
  
  /**
   * 绘制弹弓底座
   */
  drawBase(ctx) {
    const baseWidth = 60;
    const baseHeight = 120;
    const baseX = this.x - baseWidth / 2;
    const baseY = this.y - baseHeight;
    
    // 绘制弹弓支架（两个Y形支柱）
    ctx.fillStyle = this.colors.base;
    
    // 左支柱
    ctx.beginPath();
    ctx.moveTo(baseX + 10, baseY + baseHeight);
    ctx.lineTo(baseX + 15, baseY + 20);
    ctx.lineTo(baseX + 5, baseY);
    ctx.lineTo(baseX + 15, baseY + 20);
    ctx.lineTo(baseX + 25, baseY);
    ctx.lineTo(baseX + 15, baseY + 20);
    ctx.lineTo(baseX + 10, baseY + baseHeight);
    ctx.fill();
    
    // 右支柱
    ctx.beginPath();
    ctx.moveTo(baseX + baseWidth - 10, baseY + baseHeight);
    ctx.lineTo(baseX + baseWidth - 15, baseY + 20);
    ctx.lineTo(baseX + baseWidth - 5, baseY);
    ctx.lineTo(baseX + baseWidth - 15, baseY + 20);
    ctx.lineTo(baseX + baseWidth - 25, baseY);
    ctx.lineTo(baseX + baseWidth - 15, baseY + 20);
    ctx.lineTo(baseX + baseWidth - 10, baseY + baseHeight);
    ctx.fill();
    
    // 绘制底座
    ctx.fillRect(baseX, baseY + baseHeight - 10, baseWidth, 20);
    
    // 绘制手柄
    ctx.fillStyle = this.colors.handle;
    ctx.fillRect(baseX + baseWidth / 2 - 5, baseY + baseHeight, 10, 30);
  }
  
  /**
   * 绘制橡皮筋
   */
  drawRubberBand(ctx) {
    const dragPos = this.getDragPosition();
    
    // 绘制橡皮筋（从弹弓支架到拖动点）
    ctx.strokeStyle = this.colors.rubber;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    
    // 左橡皮筋
    ctx.beginPath();
    ctx.moveTo(this.x - 15, this.y - 80);
    ctx.lineTo(dragPos.x, dragPos.y);
    ctx.stroke();
    
    // 右橡皮筋
    ctx.beginPath();
    ctx.moveTo(this.x + 15, this.y - 80);
    ctx.lineTo(dragPos.x, dragPos.y);
    ctx.stroke();
    
    // 绘制力度指示器
    this.drawPowerIndicator(ctx, dragPos);
  }
  
  /**
   * 绘制力度指示器
   */
  drawPowerIndicator(ctx, dragPos) {
    const dx = this.x - dragPos.x;
    const dy = this.y - dragPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 计算力度百分比
    const powerPercent = Math.min(distance / this.maxPullDistance, 1);
    
    // 根据力度改变颜色（绿色到红色）
    let color;
    if (powerPercent < 0.3) {
      color = '#00FF00'; // 绿色
    } else if (powerPercent < 0.7) {
      color = '#FFFF00'; // 黄色
    } else {
      color = '#FF0000'; // 红色
    }
    
    // 绘制力度条
    const barWidth = 100;
    const barHeight = 10;
    const barX = this.x - barWidth / 2;
    const barY = this.y - 150;
    
    // 背景条
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // 力度条
    ctx.fillStyle = color;
    ctx.fillRect(barX, barY, barWidth * powerPercent, barHeight);
    
    // 边框
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // 力度文本
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`力度: ${Math.round(powerPercent * 100)}%`, this.x, barY - 5);
  }
  
  /**
   * 重置弹弓状态
   */
  reset() {
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragCurrentX = 0;
    this.dragCurrentY = 0;
  }
}