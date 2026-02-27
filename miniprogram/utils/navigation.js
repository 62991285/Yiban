/**
 * 页面导航工具函数
 */

/**
 * 跳转到历史记录页面
 */
export function gotoHistory() {
  console.log('[DEBUG] gotoHistory');
  // wx.navigateTo({ url: '/pages/history/history' });
}

/**
 * 跳转到语音输入页面
 */
export function gotoVoiceInput() {
  console.log('[DEBUG] gotoVoiceInput');
  wx.navigateTo({ url: '/pages/appointment/appointment' });
}

/**
 * 跳转到报告页面
 */
export function gotoReport() {
  console.log('[DEBUG] gotoReport');
  // wx.navigateTo({ url: '/pages/report/report' });
}

/**
 * 跳转到AI解释页面
 */
export function gotoAIExplanation() {
  console.log('[DEBUG] gotoAIExplanation');
  // wx.navigateTo({ url: '/pages/aiExplanation/aiExplanation' });
}
