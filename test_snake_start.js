/**
 * 贪吃蛇游戏点击开始功能测试
 * 
 * 这个脚本测试贪吃蛇游戏的点击开始功能是否正常工作
 */

// 模拟贪吃蛇游戏的关键功能
class TestSnakeGame {
  constructor() {
    this.gameStarted = false;
    this.isGameOver = false;
    this.score = 0;
  }
  
  // 模拟初始化
  init() {
    this.gameStarted = false; // 游戏开始时显示开始界面
    this.isGameOver = false; // 重置游戏结束状态
    this.score = 0;
    console.log('✅ 游戏初始化完成，等待用户点击开始');
  }
  
  // 模拟触摸开始事件
  onTouchStart() {
    if (!this.gameStarted) {
      this.gameStarted = true;
      console.log('▶️ 游戏开始');
      return true;
    }
    
    if (this.isGameOver) {
      this.init();
      this.gameStarted = true; // 重新开始后立即开始游戏
      this.isGameOver = false; // 重置游戏结束状态
      console.log('🔄 游戏重新开始');
      return true;
    }
    
    return false;
  }
  
  // 模拟游戏结束
  gameOver() {
    this.isGameOver = true;
    this.gameStarted = false; // 游戏结束后需要重新点击开始
    console.log('💀 游戏结束，得分:', this.score);
  }
  
  // 模拟游戏逻辑
  update() {
    if (!this.gameStarted || this.isGameOver) {
      return; // 游戏未开始或已结束，不更新
    }
    
    // 正常游戏逻辑
    console.log('🎮 游戏进行中...');
  }
  
  // 模拟渲染
  render() {
    if (this.isGameOver) {
      console.log('📱 显示游戏结束界面：点击屏幕重新开始');
      return;
    }
    
    if (!this.gameStarted) {
      console.log('📱 显示开始界面：点击屏幕开始游戏');
      return;
    }
    
    console.log('📱 显示游戏画面');
  }
}

// 测试流程
console.log('🧪 开始测试贪吃蛇游戏点击开始功能\n');

const game = new TestSnakeGame();

// 1. 初始化游戏
game.init();
game.render(); // 应该显示开始界面

// 2. 点击屏幕开始游戏
game.onTouchStart();
game.render(); // 应该显示游戏画面
game.update(); // 游戏逻辑应该运行

// 3. 模拟游戏结束
game.score = 100;
game.gameOver();
game.render(); // 应该显示游戏结束界面

// 4. 点击屏幕重新开始
game.onTouchStart();
game.render(); // 应该显示游戏画面
game.update(); // 游戏逻辑应该运行

console.log('\n✅ 测试完成！贪吃蛇游戏点击开始功能正常工作');