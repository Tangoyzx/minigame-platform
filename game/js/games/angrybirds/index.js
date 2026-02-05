/**
 * 愤怒的小鸟游戏入口文件
 * 
 * 这个文件负责将愤怒的小鸟游戏注册到游戏平台中
 * 它导出了游戏信息和游戏类，供 GameManager 使用
 */

import AngryBirds from './AngryBirds.js';

// 游戏信息配置
export const gameInfo = {
  id: 'angrybirds',
  name: '愤怒的小鸟',
  description: '经典物理弹射游戏，消灭所有绿猪！',
  icon: '🐦',
  GameClass: AngryBirds
};

// 导出游戏类
export default AngryBirds;