/**
 * 版本配置文件
 * 统一管理小游戏平台的版本信息
 */

export default {
  // 主版本号 - 重大功能更新
  major: 1,
  
  // 次版本号 - 新功能添加
  minor: 2,
  
  // 修订版本号 - bug修复
  patch: 0,
  
  /**
   * 获取完整版本号字符串
   * @returns {string} 格式: "1.2.0"
   */
  getVersionString() {
    return `${this.major}.${this.minor}.${this.patch}`;
  },
  
  /**
   * 获取带前缀的版本号字符串
   * @returns {string} 格式: "v1.2.0"
   */
  getVersionWithPrefix() {
    return `v${this.getVersionString()}`;
  },
  
  /**
   * 获取版本描述信息
   * @returns {string} 版本描述
   */
  getDescription() {
    return '小游戏集合平台 - 新增贪吃蛇游戏';
  }
};