/**
 * 连连看游戏 - LinkGame
 * 
 * 经典的连连看游戏，包含5个关卡系统，每关有不同的形状和掉落方向
 * 实现路径检测算法（支持直线、单拐角、双拐角连接）
 * 添加计时计分系统，集成到现有游戏平台架构中
 */

import BaseGame from '../../base/BaseGame.js';
import { LinkGameAlgorithm } from './LinkGameAlgorithm.js';
import { randomInt, drawRoundRect } from '../../utils/utils.js';

export default class LinkGame extends BaseGame {
  /**
   * 构造函数
   */
  constructor(gameManager) {
    super(gameManager);
    
    // 游戏配置
    this.gridSize = 60;  // 格子大小
    this.gridRows = 8;   // 网格行数
    this.gridCols = 10;  // 网格列数
    this.gridMargin = 20; // 网格边距
    
    // 计算网格位置（居中）
    this.gridWidth = this.gridCols * this.gridSize;
    this.gridHeight = this.gridRows * this.gridSize;
    this.gridX = (this.screenWidth - this.gridWidth) / 2;
    this.gridY = (this.screenHeight - this.gridHeight) / 2 + 30;
    
    // 游戏状态
    this.currentLevel = 1;
    this.totalLevels = 5;
    this.score = 0;
    this.timeLeft = 180; // 3分钟
    this.gameStarted = false;
    this.isGameOver = false;
        
    // 选中的格子
    this.selectedCell = null;
    this.hintCell = null;
    
    // 连接线相关
    this.connectionPath = null;
    this.connectionTimer = 0;
    
    // 游戏数据
    this.grid = [];
    this.algorithm = null;
    
    // 关卡配置
    this.levelConfigs = {
      1: { patterns: 10, dropDirection: 'top', difficulty: 'easy' },
      2: { patterns: 15, dropDirection: 'bottom', difficulty: 'easy' },
      3: { patterns: 20, dropDirection: 'left', difficulty: 'medium' },
      4: { patterns: 25, dropDirection: 'right', difficulty: 'medium' },
      5: { patterns: 30, dropDirection: 'random', difficulty: 'hard' }
    };
    
    // 图案库
    this.patterns = this.generatePatterns();
    
    // 计时器
    this.lastUpdateTime = 0;
  }
  
  /**
   * 初始化游戏
   */
  init() {
    super.init();
    
    // 重置游戏状态
    this.currentLevel = 1;
    this.score = 0;
    this.timeLeft = 180;
    this.gameStarted = false;
    this.isGameOver = false;
    this.selectedCell = null;
    this.hintCell = null;
    this.connectionPath = null;
    this.connectionTimer = 0;
    
    // 初始化网格
    this.initializeGrid();
    
    // 创建算法实例
    this.algorithm = new LinkGameAlgorithm(this.grid);
    
    console.log('🔗 连连看游戏初始化完成');
  }
  
  /**
   * 生成图案库
   */
  generatePatterns() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
      '#F9E79F', '#AED6F1', '#ABEBC6', '#FAD7A0', '#D5DBDB'
    ];
    
    const shapes = ['circle', 'square', 'triangle', 'diamond', 'star', 'heart'];
    
    const patterns = [];
    let id = 1;
    
    // 生成30种不同的图案组合
    for (let i = 0; i < colors.length; i++) {
      for (let j = 0; j < shapes.length; j++) {
        if (patterns.length >= 30) break;
        
        patterns.push({
          id: id++,
          color: colors[i],
          shape: shapes[j],
          name: `${shapes[j]}_${colors[i].substring(1)}`
        });
      }
    }
    
    return patterns;
  }
  
  /**
   * 初始化网格
   */
  initializeGrid() {
    this.grid = [];
    
    // 创建空网格
    for (let row = 0; row < this.gridRows; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.gridCols; col++) {
        this.grid[row][col] = {
          row: row,
          col: col,
          pattern: null,
          visible: false,
          matched: false,
          x: this.gridX + col * this.gridSize,
          y: this.gridY + row * this.gridSize
        };
      }
    }
    
    // 根据当前关卡配置填充图案
    this.fillGridWithPatterns();
  }
  
  /**
   * 根据关卡配置填充图案
   */
  fillGridWithPatterns() {
    const levelConfig = this.levelConfigs[this.currentLevel];
    const patternCount = levelConfig.patterns;
    
    // 选择当前关卡使用的图案
    const availablePatterns = this.patterns.slice(0, patternCount);
    
    // 创建图案对（每个图案出现两次）
    const patternPairs = [];
    for (const pattern of availablePatterns) {
      patternPairs.push(pattern, pattern);
    }
    
    // 打乱顺序
    this.shuffleArray(patternPairs);
    
    // 填充网格
    let patternIndex = 0;
    const totalCells = this.gridRows * this.gridCols;
    
    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        if (patternIndex < patternPairs.length && patternIndex < totalCells) {
          this.grid[row][col].pattern = patternPairs[patternIndex];
          this.grid[row][col].visible = true;
          this.grid[row][col].matched = false;
          patternIndex++;
        } else {
          this.grid[row][col].visible = false;
          this.grid[row][col].matched = true;
        }
      }
    }
  }
  
  /**
   * 打乱数组
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  
  /**
   * 更新游戏逻辑
   */
  update(deltaTime) {
    super.update(deltaTime);
    
    if (!this.gameStarted || this.isGameOver) {
      return;
    }
    
    // 更新时间
    this.lastUpdateTime += deltaTime;
    
    // 每秒更新一次计时器
    if (this.lastUpdateTime >= 1) {
      this.timeLeft--;
      this.lastUpdateTime = 0;
      
      // 检查时间是否用完
      if (this.timeLeft <= 0) {
        this.gameOver();
        return;
      }
    }
    
    // 处理连接线动画
    if (this.connectionPath) {
      this.connectionTimer += deltaTime;
      if (this.connectionTimer >= 0.5) {
        this.connectionPath = null;
        this.connectionTimer = 0;
      }
    }
    
    // 检查游戏是否完成
    if (this.checkLevelComplete()) {
      this.completeLevel();
    }
  }
  
  /**
   * 渲染游戏画面
   */
  render(ctx) {
    // 清空画布
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
    
    if (!this.gameStarted) {
      this.renderStartScreen(ctx);
      return;
    }
    
    if (this.isGameOver) {
      this.renderGameOver(ctx);
      return;
    }
    
    // 绘制游戏界面
    this.renderGameUI(ctx);
    this.renderGrid(ctx);
    this.renderConnectionLine(ctx);
    this.renderSelectedCell(ctx);
    this.renderHintCell(ctx);
    
    // 绘制返回按钮
    this.renderBackButton(ctx);
  }
  
  /**
   * 渲染游戏UI
   */
  renderGameUI(ctx) {
    // 顶部信息栏
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.screenWidth, 60);
    
    // 关卡信息
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px PingFang SC';
    ctx.textAlign = 'left';
    ctx.fillText(`关卡: ${this.currentLevel}/${this.totalLevels}`, 20, 25);
    
    // 分数
    ctx.textAlign = 'center';
    ctx.fillText(`分数: ${this.score}`, this.screenWidth / 2, 25);
    
    // 时间
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    ctx.textAlign = 'right';
    ctx.fillText(`时间: ${minutes}:${seconds.toString().padStart(2, '0')}`, this.screenWidth - 20, 25);
    
    // 提示按钮
    this.renderHintButton(ctx);
  }
  
  /**
   * 渲染提示按钮
   */
  renderHintButton(ctx) {
    const hintButton = {
      x: this.screenWidth - 120,
      y: 70,
      width: 100,
      height: 40
    };
    
    // 绘制按钮背景
    ctx.fillStyle = '#3498DB';
    drawRoundRect(ctx, hintButton.x, hintButton.y, hintButton.width, hintButton.height, 8);
    ctx.fill();
    
    // 绘制按钮文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px PingFang SC';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('提示', hintButton.x + hintButton.width / 2, hintButton.y + hintButton.height / 2);
    
    this.hintButton = hintButton;
  }
  
  /**
   * 渲染网格
   */
  renderGrid(ctx) {
    // 绘制网格背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    drawRoundRect(ctx, this.gridX - 10, this.gridY - 10, this.gridWidth + 20, this.gridHeight + 20, 15);
    ctx.fill();
    
    // 绘制网格线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    
    // 垂直线
    for (let col = 0; col <= this.gridCols; col++) {
      const x = this.gridX + col * this.gridSize;
      ctx.beginPath();
      ctx.moveTo(x, this.gridY);
      ctx.lineTo(x, this.gridY + this.gridHeight);
      ctx.stroke();
    }
    
    // 水平线
    for (let row = 0; row <= this.gridRows; row++) {
      const y = this.gridY + row * this.gridSize;
      ctx.beginPath();
      ctx.moveTo(this.gridX, y);
      ctx.lineTo(this.gridX + this.gridWidth, y);
      ctx.stroke();
    }
    
    // 绘制格子内容
    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        const cell = this.grid[row][col];
        if (cell.visible && !cell.matched) {
          this.renderCell(ctx, cell);
        }
      }
    }
  }
  
  /**
   * 渲染单个格子
   */
  renderCell(ctx, cell) {
    const centerX = cell.x + this.gridSize / 2;
    const centerY = cell.y + this.gridSize / 2;
    const radius = this.gridSize / 2 - 5;
    
    // 绘制格子背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    drawRoundRect(ctx, cell.x, cell.y, this.gridSize, this.gridSize, 8);
    ctx.fill();
    
    if (cell.pattern) {
      // 绘制图案
      ctx.fillStyle = cell.pattern.color;
      
      switch (cell.pattern.shape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'square':
          ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
          break;
          
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(centerX, centerY - radius);
          ctx.lineTo(centerX + radius, centerY + radius);
          ctx.lineTo(centerX - radius, centerY + radius);
          ctx.closePath();
          ctx.fill();
          break;
          
        case 'diamond':
          ctx.beginPath();
          ctx.moveTo(centerX, centerY - radius);
          ctx.lineTo(centerX + radius, centerY);
          ctx.lineTo(centerX, centerY + radius);
          ctx.lineTo(centerX - radius, centerY);
          ctx.closePath();
          ctx.fill();
          break;
          
        case 'star':
          this.drawStar(ctx, centerX, centerY, radius);
          break;
          
        case 'heart':
          this.drawHeart(ctx, centerX, centerY, radius);
          break;
      }
      
      // 绘制边框
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      drawRoundRect(ctx, cell.x, cell.y, this.gridSize, this.gridSize, 8);
      ctx.stroke();
    }
  }
  
  /**
   * 绘制星星
   */
  drawStar(ctx, x, y, radius) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
      const outerX = x + radius * Math.cos(angle);
      const outerY = y + radius * Math.sin(angle);
      
      if (i === 0) {
        ctx.moveTo(outerX, outerY);
      } else {
        ctx.lineTo(outerX, outerY);
      }
      
      const innerAngle = angle + Math.PI / 5;
      const innerX = x + radius * 0.4 * Math.cos(innerAngle);
      const innerY = y + radius * 0.4 * Math.sin(innerAngle);
      ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fill();
  }
  
  /**
   * 绘制心形
   */
  drawHeart(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(
      x + radius, y - radius * 0.7,
      x + radius * 1.5, y,
      x, y + radius
    );
    ctx.bezierCurveTo(
      x - radius * 1.5, y,
      x - radius, y - radius * 0.7,
      x, y
    );
    ctx.closePath();
    ctx.fill();
  }
  
  /**
   * 渲染选中的格子
   */
  renderSelectedCell(ctx) {
    if (this.selectedCell) {
      const cell = this.selectedCell;
      
      // 绘制选中框
      ctx.strokeStyle = '#F39C12';
      ctx.lineWidth = 3;
      drawRoundRect(ctx, cell.x, cell.y, this.gridSize, this.gridSize, 8);
      ctx.stroke();
    }
  }
  
  /**
   * 渲染提示格子
   */
  renderHintCell(ctx) {
    if (this.hintCell) {
      const cell = this.hintCell;
      
      // 绘制提示框（闪烁效果）
      const alpha = Math.sin(Date.now() / 200) * 0.5 + 0.5;
      ctx.strokeStyle = `rgba(52, 152, 219, ${alpha})`;
      ctx.lineWidth = 3;
      drawRoundRect(ctx, cell.x, cell.y, this.gridSize, this.gridSize, 8);
      ctx.stroke();
    }
  }
  
  /**
   * 渲染提示格子
   */
  renderHintCell(ctx) {
    if (this.hintCell) {
      const cell = this.hintCell;
      
      // 绘制提示框（闪烁效果）
      const alpha = Math.sin(Date.now() / 200) * 0.5 + 0.5;
      ctx.strokeStyle = `rgba(52, 152, 219, ${alpha})`;
      ctx.lineWidth = 3;
      drawRoundRect(ctx, cell.x, cell.y, this.gridSize, this.gridSize, 8);
      ctx.stroke();
    }
  }
  
  /**
   * 渲染连接线
   */
  renderConnectionLine(ctx) {
    if (this.connectionPath && this.connectionPath.length > 1) {
      ctx.strokeStyle = '#F39C12';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      
      // 将网格坐标转换为屏幕坐标
      for (let i = 0; i < this.connectionPath.length; i++) {
        const point = this.connectionPath[i];
        const screenX = this.gridX + point.x * this.gridSize + this.gridSize / 2;
        const screenY = this.gridY + point.y * this.gridSize + this.gridSize / 2;
        
        if (i === 0) {
          ctx.moveTo(screenX, screenY);
        } else {
          ctx.lineTo(screenX, screenY);
        }
      }
      
      ctx.stroke();
    }
  }
  
  /**
   * 渲染开始界面
   */
  renderStartScreen(ctx) {
    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
    
    // 标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px PingFang SC';
    ctx.textAlign = 'center';
    ctx.fillText('连连看', this.screenWidth / 2, this.screenHeight / 2 - 80);
    
    // 游戏说明
    ctx.font = '18px PingFang SC';
    ctx.fillText('找到相同的图案并用不超过两个拐角的线连接', this.screenWidth / 2, this.screenHeight / 2 - 20);
    ctx.fillText('点击屏幕开始游戏', this.screenWidth / 2, this.screenHeight / 2 + 20);
    
    // 关卡预览
    this.renderLevelPreview(ctx);
  }
  
  /**
   * 渲染关卡预览
   */
  renderLevelPreview(ctx) {
    ctx.font = '16px PingFang SC';
    ctx.fillText(`总关卡数: ${this.totalLevels}`, this.screenWidth / 2, this.screenHeight / 2 + 80);
    
    // 绘制一些示例图案
    const previewPatterns = this.patterns.slice(0, 6);
    const startX = this.screenWidth / 2 - (previewPatterns.length * 40) / 2;
    
    previewPatterns.forEach((pattern, index) => {
      const x = startX + index * 40;
      const y = this.screenHeight / 2 + 120;
      
      ctx.fillStyle = pattern.color;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  /**
   * 渲染游戏结束界面
   */
  renderGameOver(ctx) {
    // 半透明遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
    
    // 游戏结束文字
    ctx.fillStyle = '#E74C3C';
    ctx.font = 'bold 36px PingFang SC';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', this.screenWidth / 2, this.screenHeight / 2 - 60);
    
    // 最终得分
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px PingFang SC';
    ctx.fillText(`最终得分: ${this.score}`, this.screenWidth / 2, this.screenHeight / 2);
    
    // 到达关卡
    ctx.fillText(`到达关卡: ${this.currentLevel}`, this.screenWidth / 2, this.screenHeight / 2 + 40);
    
    // 重新开始提示
    ctx.font = '18px PingFang SC';
    ctx.fillText('点击屏幕重新开始', this.screenWidth / 2, this.screenHeight / 2 + 100);
  }
  
  /**
   * 触摸开始事件
   */
  onTouchStart(touch) {
    // 检查是否点击了返回按钮
    if (super.onTouchStart(touch)) {
      return true;
    }
    
    // 检查是否点击了提示按钮
    if (this.hintButton && this.isPointInRect(touch.x, touch.y, this.hintButton)) {
      this.showHint();
      return true;
    }
    
    // 如果游戏未开始，点击屏幕开始游戏
    if (!this.gameStarted && !this.isGameOver) {
      this.gameStarted = true;
      this.lastUpdateTime = 0;
      console.log('▶️ 连连看游戏开始');
      return true;
    }
    
    // 如果游戏结束，点击屏幕重新开始
    if (this.isGameOver) {
      this.init();
      return true;
    }
    
    // 处理格子点击
    if (this.gameStarted && !this.isGameOver) {
      this.handleCellClick(touch.x, touch.y);
      return true;
    }
    
    return false;
  }
  
  /**
   * 处理格子点击
   */
  handleCellClick(x, y) {
    const cell = this.getCellAtPosition(x, y);
    
    if (!cell || !cell.visible || cell.matched) {
      return;
    }
    
    if (this.selectedCell === null) {
      // 第一次选择
      this.selectedCell = cell;
      this.hintCell = null;
    } else if (this.selectedCell === cell) {
      // 点击同一个格子，取消选择
      this.selectedCell = null;
    } else {
      // 第二次选择，尝试连接
      this.tryConnectCells(this.selectedCell, cell);
    }
  }
  
  /**
   * 尝试连接两个格子
   */
  tryConnectCells(cell1, cell2) {
    if (this.algorithm.canConnect(cell1, cell2)) {
      // 连接成功
      this.connectionPath = this.algorithm.getConnectionPath(cell1, cell2);
      
      // 标记格子为已匹配
      cell1.matched = true;
      cell2.matched = true;
      
      // 计算得分
      this.calculateScore(cell1, cell2);
      
      // 清除选择
      this.selectedCell = null;
      this.hintCell = null;
      
      console.log('✅ 连接成功！');
    } else {
      // 连接失败
      this.selectedCell = cell2;
      console.log('❌ 无法连接这两个格子');
    }
  }
  
  /**
   * 计算得分
   */
  calculateScore(cell1, cell2) {
    const path = this.connectionPath;
    let baseScore = 10;
    
    // 根据连接类型加分
    if (path.length === 2) {
      baseScore += 5; // 直线连接
    } else if (path.length === 3) {
      baseScore += 3; // 单拐角连接
    } else if (path.length === 4) {
      baseScore += 1; // 双拐角连接
    }
    
    // 根据关卡难度加分
    const levelConfig = this.levelConfigs[this.currentLevel];
    if (levelConfig.difficulty === 'medium') {
      baseScore += 2;
    } else if (levelConfig.difficulty === 'hard') {
      baseScore += 5;
    }
    
    // 时间奖励（剩余时间越多，奖励越多）
    const timeBonus = Math.floor(this.timeLeft / 10);
    baseScore += timeBonus;
    
    this.score += baseScore;
  }
  
  /**
   * 显示提示
   */
  showHint() {
    const hint = this.algorithm.findHint();
    if (hint) {
      this.hintCell = hint.cell1;
      
      // 3秒后自动清除提示
      setTimeout(() => {
        if (this.hintCell === hint.cell1) {
          this.hintCell = null;
        }
      }, 3000);
      
      console.log('💡 显示提示');
    } else {
      console.log('⚠️ 没有可用的提示');
    }
  }
  
  /**
   * 检查关卡是否完成
   */
  checkLevelComplete() {
    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        const cell = this.grid[row][col];
        if (cell.visible && !cell.matched) {
          return false;
        }
      }
    }
    return true;
  }
  
  /**
   * 完成当前关卡
   */
  completeLevel() {
    console.log(`🎉 完成关卡 ${this.currentLevel}`);
    
    // 关卡完成奖励
    this.score += this.currentLevel * 50;
    
    // 检查是否还有下一关
    if (this.currentLevel < this.totalLevels) {
      this.currentLevel++;
      this.timeLeft = 180; // 重置时间
      this.initializeGrid();
      this.algorithm = new LinkGameAlgorithm(this.grid);
      
      console.log(`🚀 进入关卡 ${this.currentLevel}`);
    } else {
      // 完成所有关卡
      this.gameOver();
    }
  }
  
  /**
   * 游戏结束
   */
  gameOver() {
    this.isGameOver = true;
    this.gameStarted = false;
    console.log('💀 游戏结束');
  }
  
  /**
   * 获取指定位置的格子
   */
  getCellAtPosition(x, y) {
    if (x < this.gridX || x > this.gridX + this.gridWidth ||
        y < this.gridY || y > this.gridY + this.gridHeight) {
      return null;
    }
    
    const col = Math.floor((x - this.gridX) / this.gridSize);
    const row = Math.floor((y - this.gridY) / this.gridSize);
    
    if (row >= 0 && row < this.gridRows && col >= 0 && col < this.gridCols) {
      return this.grid[row][col];
    }
    
    return null;
  }
  
  /**
   * 检查点是否在矩形内
   */
  isPointInRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.width &&
           y >= rect.y && y <= rect.y + rect.height;
  }
  
  /**
   * 销毁游戏
   */
  destroy() {
    super.destroy();
    this.gameStarted = false;
  }
}