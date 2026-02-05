/**
 * 愤怒的小鸟 - Block
 * 
 * 障碍物类，继承自 RectBody
 * 用于搭建关卡中的木块、石块等结构
 */

import RectBody from '../../physics/RectBody.js';

export default class Block {
  constructor(x, y, width, height, type = 'wood') {
    // 创建障碍物的物理体
    this.body = new RectBody(x, y, width, height);
    this.body.tag = 'block';
    
    // 障碍物属性
    this.type = type; // wood, stone, glass
    this.health = this.getHealthByType(type);
    this.isDestroyed = false;
    
    // 不同材质的颜色配置
    this.colors = {
      wood: {
        main: '#8B4513',    // 棕色
        highlight: '#A0522D', // 浅棕色
        damage: '#654321'    // 深棕色
      },
      stone: {
        main: '#808080',    // 灰色
        highlight: '#A9A9A9', // 浅灰色
        damage: '#696969'    // 深灰色
      },
      glass: {
        main: 'rgba(173, 216, 230, 0.7)', // 浅蓝色半透明
        highlight: 'rgba(135, 206, 250, 0.8)',
        damage: 'rgba(100, 149, 237, 0.6)'
      }
    };
  }
  
  /**
   * 根据材质类型获取生命值
   */
  getHealthByType(type) {
    switch (type) {
      case 'wood': return 2;
      case 'stone': return 3;
      case 'glass': return 1;
      default: return 2;
    }
  }
  
  /**
   * 获取物理体
   */
  getBody() {
    return this.body;
  }
  
  /**
   * 更新障碍物状态
   */
  update(dt) {
    // 障碍物不需要特殊更新逻辑
  }
  
  /**
   * 绘制障碍物
   */
  render(ctx) {
    if (this.isDestroyed) return;
    
    const bounds = this.body.getBounds();
    const color = this.colors[this.type];
    
    ctx.save();
    
    // 根据生命值调整颜色（受伤效果）
    let mainColor = color.main;
    if (this.health < this.getHealthByType(this.type)) {
      mainColor = color.damage;
    }
    
    // 绘制障碍物主体
    ctx.fillStyle = mainColor;
    ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    
    // 绘制边框
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    
    // 根据材质类型绘制不同纹理
    this.drawTexture(ctx, bounds, color);
    
    ctx.restore();
  }
  
  /**
   * 绘制材质纹理
   */
  drawTexture(ctx, bounds, color) {
    const { x, y, width, height } = bounds;
    
    switch (this.type) {
      case 'wood':
        // 木纹效果
        ctx.strokeStyle = color.highlight;
        ctx.lineWidth = 1;
        
        // 水平木纹
        for (let i = 0; i < height; i += 4) {
          ctx.beginPath();
          ctx.moveTo(x, y + i);
          ctx.lineTo(x + width, y + i);
          ctx.stroke();
        }
        break;
        
      case 'stone':
        // 石头纹理（随机斑点）
        ctx.fillStyle = color.highlight;
        for (let i = 0; i < 5; i++) {
          const spotX = x + Math.random() * width;
          const spotY = y + Math.random() * height;
          const spotSize = Math.random() * 3 + 1;
          
          ctx.beginPath();
          ctx.arc(spotX, spotY, spotSize, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
        
      case 'glass':
        // 玻璃反光效果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        
        // 左上角反光
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width * 0.3, y);
        ctx.lineTo(x, y + height * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // 右下角反光
        ctx.beginPath();
        ctx.moveTo(x + width, y + height);
        ctx.lineTo(x + width * 0.7, y + height);
        ctx.lineTo(x + width, y + height * 0.7);
        ctx.closePath();
        ctx.fill();
        break;
    }
  }
  
  /**
   * 障碍物受到伤害
   */
  takeDamage(damage = 1) {
    this.health -= damage;
    if (this.health <= 0) {
      this.isDestroyed = true;
      return true; // 障碍物被摧毁
    }
    return false;
  }
  
  /**
   * 检查障碍物是否被摧毁
   */
  isDestroyed() {
    return this.isDestroyed;
  }
  
  /**
   * 重置障碍物状态
   */
  reset(x, y) {
    this.body.setPosition(x, y);
    this.body.reset();
    this.isDestroyed = false;
    this.health = this.getHealthByType(this.type);
  }
}