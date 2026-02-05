/**
 * 游戏大厅 - GameLobby
 * 
 * 这是游戏平台的"主界面"！
 * 玩家在这里可以看到所有可玩的游戏,点击就能进入对应的游戏。
 * 
 * 就像一个游戏商店或游戏中心的首页,展示各种游戏供玩家选择。
 */

import { drawRoundRect } from '../utils/utils.js';
import versionConfig from '../../config/version.js';

export default class GameLobby {
  /**
   * 创建游戏大厅
   * 
   * @param {GameManager} gameManager - 游戏管理器
   */
  constructor(gameManager) {
    this.gameManager = gameManager;
    
    // 获取屏幕尺寸
    this.screenWidth = gameManager.screenWidth;
    this.screenHeight = gameManager.screenHeight;
    
    // 游戏卡片的配置
    this.cardConfig = {
      width: this.screenWidth - 60,  // 卡片宽度（留边距）
      height: 100,                    // 卡片高度
      margin: 15,                     // 卡片之间的间距
      startY: 150,                    // 第一张卡片的 Y 位置
      iconSize: 60,                   // 图标大小
      cornerRadius: 15,               // 圆角大小
      iconSize: 60                    // 图标大小
    };
    
    // 存储每个游戏卡片的位置信息（用于点击检测）
    this.gameCards = [];
    
    // 动画相关
    this.animationTime = 0;
    
    // 标题动画
    this.titleScale = 1;
    this.titleDirection = 1;
  }
  
  /**
   * 初始化大厅
   */
  init() {
    console.log('🏠 游戏大厅初始化');
    this.calculateCardPositions();
    this.animationTime = 0;
  }
  
  /**
   * 计算每个游戏卡片的位置
   */
  calculateCardPositions() {
    this.gameCards = [];
    
    const games = this.gameManager.getRegisteredGames();
    const config = this.cardConfig;
    
    games.forEach((game, index) => {
      const x = (this.screenWidth - config.width) / 2;
      const y = config.startY + index * (config.height + config.margin);
      
      this.gameCards.push({
        ...game,
        x: x,
        y: y,
        width: config.width,
        height: config.height
      });
    });
  }
  
  /**
   * 更新大厅
   * 
   * @param {number} deltaTime - 帧间隔时间
   */
  update(deltaTime) {
    // 更新动画时间
    this.animationTime += deltaTime;
    
    // 标题呼吸动画
    this.titleScale += this.titleDirection * deltaTime * 0.3;
    if (this.titleScale > 1.05) {
      this.titleScale = 1.05;
      this.titleDirection = -1;
    } else if (this.titleScale < 0.95) {
      this.titleScale = 0.95;
      this.titleDirection = 1;
    }
  }
  
  /**
   * 渲染大厅
   * 
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  render(ctx) {
    // 1. 绘制背景
    this.renderBackground(ctx);
    
    // 2. 绘制标题
    this.renderTitle(ctx);
    
    // 3. 绘制游戏卡片
    this.renderGameCards(ctx);
    
    // 4. 绘制底部信息
    this.renderFooter(ctx);
  }
  
  /**
   * 绘制背景
   */
  renderBackground(ctx) {
    // 渐变背景（天蓝色到浅绿色）
    const gradient = ctx.createLinearGradient(0, 0, 0, this.screenHeight);
    gradient.addColorStop(0, '#87CEEB');    // 天蓝色
    gradient.addColorStop(0.5, '#98D8C8');  // 薄荷绿
    gradient.addColorStop(1, '#E8F5E9');    // 浅绿色
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
    
    // 装饰性圆形（背景气泡效果）
    this.renderDecorations(ctx);
  }
  
  /**
   * 绘制装饰元素
   */
  renderDecorations(ctx) {
    ctx.save();
    ctx.globalAlpha = 0.1;
    
    // 绘制一些浮动的圆形装饰
    const decorations = [
      { x: 50, y: 200, r: 80 },
      { x: this.screenWidth - 30, y: 350, r: 60 },
      { x: 80, y: this.screenHeight - 200, r: 100 },
      { x: this.screenWidth - 80, y: 150, r: 50 }
    ];
    
    ctx.fillStyle = '#FFFFFF';
    decorations.forEach((d, i) => {
      const offsetY = Math.sin(this.animationTime * 2 + i) * 10;
      ctx.beginPath();
      ctx.arc(d.x, d.y + offsetY, d.r, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.restore();
  }
  
  /**
   * 绘制标题
   */
  renderTitle(ctx) {
    ctx.save();
    
    // 标题文字
    const title = '🎮 小游戏集合';
    const titleY = 80;
    
    // 应用缩放动画
    ctx.translate(this.screenWidth / 2, titleY);
    ctx.scale(this.titleScale, this.titleScale);
    
    // 文字阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    
    // 绘制标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px PingFang SC';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, 0, 0);
    
    ctx.restore();
    
    // 副标题
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '16px PingFang SC';
    ctx.textAlign = 'center';
    ctx.fillText('选择一个游戏开始玩吧！', this.screenWidth / 2, 115);
  }
  
  /**
   * 绘制游戏卡片
   */
  renderGameCards(ctx) {
    this.gameCards.forEach((card, index) => {
      this.renderSingleCard(ctx, card, index);
    });
    
    // 如果没有游戏，显示提示
    if (this.gameCards.length === 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.font = '18px PingFang SC';
      ctx.textAlign = 'center';
      ctx.fillText('暂无可用游戏', this.screenWidth / 2, this.screenHeight / 2);
    }
  }
  
  /**
   * 绘制单个游戏卡片
   */
  renderSingleCard(ctx, card, index) {
    const config = this.cardConfig;
    
    // 卡片入场动画（从下方滑入）
    const animDelay = index * 0.1;
    const animProgress = Math.min(1, Math.max(0, this.animationTime - animDelay) * 3);
    const offsetY = (1 - animProgress) * 50;
    const alpha = animProgress;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    
    const y = card.y + offsetY;
    
    // 卡片阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 5;
    
    // 卡片背景（白色带透明度）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    drawRoundRect(ctx, card.x, y, card.width, card.height, config.cornerRadius);
    ctx.fill();
    
    // 重置阴影
    ctx.shadowColor = 'transparent';
    
    // 游戏图标背景
    const iconBgX = card.x + 15;
    const iconBgY = y + (card.height - config.iconSize) / 2;
    
    // 图标背景渐变
    const iconGradient = ctx.createLinearGradient(
      iconBgX, iconBgY,
      iconBgX + config.iconSize, iconBgY + config.iconSize
    );
    iconGradient.addColorStop(0, '#FFD700');  // 金色
    iconGradient.addColorStop(1, '#FFA500');  // 橙色
    
    ctx.fillStyle = iconGradient;
    drawRoundRect(ctx, iconBgX, iconBgY, config.iconSize, config.iconSize, 12);
    ctx.fill();
    
    // 游戏图标（emoji）
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      card.icon,
      iconBgX + config.iconSize / 2,
      iconBgY + config.iconSize / 2
    );
    
    // 游戏名称
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 20px PingFang SC';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(card.name, iconBgX + config.iconSize + 15, y + 20);
    
    // 游戏描述
    ctx.fillStyle = '#666666';
    ctx.font = '14px PingFang SC';
    ctx.fillText(card.description, iconBgX + config.iconSize + 15, y + 50);
    
    // 右侧箭头
    ctx.fillStyle = '#4CAF50';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('▶', card.x + card.width - 30, y + card.height / 2);
    
    ctx.restore();
  }
  
  /**
   * 绘制底部信息
   */
  renderFooter(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '12px PingFang SC';
    ctx.textAlign = 'center';
    ctx.fillText('v1.0.0 | Made with ❤️', this.screenWidth / 2, this.screenHeight - 30);
  }
  
  /**
   * 触摸开始事件
   * 
   * @param {Object} touch - 触摸信息
   */
  onTouchStart(touch) {
    // 检查是否点击了某个游戏卡片
    for (const card of this.gameCards) {
      if (this.isPointInCard(touch.x, touch.y, card)) {
        console.log(`🎮 选择游戏: ${card.name}`);
        // 切换到对应的游戏
        this.gameManager.switchToGame(card);
        return;
      }
    }
  }
  
  /**
   * 触摸结束事件
   */
  onTouchEnd(touch) {
    // 大厅不需要处理触摸结束事件
  }
  
  /**
   * 检查点击是否在卡片范围内
   */
  isPointInCard(x, y, card) {
    return x >= card.x && x <= card.x + card.width &&
           y >= card.y && y <= card.y + card.height;
  }
  
  /**
   * 销毁大厅（清理资源）
   */
  destroy() {
    // 大厅通常不需要特别清理
    console.log('🏠 游戏大厅关闭');
  }
}
