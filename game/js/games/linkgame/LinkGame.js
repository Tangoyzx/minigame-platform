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
    this.gridRows = 8;   // 网格行数
    this.gridCols = 10;  // 网格列数
    
    // 动态计算格子大小和边距以适应不同屏幕
    this.calculateGridDimensions();
    
    // 游戏状态
    this.currentLevel = 1;
    this.totalLevels = 5;
    this.score = 0;
    this.timeLeft = 180; // 3分钟
    this.gameStarted = false;
    this.isGameOver = false;
    
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
   * 动态计算网格尺寸以适应不同屏幕
   */
  calculateGridDimensions() {
    // 根据屏幕尺寸计算合适的格子大小
    const minScreenDimension = Math.min(this.screenWidth, this.screenHeight);
    
    // 基础格子大小，根据屏幕尺寸动态调整
    const baseGridSize = Math.floor(minScreenDimension * 0.06); // 屏幕最小尺寸的6%
    
    // 限制格子大小在合理范围内
    this.gridSize = Math.max(40, Math.min(80, baseGridSize));
    
    // 计算边距，确保棋盘在屏幕内完全显示
    const maxGridWidth = this.screenWidth * 0.9; // 最大占用屏幕宽度的90%
    const maxGridHeight = this.screenHeight * 0.8; // 最大占用屏幕高度的80%
    
    // 如果当前配置超出最大限制，调整格子大小
    const requiredWidth = this.gridCols * this.gridSize;
    const requiredHeight = this.gridRows * this.gridSize;
    
    if (requiredWidth > maxGridWidth) {
      this.gridSize = Math.floor(maxGridWidth / this.gridCols);
    }
    
    if (requiredHeight > maxGridHeight) {
      this.gridSize = Math.min(this.gridSize, Math.floor(maxGridHeight / this.gridRows));
    }
    
    // 计算网格边距，确保居中显示
    this.gridWidth = this.gridCols * this.gridSize;
    this.gridHeight = this.gridRows * this.gridSize;
    this.gridMargin = Math.max(10, Math.floor(this.gridSize * 0.3)); // 边距为格子大小的30%，最小10px
    
    // 计算网格位置（居中）
    this.gridX = (this.screenWidth - this.gridWidth) / 2;
    this.gridY = (this.screenHeight - this.gridHeight) / 2 + 30;
    
    console.log(`📏 网格配置: 格子大小=${this.gridSize}px, 边距=${this.gridMargin}px, 位置=(${this.gridX}, ${this.gridY})`);
    console.log(`📊 棋盘占比: ${(this.gridWidth / this.screenWidth * 100).toFixed(1)}% 宽度, ${(this.gridHeight / this.screenHeight * 100).toFixed(1)}% 高度`);
  }
  
  /**
   * 初始化游戏
   */
  init() {
    super.init();
    
    // 重新计算网格尺寸（确保使用最新的屏幕尺寸）
    this.calculateGridDimensions();
    
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
    
    const maxRetries = 100; // 增加最大重试次数
    let retryCount = 0;
    let isSolvable = false;
    
    while (!isSolvable && retryCount < maxRetries) {
      // 严格创建图案对（确保每个图案严格成对）
      const patternPairs = [];
      for (const pattern of availablePatterns) {
        patternPairs.push(pattern, pattern);
      }
      
      // 验证图案对数量是否为偶数
      if (patternPairs.length % 2 !== 0) {
        console.error('❌ 图案对数量不是偶数，重新生成');
        retryCount++;
        continue;
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
      
      // 创建算法实例进行验证
      this.algorithm = new LinkGameAlgorithm(this.grid);
      
      // 首先验证图案数量是否严格成对
      const patternValidation = this.algorithm.validateGameState();
      if (!patternValidation) {
        console.warn(`🔄 图案数量验证失败，重新生成 (${retryCount}/${maxRetries})`);
        retryCount++;
        continue;
      }
      
      // 然后验证棋盘是否可解
      isSolvable = this.algorithm.strictBoardValidation();
      
      if (!isSolvable) {
        retryCount++;
        console.log(`🔄 棋盘不可解，重新生成 (${retryCount}/${maxRetries})`);
        
        // 如果达到最大重试次数，尝试深度洗牌
        if (retryCount >= maxRetries) {
          console.log('⚠️ 达到最大重试次数，尝试深度洗牌棋盘');
          this.deepReshuffleGrid();
          isSolvable = this.algorithm.strictBoardValidation();
        }
      }
    }
    
    if (isSolvable) {
      console.log(`✅ 生成可完全消除的棋盘 (重试次数: ${retryCount})`);
      
      // 最终验证
      const finalValidation = this.algorithm.strictBoardValidation();
      if (!finalValidation) {
        console.error('❌ 最终验证失败，但继续游戏');
      }
    } else {
      console.warn('❌ 无法生成可完全消除的棋盘，使用当前棋盘继续游戏');
    }
  }
  
  /**
   * 深度洗牌棋盘 - 更彻底的洗牌算法
   */
  deepReshuffleGrid() {
    console.log('🔄 执行深度洗牌...');
    
    const visibleCells = this.getVisibleCells();
    const patterns = [];
    
    // 收集所有图案
    for (const cell of visibleCells) {
      if (cell.pattern) {
        patterns.push(cell.pattern);
      }
    }
    
    // 多次打乱图案顺序
    for (let i = 0; i < 5; i++) {
      this.shuffleArray(patterns);
    }
    
    // 重新分配图案
    let patternIndex = 0;
    for (const cell of visibleCells) {
      if (patternIndex < patterns.length) {
        cell.pattern = patterns[patternIndex];
        patternIndex++;
      }
    }
    
    // 重新创建算法实例
    this.algorithm = new LinkGameAlgorithm(this.grid);
  }
  
  /**
   * 获取所有可见且未匹配的格子
   */
  getVisibleCells() {
    const visibleCells = [];
    
    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        const cell = this.grid[row][col];
        if (cell.visible && !cell.matched) {
          visibleCells.push(cell);
        }
      }
    }
    
    return visibleCells;
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
    // 顶部信息栏高度根据屏幕尺寸调整
    const headerHeight = Math.max(50, this.screenHeight * 0.08);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.screenWidth, headerHeight);
    
    // 动态计算字体大小
    const fontSize = Math.max(14, this.screenHeight * 0.025);
    const textY = headerHeight / 2;
    
    // 关卡信息
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${fontSize}px PingFang SC`;
    ctx.textAlign = 'left';
    ctx.fillText(`关卡: ${this.currentLevel}/${this.totalLevels}`, 20, textY);
    
    // 分数
    ctx.textAlign = 'center';
    ctx.fillText(`分数: ${this.score}`, this.screenWidth / 2, textY);
    
    // 时间
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    ctx.textAlign = 'right';
    ctx.fillText(`时间: ${minutes}:${seconds.toString().padStart(2, '0')}`, this.screenWidth - 20, textY);
    
    // 提示按钮
    this.renderHintButton(ctx);
  }
  
  /**
   * 渲染提示按钮
   */
  renderHintButton(ctx) {
    // 动态计算按钮大小和位置
    const buttonWidth = Math.max(80, this.screenWidth * 0.15);
    const buttonHeight = Math.max(35, this.screenHeight * 0.05);
    const buttonX = this.screenWidth - buttonWidth - 20;
    const buttonY = 70;
    
    const hintButton = {
      x: buttonX,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight
    };
    
    // 绘制按钮背景
    ctx.fillStyle = '#3498DB';
    drawRoundRect(ctx, hintButton.x, hintButton.y, hintButton.width, hintButton.height, 8);
    ctx.fill();
    
    // 绘制按钮文字（字体大小随屏幕尺寸调整）
    const fontSize = Math.max(14, this.screenHeight * 0.02);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${fontSize}px PingFang SC`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('提示', hintButton.x + hintButton.width / 2, hintButton.y + hintButton.height / 2);
    
    this.hintButton = hintButton;
  }
  
  /**
   * 渲染网格
   */
  renderGrid(ctx) {
    // 绘制网格背景（使用动态计算的边距）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    drawRoundRect(ctx, 
      this.gridX - this.gridMargin / 2, 
      this.gridY - this.gridMargin / 2, 
      this.gridWidth + this.gridMargin, 
      this.gridHeight + this.gridMargin, 
      Math.min(15, this.gridSize / 4)
    );
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
    const radius = this.gridSize / 2 - Math.max(3, this.gridSize * 0.08); // 根据格子大小调整边距
    const cornerRadius = Math.max(4, this.gridSize * 0.1); // 圆角半径随格子大小调整
    
    // 绘制格子背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    drawRoundRect(ctx, cell.x, cell.y, this.gridSize, this.gridSize, cornerRadius);
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
      
      // 绘制边框（线宽随格子大小调整）
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = Math.max(1, this.gridSize * 0.03);
      drawRoundRect(ctx, cell.x, cell.y, this.gridSize, this.gridSize, cornerRadius);
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
      const cornerRadius = Math.max(4, this.gridSize * 0.1);
      
      // 绘制选中框（线宽随格子大小调整）
      ctx.strokeStyle = '#F39C12';
      ctx.lineWidth = Math.max(2, this.gridSize * 0.05);
      drawRoundRect(ctx, cell.x, cell.y, this.gridSize, this.gridSize, cornerRadius);
      ctx.stroke();
    }
  }
  
  /**
   * 渲染提示格子
   */
  renderHintCell(ctx) {
    if (this.hintCell) {
      const cell = this.hintCell;
      const cornerRadius = Math.max(4, this.gridSize * 0.1);
      
      // 绘制提示框（闪烁效果，线宽随格子大小调整）
      const alpha = Math.sin(Date.now() / 200) * 0.5 + 0.5;
      ctx.strokeStyle = `rgba(52, 152, 219, ${alpha})`;
      ctx.lineWidth = Math.max(2, this.gridSize * 0.05);
      drawRoundRect(ctx, cell.x, cell.y, this.gridSize, this.gridSize, cornerRadius);
      ctx.stroke();
    }
  }
  
  /**
   * 渲染连接线
   */
  renderConnectionLine(ctx) {
    if (this.connectionPath && this.connectionPath.length > 1) {
      ctx.strokeStyle = '#F39C12';
      ctx.lineWidth = Math.max(3, this.gridSize * 0.06); // 线宽随格子大小调整
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
    
    // 动态计算字体大小和布局
    const titleFontSize = Math.max(36, this.screenHeight * 0.07);
    const textFontSize = Math.max(14, this.screenHeight * 0.025);
    const titleY = this.screenHeight / 2 - this.screenHeight * 0.12;
    const textY1 = this.screenHeight / 2 - this.screenHeight * 0.03;
    const textY2 = this.screenHeight / 2 + this.screenHeight * 0.03;
    
    // 标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${titleFontSize}px PingFang SC`;
    ctx.textAlign = 'center';
    ctx.fillText('连连看', this.screenWidth / 2, titleY);
    
    // 游戏说明
    ctx.font = `${textFontSize}px PingFang SC`;
    ctx.fillText('找到相同的图案并用不超过两个拐角的线连接', this.screenWidth / 2, textY1);
    ctx.fillText('点击屏幕开始游戏', this.screenWidth / 2, textY2);
    
    // 关卡预览
    this.renderLevelPreview(ctx);
  }
  
  /**
   * 渲染关卡预览
   */
  renderLevelPreview(ctx) {
    // 动态计算字体大小和布局
    const textFontSize = Math.max(14, this.screenHeight * 0.025);
    const previewY = this.screenHeight / 2 + this.screenHeight * 0.12;
    
    ctx.font = `${textFontSize}px PingFang SC`;
    ctx.fillText(`总关卡数: ${this.totalLevels}`, this.screenWidth / 2, previewY);
    
    // 绘制一些示例图案
    const previewPatterns = this.patterns.slice(0, 6);
    const patternSize = Math.max(25, this.screenHeight * 0.04); // 图案大小随屏幕调整
    const patternSpacing = patternSize * 1.5;
    const startX = this.screenWidth / 2 - (previewPatterns.length * patternSpacing) / 2;
    const patternY = previewY + this.screenHeight * 0.06;
    
    previewPatterns.forEach((pattern, index) => {
      const x = startX + index * patternSpacing;
      
      ctx.fillStyle = pattern.color;
      ctx.beginPath();
      ctx.arc(x, patternY, patternSize / 2, 0, Math.PI * 2);
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
    
    // 动态计算字体大小和布局
    const titleFontSize = Math.max(28, this.screenHeight * 0.05);
    const textFontSize = Math.max(18, this.screenHeight * 0.03);
    const smallFontSize = Math.max(14, this.screenHeight * 0.025);
    const titleY = this.screenHeight / 2 - this.screenHeight * 0.1;
    const scoreY = this.screenHeight / 2;
    const levelY = this.screenHeight / 2 + this.screenHeight * 0.06;
    const restartY = this.screenHeight / 2 + this.screenHeight * 0.15;
    
    // 游戏结束文字
    ctx.fillStyle = '#E74C3C';
    ctx.font = `bold ${titleFontSize}px PingFang SC`;
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', this.screenWidth / 2, titleY);
    
    // 最终得分
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${textFontSize}px PingFang SC`;
    ctx.fillText(`最终得分: ${this.score}`, this.screenWidth / 2, scoreY);
    
    // 到达关卡
    ctx.fillText(`到达关卡: ${this.currentLevel}`, this.screenWidth / 2, levelY);
    
    // 重新开始提示
    ctx.font = `${smallFontSize}px PingFang SC`;
    ctx.fillText('点击屏幕重新开始', this.screenWidth / 2, restartY);
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