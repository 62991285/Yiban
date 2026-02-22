const cloud = require("wx-server-sdk");
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

// 获取openid
exports.main = async (event, context) => {
  console.log('开始执行getOpenId云函数');
  // 获取基础信息
  const wxContext = cloud.getWXContext();
  console.log('wxContext获取成功:', {
    OPENID: wxContext.OPENID,
    APPID: wxContext.APPID,
    UNIONID: wxContext.UNIONID
  });
  return {
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};
