/**
 * 连连看核心算法模块
 * 
 * 实现智能路径检测算法：
 * - 直线连接检测
 * - 单拐角连接检测  
 * - 双拐角连接检测
 * - 路径搜索优化
 */

import { randomInt } from '../../utils/utils.js';

export class LinkGameAlgorithm {
  constructor(grid) {
    this.grid = grid;
    this.gridRows = grid.length;
    this.gridCols = grid[0].length;
  }
  
  /**
   * 检查两个格子是否可以连接
   */
  canConnect(cell1, cell2) {
    // 基本检查
    if (!this.isValidCell(cell1) || !this.isValidCell(cell2)) {
      return false;
    }
    
    if (cell1 === cell2) {
      return false;
    }
    
    if (!cell1.pattern || !cell2.pattern) {
      return false;
    }
    
    if (cell1.pattern.id !== cell2.pattern.id) {
      return false;
    }
    
    // 检查连接路径
    return this.checkStraightLine(cell1, cell2) ||
           this.checkOneCorner(cell1, cell2) ||
           this.checkTwoCorners(cell1, cell2);
  }
  
  /**
   * 检查直线连接
   */
  checkStraightLine(cell1, cell2) {
    // 同一行
    if (cell1.row === cell2.row) {
      return this.checkHorizontalLine(cell1, cell2);
    }
    
    // 同一列
    if (cell1.col === cell2.col) {
      return this.checkVerticalLine(cell1, cell2);
    }
    
    return false;
  }
  
  /**
   * 检查水平直线连接
   */
  checkHorizontalLine(cell1, cell2) {
    const minCol = Math.min(cell1.col, cell2.col);
    const maxCol = Math.max(cell1.col, cell2.col);
    
    // 检查中间所有格子是否为空
    for (let col = minCol + 1; col < maxCol; col++) {
      if (!this.isCellEmpty(cell1.row, col)) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * 检查垂直直线连接
   */
  checkVerticalLine(cell1, cell2) {
    const minRow = Math.min(cell1.row, cell2.row);
    const maxRow = Math.max(cell1.row, cell2.row);
    
    // 检查中间所有格子是否为空
    for (let row = minRow + 1; row < maxRow; row++) {
      if (!this.isCellEmpty(row, cell1.col)) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * 检查单拐角连接
   */
  checkOneCorner(cell1, cell2) {
    // 尝试两个可能的拐角点
    const corner1 = { row: cell1.row, col: cell2.col };
    const corner2 = { row: cell2.row, col: cell1.col };
    
    // 检查拐角点1
    if (this.isValidCorner(corner1) && 
        this.checkStraightLine(cell1, corner1) && 
        this.checkStraightLine(corner1, cell2)) {
      return { type: 'one-corner', corners: [corner1] };
    }
    
    // 检查拐角点2
    if (this.isValidCorner(corner2) && 
        this.checkStraightLine(cell1, corner2) && 
        this.checkStraightLine(corner2, cell2)) {
      return { type: 'one-corner', corners: [corner2] };
    }
    
    return false;
  }
  
  /**
   * 检查双拐角连接
   */
  checkTwoCorners(cell1, cell2) {
    // 水平扫描寻找第一个拐角点
    for (let row = 0; row < this.gridRows; row++) {
      if (row === cell1.row || row === cell2.row) continue;
      
      const corner1 = { row: row, col: cell1.col };
      const corner2 = { row: row, col: cell2.col };
      
      if (this.isValidCorner(corner1) && this.isValidCorner(corner2)) {
        if (this.checkStraightLine(cell1, corner1) && 
            this.checkHorizontalLine(corner1, corner2) && 
            this.checkStraightLine(corner2, cell2)) {
          return { type: 'two-corners', corners: [corner1, corner2] };
        }
      }
    }
    
    // 垂直扫描寻找第一个拐角点
    for (let col = 0; col < this.gridCols; col++) {
      if (col === cell1.col || col === cell2.col) continue;
      
      const corner1 = { row: cell1.row, col: col };
      const corner2 = { row: cell2.row, col: col };
      
      if (this.isValidCorner(corner1) && this.isValidCorner(corner2)) {
        if (this.checkStraightLine(cell1, corner1) && 
            this.checkVerticalLine(corner1, corner2) && 
            this.checkStraightLine(corner2, cell2)) {
          return { type: 'two-corners', corners: [corner1, corner2] };
        }
      }
    }
    
    return false;
  }
  
  /**
   * 检查拐角点是否有效
   */
  isValidCorner(corner) {
    return this.isCellEmpty(corner.row, corner.col);
  }
  
  /**
   * 检查格子是否为空（不可见或已匹配）
   */
  isCellEmpty(row, col) {
    if (row < 0 || row >= this.gridRows || col < 0 || col >= this.gridCols) {
      return false;
    }
    
    const cell = this.grid[row][col];
    return !cell.visible || cell.matched;
  }
  
  /**
   * 检查格子是否有效
   */
  isValidCell(cell) {
    if (!cell) return false;
    if (cell.row < 0 || cell.row >= this.gridRows) return false;
    if (cell.col < 0 || cell.col >= this.gridCols) return false;
    return true;
  }
  
  /**
   * 查找所有可连接的格子对
   */
  findAllConnectablePairs() {
    const pairs = [];
    const visibleCells = this.getVisibleCells();
    
    // 按图案类型分组
    const patternGroups = {};
    for (const cell of visibleCells) {
      if (!cell.pattern) continue;
      
      const patternId = cell.pattern.id;
      if (!patternGroups[patternId]) {
        patternGroups[patternId] = [];
      }
      patternGroups[patternId].push(cell);
    }
    
    // 检查每组内的所有配对
    for (const patternId in patternGroups) {
      const cells = patternGroups[patternId];
      
      for (let i = 0; i < cells.length; i++) {
        for (let j = i + 1; j < cells.length; j++) {
          const cell1 = cells[i];
          const cell2 = cells[j];
          
          if (this.canConnect(cell1, cell2)) {
            pairs.push({ cell1, cell2 });
          }
        }
      }
    }
    
    return pairs;
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
   * 查找一个可连接的提示（用于提示功能）
   */
  findHint() {
    const pairs = this.findAllConnectablePairs();
    if (pairs.length > 0) {
      // 随机选择一个提示
      const randomIndex = randomInt(0, pairs.length - 1);
      return pairs[randomIndex];
    }
    return null;
  }
  
  /**
   * 检查游戏是否可继续（是否还有可连接的格子对）
   */
  isGameContinue() {
    return this.findAllConnectablePairs().length > 0;
  }
  
  /**
   * 获取连接路径（用于绘制连接线）
   */
  getConnectionPath(cell1, cell2) {
    // 直线连接
    if (this.checkStraightLine(cell1, cell2)) {
      return [
        { x: cell1.col, y: cell1.row },
        { x: cell2.col, y: cell2.row }
      ];
    }
    
    // 单拐角连接
    const oneCornerResult = this.checkOneCorner(cell1, cell2);
    if (oneCornerResult) {
      const corner = oneCornerResult.corners[0];
      return [
        { x: cell1.col, y: cell1.row },
        { x: corner.col, y: corner.row },
        { x: cell2.col, y: cell2.row }
      ];
    }
    
    // 双拐角连接
    const twoCornersResult = this.checkTwoCorners(cell1, cell2);
    if (twoCornersResult) {
      const corner1 = twoCornersResult.corners[0];
      const corner2 = twoCornersResult.corners[1];
      return [
        { x: cell1.col, y: cell1.row },
        { x: corner1.col, y: corner1.row },
        { x: corner2.col, y: corner2.row },
        { x: cell2.col, y: cell2.row }
      ];
    }
    
    return null;
  }
  
  /**
   * 洗牌算法 - 重新排列格子（当没有可连接的格子对时）
   */
  reshuffleGrid() {
    const visibleCells = this.getVisibleCells();
    const patterns = [];
    
    // 收集所有图案
    for (const cell of visibleCells) {
      if (cell.pattern) {
        patterns.push(cell.pattern);
      }
    }
    
    // 打乱图案顺序
    this.shuffleArray(patterns);
    
    // 重新分配图案
    let patternIndex = 0;
    for (const cell of visibleCells) {
      if (patternIndex < patterns.length) {
        cell.pattern = patterns[patternIndex];
        patternIndex++;
      }
    }
    
    return patterns.length > 0;
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
   * 验证游戏状态
   */
  validateGameState() {
    const visibleCells = this.getVisibleCells();
    
    // 检查图案数量是否成对
    const patternCounts = {};
    for (const cell of visibleCells) {
      if (cell.pattern) {
        const patternId = cell.pattern.id;
        patternCounts[patternId] = (patternCounts[patternId] || 0) + 1;
      }
    }
    
    // 所有图案数量都应该是偶数
    for (const patternId in patternCounts) {
      if (patternCounts[patternId] % 2 !== 0) {
        console.warn(`图案 ${patternId} 数量为奇数: ${patternCounts[patternId]}`);
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * 检查棋盘是否可完全消除（深度验证算法）
   */
  isBoardSolvable() {
    // 首先验证基本游戏状态
    if (!this.validateGameState()) {
      return false;
    }
    
    // 创建网格的深拷贝用于模拟消除
    const simulatedGrid = this.createGridCopy();
    
    // 模拟消除过程
    return this.simulateElimination(simulatedGrid);
  }
  
  /**
   * 创建网格的深拷贝
   */
  createGridCopy() {
    const gridCopy = [];
    
    for (let row = 0; row < this.gridRows; row++) {
      gridCopy[row] = [];
      for (let col = 0; col < this.gridCols; col++) {
        const originalCell = this.grid[row][col];
        gridCopy[row][col] = {
          row: row,
          col: col,
          pattern: originalCell.pattern ? { ...originalCell.pattern } : null,
          visible: originalCell.visible,
          matched: originalCell.matched,
          x: originalCell.x,
          y: originalCell.y
        };
      }
    }
    
    return gridCopy;
  }
  
  /**
   * 模拟消除过程
   */
  simulateElimination(grid) {
    let eliminatedCount = 0;
    const totalCells = this.gridRows * this.gridCols;
    const maxIterations = totalCells * 2; // 防止无限循环
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // 查找所有可连接的格子对
      const connectablePairs = this.findAllConnectablePairsInGrid(grid);
      
      if (connectablePairs.length === 0) {
        // 没有可连接的格子对，检查是否已完全消除
        const remainingCells = this.getVisibleCellsFromGrid(grid);
        return remainingCells.length === 0;
      }
      
      // 选择一个可连接的格子对进行消除
      const pair = connectablePairs[0]; // 选择第一个可连接的对
      
      // 消除这对格子
      pair.cell1.matched = true;
      pair.cell2.matched = true;
      eliminatedCount += 2;
      
      // 如果所有格子都已消除，返回成功
      if (eliminatedCount >= totalCells) {
        return true;
      }
    }
    
    // 达到最大迭代次数仍未完全消除
    console.warn('棋盘验证：达到最大迭代次数，棋盘可能不可完全消除');
    return false;
  }
  
  /**
   * 在指定网格中查找所有可连接的格子对
   */
  findAllConnectablePairsInGrid(grid) {
    const pairs = [];
    const visibleCells = this.getVisibleCellsFromGrid(grid);
    
    // 按图案类型分组
    const patternGroups = {};
    for (const cell of visibleCells) {
      if (!cell.pattern) continue;
      
      const patternId = cell.pattern.id;
      if (!patternGroups[patternId]) {
        patternGroups[patternId] = [];
      }
      patternGroups[patternId].push(cell);
    }
    
    // 检查每组内的所有配对
    for (const patternId in patternGroups) {
      const cells = patternGroups[patternId];
      
      for (let i = 0; i < cells.length; i++) {
        for (let j = i + 1; j < cells.length; j++) {
          const cell1 = cells[i];
          const cell2 = cells[j];
          
          if (this.canConnectInGrid(cell1, cell2, grid)) {
            pairs.push({ cell1, cell2 });
          }
        }
      }
    }
    
    return pairs;
  }
  
  /**
   * 在指定网格中检查两个格子是否可以连接
   */
  canConnectInGrid(cell1, cell2, grid) {
    // 基本检查
    if (!this.isValidCellInGrid(cell1, grid) || !this.isValidCellInGrid(cell2, grid)) {
      return false;
    }
    
    if (cell1 === cell2) {
      return false;
    }
    
    if (!cell1.pattern || !cell2.pattern) {
      return false;
    }
    
    if (cell1.pattern.id !== cell2.pattern.id) {
      return false;
    }
    
    if (cell1.matched || cell2.matched) {
      return false;
    }
    
    // 检查连接路径
    return this.checkStraightLineInGrid(cell1, cell2, grid) ||
           this.checkOneCornerInGrid(cell1, cell2, grid) ||
           this.checkTwoCornersInGrid(cell1, cell2, grid);
  }
  
  /**
   * 在指定网格中检查直线连接
   */
  checkStraightLineInGrid(cell1, cell2, grid) {
    // 同一行
    if (cell1.row === cell2.row) {
      return this.checkHorizontalLineInGrid(cell1, cell2, grid);
    }
    
    // 同一列
    if (cell1.col === cell2.col) {
      return this.checkVerticalLineInGrid(cell1, cell2, grid);
    }
    
    return false;
  }
  
  /**
   * 在指定网格中检查水平直线连接
   */
  checkHorizontalLineInGrid(cell1, cell2, grid) {
    const minCol = Math.min(cell1.col, cell2.col);
    const maxCol = Math.max(cell1.col, cell2.col);
    
    // 检查中间所有格子是否为空
    for (let col = minCol + 1; col < maxCol; col++) {
      if (!this.isCellEmptyInGrid(cell1.row, col, grid)) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * 在指定网格中检查垂直直线连接
   */
  checkVerticalLineInGrid(cell1, cell2, grid) {
    const minRow = Math.min(cell1.row, cell2.row);
    const maxRow = Math.max(cell1.row, cell2.row);
    
    // 检查中间所有格子是否为空
    for (let row = minRow + 1; row < maxRow; row++) {
      if (!this.isCellEmptyInGrid(row, cell1.col, grid)) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * 在指定网格中检查单拐角连接
   */
  checkOneCornerInGrid(cell1, cell2, grid) {
    // 尝试两个可能的拐角点
    const corner1 = { row: cell1.row, col: cell2.col };
    const corner2 = { row: cell2.row, col: cell1.col };
    
    // 检查拐角点1
    if (this.isValidCornerInGrid(corner1, grid) && 
        this.checkStraightLineInGrid(cell1, corner1, grid) && 
        this.checkStraightLineInGrid(corner1, cell2, grid)) {
      return true;
    }
    
    // 检查拐角点2
    if (this.isValidCornerInGrid(corner2, grid) && 
        this.checkStraightLineInGrid(cell1, corner2, grid) && 
        this.checkStraightLineInGrid(corner2, cell2, grid)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * 在指定网格中检查双拐角连接
   */
  checkTwoCornersInGrid(cell1, cell2, grid) {
    // 水平扫描寻找第一个拐角点
    for (let row = 0; row < this.gridRows; row++) {
      if (row === cell1.row || row === cell2.row) continue;
      
      const corner1 = { row: row, col: cell1.col };
      const corner2 = { row: row, col: cell2.col };
      
      if (this.isValidCornerInGrid(corner1, grid) && this.isValidCornerInGrid(corner2, grid)) {
        if (this.checkStraightLineInGrid(cell1, corner1, grid) && 
            this.checkHorizontalLineInGrid(corner1, corner2, grid) && 
            this.checkStraightLineInGrid(corner2, cell2, grid)) {
          return true;
        }
      }
    }
    
    // 垂直扫描寻找第一个拐角点
    for (let col = 0; col < this.gridCols; col++) {
      if (col === cell1.col || col === cell2.col) continue;
      
      const corner1 = { row: cell1.row, col: col };
      const corner2 = { row: cell2.row, col: col };
      
      if (this.isValidCornerInGrid(corner1, grid) && this.isValidCornerInGrid(corner2, grid)) {
        if (this.checkStraightLineInGrid(cell1, corner1, grid) && 
            this.checkVerticalLineInGrid(corner1, corner2, grid) && 
            this.checkStraightLineInGrid(corner2, cell2, grid)) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * 在指定网格中检查拐角点是否有效
   */
  isValidCornerInGrid(corner, grid) {
    return this.isCellEmptyInGrid(corner.row, corner.col, grid);
  }
  
  /**
   * 在指定网格中检查格子是否为空
   */
  isCellEmptyInGrid(row, col, grid) {
    if (row < 0 || row >= this.gridRows || col < 0 || col >= this.gridCols) {
      return false;
    }
    
    const cell = grid[row][col];
    return !cell.visible || cell.matched;
  }
  
  /**
   * 在指定网格中检查格子是否有效
   */
  isValidCellInGrid(cell, grid) {
    if (!cell) return false;
    if (cell.row < 0 || cell.row >= this.gridRows) return false;
    if (cell.col < 0 || cell.col >= this.gridCols) return false;
    return true;
  }
  
  /**
   * 从指定网格中获取所有可见且未匹配的格子
   */
  getVisibleCellsFromGrid(grid) {
    const visibleCells = [];
    
    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        const cell = grid[row][col];
        if (cell.visible && !cell.matched) {
          visibleCells.push(cell);
        }
      }
    }
    
    return visibleCells;
  }
}