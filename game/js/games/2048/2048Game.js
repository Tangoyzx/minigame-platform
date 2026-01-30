/**
 * 2048游戏 - 2048Game
 * 
 * 经典的2048数字合并游戏！通过滑动将相同数字合并，
 * 最终目标是合成2048数字方块。
 * 
 * 游戏特色：
 * - 4x4网格数字方块
 * - 上下左右滑动控制
 * - 数字合并机制（2+2=4, 4+4=8...）
 * - 游戏胜利条件（合成2048）
 * - 游戏结束检测（无法继续移动）
 * - 触摸滑动和键盘控制
 */

import BaseGame from '../../base/BaseGame.js';
import { randomInt } from '../../utils/utils.js';

export default class Game2048 extends BaseGame {
  /**
   * 构造函数
   */
  constructor(gameManager) {
    super(gameManager);
    
    // 游戏配置
    this.gridSize = 4;  // 4x4网格
    this.cellSize = 0;   // 方块大小（根据屏幕计算）
    this.gridPadding = 10;  // 网格内边距
    
    // 游戏状态
    this.grid = [];      // 4x4网格数组
    this.score = 0;     // 当前得分
    this.bestScore = 0; // 最高得分
    this.gameStarted = false;  // 游戏是否开始
    this.isGameOver = false;   // 游戏是否结束
    this.isWin = false;        // 是否胜利
    
    // 触摸控制相关
    this.touchStartPos = null;    // 触摸开始位置
    this.touchEndPos = null;      // 触摸结束位置
    this.swipeThreshold = 30;     // 滑动阈值
    this.lastMoveTime = 0;        // 上次移动时间
    this.moveCooldown = 150;      // 移动冷却时间（毫秒）
    
    // 颜色配置 - 不同数字对应的颜色
    this.cellColors = {
      0: '#CDC1B4',     // 空单元格
      2: '#EEE4DA',     // 2
      4: '#EDE0C8',     // 4
      8: '#F2B179',     // 8
      16: '#F59563',    // 16
      32: '#F67C5F',    // 32
      64: '#F65E3B',    // 64
      128: '#EDCF72',   // 128
      256: '#EDCC61',   // 256
      512: '#EDC850',   // 512
      1024: '#EDC53F',  // 1024
      2048: '#EDC22E',  // 2048
      4096: '#3C3A32'   // 4096及以上
    };
    
    // 文字颜色配置
    this.textColors = {
      2: '#776E65',     // 小数字用深色
      4: '#776E65',
      8: '#F9F6F2',     // 大数字用浅色
      16: '#F9F6F2',
      32: '#F9F6F2',
      64: '#F9F6F2',
      128: '#F9F6F2',
      256: '#F9F6F2',
      512: '#F9F6F2',
      1024: '#F9F6F2',
      2048: '#F9F6F2',
      4096: '#F9F6F2'
    };
  }
  
  /**
   * 初始化游戏
   */
  init() {
    super.init();
    
    // 计算方块大小
    const availableWidth = this.screenWidth - this.gridPadding * 2;
    this.cellSize = Math.floor(availableWidth / this.gridSize);
    
    // 初始化网格（4x4，全部为0）
    this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(0));
    
    // 重置游戏状态
    this.score = 0;
    this.bestScore = 0;
    this.gameStarted = false;
    this.isGameOver = false;
    this.isWin = false;
    
    // 生成初始的两个数字（2或4）
    this.addRandomTile();
    this.addRandomTile();
    
    console.log('🎮 2048游戏初始化完成，等待用户开始');
  }
  
  /**
   * 更新游戏逻辑
   */
  update(deltaTime) {
    super.update(deltaTime);
    
    // 如果游戏未开始或已结束，不更新
    if (!this.gameStarted || this.isGameOver) {
      return;
    }
    
    // 检查胜利条件
    if (!this.isWin && this.checkWinCondition()) {
      this.isWin = true;
      console.log('🎉 恭喜！你成功合成了2048！');
    }
    
    // 检查游戏结束条件
    if (!this.isGameOver && this.checkGameOver()) {
      this.gameOver();
    }
  }
  
  /**
   * 渲染游戏画面
   */
  render(ctx) {
    // 清空画布
    ctx.fillStyle = '#FAF8EF';
    ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
    
    if (!this.gameStarted) {
      this.renderStartScreen(ctx);
      return;
    }
    
    if (this.isGameOver) {
      this.renderGameOver(ctx);
      return;
    }
    
    if (this.isWin) {
      this.renderWinScreen(ctx);
      return;
    }
    
    // 绘制游戏标题和分数
    this.drawHeader(ctx);
    
    // 绘制游戏网格
    this.drawGrid(ctx);
    
    // 绘制返回按钮
    this.renderBackButton(ctx);
    
    // 绘制操作提示
    this.drawControlsHint(ctx);
  }
  
  /**
   * 绘制游戏标题和分数
   */
  drawHeader(ctx) {
    // 游戏标题
    ctx.fillStyle = '#776E65';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('2048', 20, 60);
    
    // 分数面板背景
    const scoreX = this.screenWidth - 150;
    const scoreY = 20;
    const scoreWidth = 130;
    const scoreHeight = 60;
    
    ctx.fillStyle = '#BBADA0';
    this.drawRoundedRect(ctx, scoreX, scoreY, scoreWidth, scoreHeight, 6);
    ctx.fill();
    
    // 分数文字
    ctx.fillStyle = '#EEE4DA';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('分数', scoreX + scoreWidth / 2, scoreY + 20);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(this.score.toString(), scoreX + scoreWidth / 2, scoreY + 45);
    
    // 最高分数面板
    const bestScoreX = scoreX - 140;
    const bestScoreY = scoreY;
    const bestScoreWidth = 130;
    const bestScoreHeight = 60;
    
    ctx.fillStyle = '#BBADA0';
    this.drawRoundedRect(ctx, bestScoreX, bestScoreY, bestScoreWidth, bestScoreHeight, 6);
    ctx.fill();
    
    // 最高分数文字
    ctx.fillStyle = '#EEE4DA';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('最高分', bestScoreX + bestScoreWidth / 2, bestScoreY + 20);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(this.bestScore.toString(), bestScoreX + bestScoreWidth / 2, bestScoreY + 45);
  }
  
  /**
   * 绘制游戏网格
   */
  drawGrid(ctx) {
    const gridX = this.gridPadding;
    const gridY = 100;  // 从标题下方开始
    
    // 绘制网格背景
    ctx.fillStyle = '#BBADA0';
    this.drawRoundedRect(ctx, gridX, gridY, this.cellSize * this.gridSize, this.cellSize * this.gridSize, 6);
    ctx.fill();
    
    // 绘制每个单元格
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const value = this.grid[row][col];
        const cellX = gridX + col * this.cellSize;
        const cellY = gridY + row * this.cellSize;
        
        // 绘制单元格背景
        ctx.fillStyle = this.cellColors[value] || this.cellColors[0];
        this.drawRoundedRect(ctx, cellX + 5, cellY + 5, this.cellSize - 10, this.cellSize - 10, 3);
        ctx.fill();
        
        // 如果单元格有数字，绘制数字
        if (value > 0) {
          ctx.fillStyle = this.textColors[value] || this.textColors[2048];
          
          // 根据数字大小调整字体大小
          let fontSize = 36;
          if (value >= 1000) fontSize = 24;
          if (value >= 10000) fontSize = 20;
          
          ctx.font = `bold ${fontSize}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            value.toString(),
            cellX + this.cellSize / 2,
            cellY + this.cellSize / 2
          );
        }
      }
    }
  }
  
  /**
   * 绘制操作提示
   */
  drawControlsHint(ctx) {
    ctx.fillStyle = '#776E65';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      '使用方向键或触摸滑动来控制方块移动',
      this.screenWidth / 2,
      this.screenHeight - 30
    );
  }
  
  /**
   * 绘制圆角矩形（工具函数）
   */
  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  }
  
  /**
   * 绘制开始界面
   */
  renderStartScreen(ctx) {
    // 半透明遮罩
    ctx.fillStyle = 'rgba(250, 248, 239, 0.9)';
    ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
    
    // 游戏标题
    ctx.fillStyle = '#776E65';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('2048', this.screenWidth / 2, this.screenHeight / 2 - 80);
    
    // 开始按钮
    const buttonX = this.screenWidth / 2 - 80;
    const buttonY = this.screenHeight / 2;
    const buttonWidth = 160;
    const buttonHeight = 60;
    
    ctx.fillStyle = '#8F7A66';
    this.drawRoundedRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, 10);
    ctx.fill();
    
    ctx.fillStyle = '#F9F6F2';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('开始游戏', this.screenWidth / 2, buttonY + buttonHeight / 2);
    
    // 游戏说明
    ctx.fillStyle = '#776E65';
    ctx.font = '16px Arial';
    ctx.fillText('滑动合并相同数字，目标是合成2048！', this.screenWidth / 2, this.screenHeight / 2 + 100);
    ctx.fillText('使用方向键或触摸滑动控制', this.screenWidth / 2, this.screenHeight / 2 + 130);
  }
  
  /**
   * 绘制游戏结束界面
   */
  renderGameOver(ctx) {
    // 半透明遮罩
    ctx.fillStyle = 'rgba(238, 228, 218, 0.8)';
    ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
    
    // 游戏结束文字
    ctx.fillStyle = '#776E65';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', this.screenWidth / 2, this.screenHeight / 2 - 60);
    
    // 最终得分
    ctx.font = '24px Arial';
    ctx.fillText(`最终得分: ${this.score}`, this.screenWidth / 2, this.screenHeight / 2);
    
    // 重新开始按钮
    const buttonX = this.screenWidth / 2 - 100;
    const buttonY = this.screenHeight / 2 + 50;
    const buttonWidth = 200;
    const buttonHeight = 60;
    
    ctx.fillStyle = '#8F7A66';
    this.drawRoundedRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, 10);
    ctx.fill();
    
    ctx.fillStyle = '#F9F6F2';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('重新开始', this.screenWidth / 2, buttonY + buttonHeight / 2);
  }
  
  /**
   * 绘制胜利界面
   */
  renderWinScreen(ctx) {
    // 半透明遮罩
    ctx.fillStyle = 'rgba(237, 194, 46, 0.8)';
    ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
    
    // 胜利文字
    ctx.fillStyle = '#776E65';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('恭喜胜利！', this.screenWidth / 2, this.screenHeight / 2 - 60);
    
    // 得分
    ctx.font = '24px Arial';
    ctx.fillText(`得分: ${this.score}`, this.screenWidth / 2, this.screenHeight / 2);
    
    // 继续游戏按钮
    const buttonX = this.screenWidth / 2 - 100;
    const buttonY = this.screenHeight / 2 + 50;
    const buttonWidth = 200;
    const buttonHeight = 60;
    
    ctx.fillStyle = '#8F7A66';
    this.drawRoundedRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, 10);
    ctx.fill();
    
    ctx.fillStyle = '#F9F6F2';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('继续游戏', this.screenWidth / 2, buttonY + buttonHeight / 2);
    
    // 提示文字
    ctx.font = '16px Arial';
    ctx.fillText('你可以继续游戏挑战更高分数！', this.screenWidth / 2, this.screenHeight / 2 + 130);
  }
  
  /**
   * 添加随机数字方块
   */
  addRandomTile() {
    const emptyCells = [];
    
    // 收集所有空单元格的位置
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col] === 0) {
          emptyCells.push({ row, col });
        }
      }
    }
    
    // 如果有空单元格，随机选择一个并放置数字（90%概率为2，10%概率为4）
    if (emptyCells.length > 0) {
      const randomCell = emptyCells[randomInt(0, emptyCells.length - 1)];
      this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
    }
  }
  
  /**
   * 移动网格（核心逻辑）
   * @param {string} direction - 移动方向：'up', 'down', 'left', 'right'
   * @returns {boolean} 是否发生了移动
   */
  move(direction) {
    let moved = false;
    const oldGrid = this.grid.map(row => [...row]);  // 保存移动前的网格状态
    
    switch (direction) {
      case 'up':
        moved = this.moveUp();
        break;
      case 'down':
        moved = this.moveDown();
        break;
      case 'left':
        moved = this.moveLeft();
        break;
      case 'right':
        moved = this.moveRight();
        break;
    }
    
    // 如果发生了移动，添加新数字并更新分数
    if (moved) {
      this.addRandomTile();
      
      // 检查网格是否变化
      const gridChanged = this.grid.some((row, i) => 
        row.some((cell, j) => cell !== oldGrid[i][j])
      );
      
      if (gridChanged) {
        console.log(`移动方向: ${direction}, 得分: ${this.score}`);
      }
    }
    
    return moved;
  }
  
  /**
   * 向上移动
   */
  moveUp() {
    let moved = false;
    
    for (let col = 0; col < this.gridSize; col++) {
      // 处理每一列
      const column = [];
      for (let row = 0; row < this.gridSize; row++) {
        if (this.grid[row][col] !== 0) {
          column.push(this.grid[row][col]);
        }
      }
      
      // 合并相同数字
      const mergedColumn = this.mergeTiles(column);
      
      // 更新网格
      for (let row = 0; row < this.gridSize; row++) {
        const newValue = row < mergedColumn.length ? mergedColumn[row] : 0;
        if (this.grid[row][col] !== newValue) {
          moved = true;
        }
        this.grid[row][col] = newValue;
      }
    }
    
    return moved;
  }
  
  /**
   * 向下移动
   */
  moveDown() {
    let moved = false;
    
    for (let col = 0; col < this.gridSize; col++) {
      // 处理每一列（从下往上）
      const column = [];
      for (let row = this.gridSize - 1; row >= 0; row--) {
        if (this.grid[row][col] !== 0) {
          column.push(this.grid[row][col]);
        }
      }
      
      // 合并相同数字
      const mergedColumn = this.mergeTiles(column);
      
      // 更新网格（从下往上填充）
      for (let row = this.gridSize - 1; row >= 0; row--) {
        const index = this.gridSize - 1 - row;
        const newValue = index < mergedColumn.length ? mergedColumn[index] : 0;
        if (this.grid[row][col] !== newValue) {
          moved = true;
        }
        this.grid[row][col] = newValue;
      }
    }
    
    return moved;
  }
  
  /**
   * 向左移动
   */
  moveLeft() {
    let moved = false;
    
    for (let row = 0; row < this.gridSize; row++) {
      // 处理每一行
      const line = [];
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col] !== 0) {
          line.push(this.grid[row][col]);
        }
      }
      
      // 合并相同数字
      const mergedLine = this.mergeTiles(line);
      
      // 更新网格
      for (let col = 0; col < this.gridSize; col++) {
        const newValue = col < mergedLine.length ? mergedLine[col] : 0;
        if (this.grid[row][col] !== newValue) {
          moved = true;
        }
        this.grid[row][col] = newValue;
      }
    }
    
    return moved;
  }
  
  /**
   * 向右移动
   */
  moveRight() {
    let moved = false;
    
    for (let row = 0; row < this.gridSize; row++) {
      // 处理每一行（从右往左）
      const line = [];
      for (let col = this.gridSize - 1; col >= 0; col--) {
        if (this.grid[row][col] !== 0) {
          line.push(this.grid[row][col]);
        }
      }
      
      // 合并相同数字
      const mergedLine = this.mergeTiles(line);
      
      // 更新网格（从右往左填充）
      for (let col = this.gridSize - 1; col >= 0; col--) {
        const index = this.gridSize - 1 - col;
        const newValue = index < mergedLine.length ? mergedLine[index] : 0;
        if (this.grid[row][col] !== newValue) {
          moved = true;
        }
        this.grid[row][col] = newValue;
      }
    }
    
    return moved;
  }
  
  /**
   * 合并相同数字
   * @param {Array} tiles - 需要合并的数字数组
   * @returns {Array} 合并后的数组
   */
  mergeTiles(tiles) {
    const result = [];
    let i = 0;
    
    while (i < tiles.length) {
      if (i < tiles.length - 1 && tiles[i] === tiles[i + 1]) {
        // 合并相同数字
        const mergedValue = tiles[i] * 2;
        result.push(mergedValue);
        
        // 增加分数（合并后的数字值）
        this.score += mergedValue;
        
        // 更新最高分
        if (this.score > this.bestScore) {
          this.bestScore = this.score;
        }
        
        i += 2;  // 跳过下一个数字（已经合并）
      } else {
        // 不合并，直接添加
        result.push(tiles[i]);
        i += 1;
      }
    }
    
    return result;
  }
  
  /**
   * 检查胜利条件
   * @returns {boolean} 是否胜利（合成2048）
   */
  checkWinCondition() {
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col] === 2048) {
          return true;
        }
      }
    }
    return false;
  }
  
  /**
   * 检查游戏结束条件
   * @returns {boolean} 游戏是否结束（无法继续移动）
   */
  checkGameOver() {
    // 检查是否有空单元格
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col] === 0) {
          return false;  // 还有空单元格，游戏可以继续
        }
      }
    }
    
    // 检查是否还有可以合并的相邻数字
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const current = this.grid[row][col];
        
        // 检查右侧数字
        if (col < this.gridSize - 1 && this.grid[row][col + 1] === current) {
          return false;
        }
        
        // 检查下方数字
        if (row < this.gridSize - 1 && this.grid[row + 1][col] === current) {
          return false;
        }
      }
    }
    
    return true;  // 没有空单元格且没有可合并的数字，游戏结束
  }
  
  /**
   * 游戏结束处理
   */
  gameOver() {
    this.isGameOver = true;
    this.gameStarted = false;
    console.log('💀 2048游戏结束，最终得分:', this.score);
  }
  
  /**
   * 触摸开始事件
   */
  onTouchStart(touch) {
    // 检查是否点击了返回按钮
    if (super.onTouchStart(touch)) {
      return true;
    }
    
    // 记录触摸开始位置
    this.touchStartPos = { x: touch.x, y: touch.y };
    
    // 如果游戏未开始，点击屏幕开始游戏
    if (!this.gameStarted && !this.isGameOver && !this.isWin) {
      this.gameStarted = true;
      console.log('▶️ 2048游戏开始');
      return true;
    }
    
    // 如果游戏结束，点击屏幕重新开始
    if (this.isGameOver) {
      this.init();
      this.gameStarted = false;
      console.log('🔄 2048游戏重置，等待用户开始');
      return true;
    }
    
    // 如果胜利，点击屏幕继续游戏
    if (this.isWin) {
      this.isWin = false;
      console.log('➡️ 继续游戏，挑战更高分数');
      return true;
    }
    
    return true;
  }
  
  /**
   * 触摸移动事件
   */
  onTouchMove(touch) {
    // 记录触摸移动位置（用于绘制滑动指示器）
    this.touchEndPos = { x: touch.x, y: touch.y };
  }
  
  /**
   * 触摸结束事件
   */
  onTouchEnd(touch) {
    if (!this.touchStartPos || !this.gameStarted || this.isGameOver || this.isWin) {
      return;
    }
    
    // 检查移动冷却时间
    const currentTime = Date.now();
    if (currentTime - this.lastMoveTime < this.moveCooldown) {
      return;
    }
    
    // 计算滑动距离
    const deltaX = touch.x - this.touchStartPos.x;
    const deltaY = touch.y - this.touchStartPos.y;
    
    // 确定滑动方向
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.swipeThreshold) {
      // 水平滑动
      if (deltaX > 0) {
        this.move('right');
      } else {
        this.move('left');
      }
      this.lastMoveTime = currentTime;
    } else if (Math.abs(deltaY) > this.swipeThreshold) {
      // 垂直滑动
      if (deltaY > 0) {
        this.move('down');
      } else {
        this.move('up');
      }
      this.lastMoveTime = currentTime;
    }
    
    // 重置触摸位置
    this.touchStartPos = null;
    this.touchEndPos = null;
  }
  
  // 微信小游戏主要支持触摸事件，键盘控制在此环境中不适用
  // 游戏通过触摸滑动进行控制
  
  /**
   * 销毁游戏
   */
  destroy() {
    super.destroy();
    this.gameStarted = false;
  }
}