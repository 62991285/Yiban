const cloud = require("wx-server-sdk");
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

// 创建或更新用户信息
exports.main = async (event) => {
  try {
    let { userInfo } = event;
    
    // 获取当前用户的真实openid
    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID;
    
    // 数据验证
    if (!openid || openid.trim() === '') {
      return {
        success: false,
        errMsg: "openid不能为空"
      };
    }
    
    if (userInfo.nickName && userInfo.nickName.trim() === '') {
      return {
        success: false,
        errMsg: "昵称不能为空"
      };
    }
    
    // 限制昵称长度
    if (userInfo.nickName && userInfo.nickName.length > 20) {
      return {
        success: false,
        errMsg: "昵称长度不能超过20个字符"
      };
    }
    
    // 限制个人签名长度
    if (userInfo.motto && userInfo.motto.length > 100) {
      return {
        success: false,
        errMsg: "个人签名长度不能超过100个字符"
      };
    }
    
    // 验证性别值
    if (userInfo.gender && ![0, 1, 2].includes(userInfo.gender)) {
      return {
        success: false,
        errMsg: "性别值无效"
      };
    }
    
    // 检查用户是否存在
    const user = await db.collection("users").where({
      openid: openid
    }).get();
    
    // 准备要保存的用户信息（过滤掉敏感字段，只允许更新指定字段）
    const safeUserInfo = {
      updatedAt: db.serverDate(),
      motto: userInfo.motto || '这个人很懒，还没有设置签名~' // 补充默认值
    };
    
    // 只允许更新特定字段
    if (userInfo.nickName !== undefined) safeUserInfo.nickName = userInfo.nickName;
    if (userInfo.avatarUrl !== undefined) safeUserInfo.avatarUrl = userInfo.avatarUrl;
    if (userInfo.gender !== undefined) safeUserInfo.gender = userInfo.gender;
    if (userInfo.province !== undefined) safeUserInfo.province = userInfo.province;
    if (userInfo.city !== undefined) safeUserInfo.city = userInfo.city;
    if (userInfo.country !== undefined) safeUserInfo.country = userInfo.country;
    if (userInfo.language !== undefined) safeUserInfo.language = userInfo.language;
    if (userInfo.motto !== undefined) safeUserInfo.motto = userInfo.motto;
    
    if (user.data.length > 0) {
      // 更新用户信息
      await db.collection("users").where({
        openid: openid
      }).update({
        data: safeUserInfo
      });
      return {
        success: true,
        data: "update user success"
      };
    } else {
      // 创建新用户
      await db.collection("users").add({
        data: {
          openid: openid,
          ...safeUserInfo,
          createdAt: db.serverDate()
        }
      });
      return {
        success: true,
        data: "create user success"
      };
    }
  } catch (e) {
    console.error('upsertUserInfo error:', e);
    return {
      success: false,
      errMsg: "操作失败，请稍后重试"
    };
  }
};
