/**
 * 愤怒的小鸟 - LevelManager
 * 
 * 关卡管理器，负责管理5个不同的关卡
 * 每个关卡有不同的障碍物布局和猪的位置
 */

export default class LevelManager {
  constructor(screenWidth, screenHeight) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    
    // 关卡配置
    this.levels = [
      this.createLevel1(),
      this.createLevel2(),
      this.createLevel3(),
      this.createLevel4(),
      this.createLevel5()
    ];
    
    this.currentLevel = 0;
  }
  
  /**
   * 获取当前关卡配置
   */
  getCurrentLevel() {
    return this.levels[this.currentLevel];
  }
  
  /**
   * 获取关卡总数
   */
  getTotalLevels() {
    return this.levels.length;
  }
  
  /**
   * 切换到下一关
   */
  nextLevel() {
    if (this.currentLevel < this.levels.length - 1) {
      this.currentLevel++;
      return true;
    }
    return false; // 已经是最后一关
  }
  
  /**
   * 获取当前关卡索引
   */
  getCurrentLevelIndex() {
    return this.currentLevel;
  }
  
  /**
   * 重置关卡管理器
   */
  reset() {
    this.currentLevel = 0;
  }
  
  /**
   * 重置到第一关
   */
  reset() {
    this.currentLevel = 0;
  }
  
  /**
   * 关卡1：简单结构
   * 一个简单的木块塔，里面有一只猪
   */
  createLevel1() {
    const groundY = this.screenHeight - 100;
    const level = {
      name: "关卡 1：入门挑战",
      description: "简单的木块结构，试试你的准头！",
      slingshotX: 100,
      slingshotY: groundY - 50,
      blocks: [],
      pigs: [],
      birds: 3
    };
    
    // 添加木块结构
    const blockWidth = 40;
    const blockHeight = 20;
    const startX = this.screenWidth - 200;
    
    // 基础平台
    level.blocks.push({
      x: startX - blockWidth / 2,
      y: groundY - blockHeight / 2,
      width: blockWidth * 3,
      height: blockHeight,
      type: 'wood'
    });
    
    // 垂直木块
    level.blocks.push({
      x: startX,
      y: groundY - blockHeight * 1.5,
      width: blockWidth,
      height: blockHeight * 2,
      type: 'wood'
    });
    
    // 添加猪
    level.pigs.push({
      x: startX,
      y: groundY - blockHeight * 2.5,
      health: 1
    });
    
    return level;
  }
  
  /**
   * 关卡2：双层结构
   * 两层木块结构，两只猪
   */
  createLevel2() {
    const groundY = this.screenHeight - 100;
    const level = {
      name: "关卡 2：双层防御",
      description: "双层木块结构，小心布局！",
      slingshotX: 100,
      slingshotY: groundY - 50,
      blocks: [],
      pigs: [],
      birds: 3
    };
    
    const blockWidth = 40;
    const blockHeight = 20;
    const startX = this.screenWidth - 250;
    
    // 基础平台
    level.blocks.push({
      x: startX - blockWidth / 2,
      y: groundY - blockHeight / 2,
      width: blockWidth * 4,
      height: blockHeight,
      type: 'wood'
    });
    
    // 第一层结构
    level.blocks.push({
      x: startX - blockWidth / 2,
      y: groundY - blockHeight * 1.5,
      width: blockWidth * 2,
      height: blockHeight,
      type: 'wood'
    });
    
    level.blocks.push({
      x: startX + blockWidth * 1.5,
      y: groundY - blockHeight * 1.5,
      width: blockWidth * 2,
      height: blockHeight,
      type: 'wood'
    });
    
    // 第二层结构
    level.blocks.push({
      x: startX + blockWidth / 2,
      y: groundY - blockHeight * 2.5,
      width: blockWidth * 2,
      height: blockHeight,
      type: 'wood'
    });
    
    // 添加猪
    level.pigs.push({
      x: startX,
      y: groundY - blockHeight * 1.5,
      health: 1
    });
    
    level.pigs.push({
      x: startX + blockWidth * 2,
      y: groundY - blockHeight * 2.5,
      health: 1
    });
    
    return level;
  }
  
  /**
   * 关卡3：混合材质
   * 包含木块和石块，三只猪
   */
  createLevel3() {
    const groundY = this.screenHeight - 100;
    const level = {
      name: "关卡 3：混合防御",
      description: "木块和石块混合，需要策略！",
      slingshotX: 100,
      slingshotY: groundY - 50,
      blocks: [],
      pigs: [],
      birds: 4
    };
    
    const blockWidth = 40;
    const blockHeight = 20;
    const startX = this.screenWidth - 300;
    
    // 基础平台（石块）
    level.blocks.push({
      x: startX - blockWidth / 2,
      y: groundY - blockHeight / 2,
      width: blockWidth * 5,
      height: blockHeight,
      type: 'stone'
    });
    
    // 左侧木块塔
    level.blocks.push({
      x: startX - blockWidth / 2,
      y: groundY - blockHeight * 1.5,
      width: blockWidth,
      height: blockHeight * 3,
      type: 'wood'
    });
    
    // 右侧木块塔
    level.blocks.push({
      x: startX + blockWidth * 4 - blockWidth / 2,
      y: groundY - blockHeight * 1.5,
      width: blockWidth,
      height: blockHeight * 3,
      type: 'wood'
    });
    
    // 顶部平台（木块）
    level.blocks.push({
      x: startX + blockWidth / 2,
      y: groundY - blockHeight * 3.5,
      width: blockWidth * 3,
      height: blockHeight,
      type: 'wood'
    });
    
    // 添加猪
    level.pigs.push({
      x: startX,
      y: groundY - blockHeight * 1.5,
      health: 1
    });
    
    level.pigs.push({
      x: startX + blockWidth * 2,
      y: groundY - blockHeight * 2.5,
      health: 1
    });
    
    level.pigs.push({
      x: startX + blockWidth * 4,
      y: groundY - blockHeight * 3.5,
      health: 1
    });
    
    return level;
  }
  
  /**
   * 关卡4：复杂结构
   * 更复杂的多层结构，四只猪
   */
  createLevel4() {
    const groundY = this.screenHeight - 100;
    const level = {
      name: "关卡 4：复杂堡垒",
      description: "多层复杂结构，考验你的技巧！",
      slingshotX: 100,
      slingshotY: groundY - 50,
      blocks: [],
      pigs: [],
      birds: 4
    };
    
    const blockWidth = 40;
    const blockHeight = 20;
    const startX = this.screenWidth - 350;
    
    // 基础平台（石块）
    level.blocks.push({
      x: startX - blockWidth / 2,
      y: groundY - blockHeight / 2,
      width: blockWidth * 6,
      height: blockHeight,
      type: 'stone'
    });
    
    // 第一层结构
    for (let i = 0; i < 3; i++) {
      level.blocks.push({
        x: startX + blockWidth * i,
        y: groundY - blockHeight * 1.5,
        width: blockWidth,
        height: blockHeight * 2,
        type: i === 1 ? 'stone' : 'wood'
      });
    }
    
    // 第二层结构
    level.blocks.push({
      x: startX + blockWidth / 2,
      y: groundY - blockHeight * 3.5,
      width: blockWidth * 2,
      height: blockHeight,
      type: 'wood'
    });
    
    level.blocks.push({
      x: startX + blockWidth * 3.5,
      y: groundY - blockHeight * 3.5,
      width: blockWidth * 2,
      height: blockHeight,
      type: 'wood'
    });
    
    // 第三层结构
    level.blocks.push({
      x: startX + blockWidth * 2,
      y: groundY - blockHeight * 4.5,
      width: blockWidth * 2,
      height: blockHeight,
      type: 'wood'
    });
    
    // 添加猪
    level.pigs.push({
      x: startX,
      y: groundY - blockHeight * 1.5,
      health: 1
    });
    
    level.pigs.push({
      x: startX + blockWidth * 2,
      y: groundY - blockHeight * 2.5,
      health: 1
    });
    
    level.pigs.push({
      x: startX + blockWidth * 4,
      y: groundY - blockHeight * 3.5,
      health: 1
    });
    
    level.pigs.push({
      x: startX + blockWidth * 3,
      y: groundY - blockHeight * 4.5,
      health: 1
    });
    
    return level;
  }
  
  /**
   * 关卡5：最终挑战
   * 最复杂的结构，五只猪
   */
  createLevel5() {
    const groundY = this.screenHeight - 100;
    const level = {
      name: "关卡 5：终极堡垒",
      description: "终极挑战！摧毁所有猪的堡垒！",
      slingshotX: 100,
      slingshotY: groundY - 50,
      blocks: [],
      pigs: [],
      birds: 5
    };
    
    const blockWidth = 40;
    const blockHeight = 20;
    const startX = this.screenWidth - 400;
    
    // 基础平台（石块）
    level.blocks.push({
      x: startX - blockWidth / 2,
      y: groundY - blockHeight / 2,
      width: blockWidth * 8,
      height: blockHeight,
      type: 'stone'
    });
    
    // 创建复杂的多层塔结构
    for (let layer = 0; layer < 5; layer++) {
      const layerWidth = blockWidth * (8 - layer * 2);
      const layerX = startX + blockWidth * layer;
      const layerY = groundY - blockHeight * (layer + 1.5);
      
      if (layerWidth > 0) {
        level.blocks.push({
          x: layerX,
          y: layerY,
          width: layerWidth,
          height: blockHeight,
          type: layer < 2 ? 'stone' : 'wood'
        });
      }
    }
    
    // 添加猪（分布在不同的层）
    level.pigs.push({
      x: startX + blockWidth * 2,
      y: groundY - blockHeight * 2.5,
      health: 1
    });
    
    level.pigs.push({
      x: startX + blockWidth * 4,
      y: groundY - blockHeight * 2.5,
      health: 1
    });
    
    level.pigs.push({
      x: startX + blockWidth * 3,
      y: groundY - blockHeight * 3.5,
      health: 1
    });
    
    level.pigs.push({
      x: startX + blockWidth * 5,
      y: groundY - blockHeight * 4.5,
      health: 1
    });
    
    level.pigs.push({
      x: startX + blockWidth * 4,
      y: groundY - blockHeight * 5.5,
      health: 1
    });
    
    return level;
  }
}