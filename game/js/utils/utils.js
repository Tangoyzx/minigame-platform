/**
 * 工具函数集合
 * 
 * 这里放一些各个游戏都可能用到的通用函数
 * 就像一个"工具箱"，需要什么工具就拿什么
 */

/**
 * 生成指定范围内的随机整数
 * 
 * @param {number} min - 最小值（包含）
 * @param {number} max - 最大值（包含）
 * @returns {number} 随机整数
 * 
 * 例如: randomInt(1, 6) 可能返回 1, 2, 3, 4, 5, 或 6
 * 就像掷骰子一样！
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成指定范围内的随机小数
 * 
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 随机小数
 */
export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * 限制数值在指定范围内
 * 
 * @param {number} value - 要限制的值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 限制后的值
 * 
 * 例如: clamp(15, 0, 10) 返回 10
 *       clamp(-5, 0, 10) 返回 0
 *       clamp(5, 0, 10) 返回 5
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * 计算两点之间的距离
 * 
 * @param {number} x1 - 第一个点的 X 坐标
 * @param {number} y1 - 第一个点的 Y 坐标
 * @param {number} x2 - 第二个点的 X 坐标
 * @param {number} y2 - 第二个点的 Y 坐标
 * @returns {number} 两点之间的距离
 * 
 * 使用勾股定理（还记得数学课吗？a² + b² = c²）
 */
export function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 角度转弧度
 * 
 * @param {number} degrees - 角度值
 * @returns {number} 弧度值
 * 
 * 电脑里的三角函数（sin, cos）使用弧度，不是角度
 * 180° = π 弧度
 */
export function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * 弧度转角度
 * 
 * @param {number} radians - 弧度值
 * @returns {number} 角度值
 */
export function radToDeg(radians) {
  return radians * (180 / Math.PI);
}

/**
 * 线性插值
 * 
 * @param {number} a - 起始值
 * @param {number} b - 结束值
 * @param {number} t - 插值比例 (0-1)
 * @returns {number} 插值结果
 * 
 * 用于平滑过渡，比如让物体从 A 点平滑移动到 B 点
 * t=0 时返回 a，t=1 时返回 b，t=0.5 时返回 (a+b)/2
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * 检查点是否在矩形内
 * 
 * @param {number} px - 点的 X 坐标
 * @param {number} py - 点的 Y 坐标
 * @param {number} rx - 矩形左上角 X 坐标
 * @param {number} ry - 矩形左上角 Y 坐标
 * @param {number} rw - 矩形宽度
 * @param {number} rh - 矩形高度
 * @returns {boolean} 点是否在矩形内
 */
export function pointInRect(px, py, rx, ry, rw, rh) {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

/**
 * 简单的对象池
 * 
 * 为什么需要对象池？
 * 在游戏中，我们经常需要创建和销毁大量对象（比如管道、子弹）
 * 频繁创建/销毁会让游戏变卡。对象池就是"回收利用"这些对象！
 * 
 * 就像图书馆：书看完了不是扔掉，而是放回架子，下次继续借出去
 */
export class ObjectPool {
  /**
   * 创建对象池
   * 
   * @param {Function} createFn - 创建新对象的函数
   * @param {Function} resetFn - 重置对象的函数
   * @param {number} initialSize - 初始池大小
   */
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    
    // 预先创建一些对象
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }
  
  /**
   * 从池中获取一个对象
   * 如果池空了，就创建新的
   */
  get() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.createFn();
  }
  
  /**
   * 将对象放回池中
   * 
   * @param {Object} obj - 要回收的对象
   */
  release(obj) {
    this.resetFn(obj);
    this.pool.push(obj);
  }
  
  /**
   * 获取当前池中的对象数量
   */
  get size() {
    return this.pool.length;
  }
}

/**
 * 格式化分数显示
 * 
 * @param {number} score - 分数
 * @returns {string} 格式化后的分数字符串
 * 
 * 例如: formatScore(1234567) 返回 "1,234,567"
 */
export function formatScore(score) {
  return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 简单的缓动函数集合
 * 让动画更加平滑自然
 */
export const Easing = {
  // 线性（匀速）
  linear: (t) => t,
  
  // 缓入（慢 -> 快）
  easeInQuad: (t) => t * t,
  
  // 缓出（快 -> 慢）
  easeOutQuad: (t) => t * (2 - t),
  
  // 缓入缓出（慢 -> 快 -> 慢）
  easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  
  // 弹性效果
  easeOutElastic: (t) => {
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
  },
  
  // 弹跳效果
  easeOutBounce: (t) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  }
};

/**
 * 绘制圆角矩形（兼容微信小游戏）
 * 
 * 微信小游戏可能不支持 ctx.roundRect()，所以我们手动绘制圆角矩形。
 * 就像用画笔一笔一笔画出来：
 * 1. 从左上角开始，画一个圆角
 * 2. 画上边
 * 3. 画右上角圆角
 * 4. 画右边
 * ... 依此类推
 * 
 * @param {CanvasRenderingContext2D} ctx - 画布上下文
 * @param {number} x - 矩形左上角 X 坐标
 * @param {number} y - 矩形左上角 Y 坐标
 * @param {number} width - 矩形宽度
 * @param {number} height - 矩形高度
 * @param {number} radius - 圆角半径
 */
export function drawRoundRect(ctx, x, y, width, height, radius) {
  // 确保圆角半径不会超过矩形的一半
  radius = Math.min(radius, width / 2, height / 2);
  
  ctx.beginPath();
  
  // 从左上角的圆角开始（顺时针方向）
  ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5);  // 左上角
  ctx.lineTo(x + width - radius, y);  // 上边
  ctx.arc(x + width - radius, y + radius, radius, Math.PI * 1.5, Math.PI * 2);  // 右上角
  ctx.lineTo(x + width, y + height - radius);  // 右边
  ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI * 0.5);  // 右下角
  ctx.lineTo(x + radius, y + height);  // 下边
  ctx.arc(x + radius, y + height - radius, radius, Math.PI * 0.5, Math.PI);  // 左下角
  ctx.closePath();  // 回到起点
}
