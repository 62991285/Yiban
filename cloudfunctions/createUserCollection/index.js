const cloud = require("wx-server-sdk");
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

// 创建用户集合
exports.main = async () => {
  try {
    // 创建用户集合
    await db.createCollection("users");
    return {
      success: true,
      data: "create users collection success",
    };
  } catch (e) {
    // 这里catch到的是该collection已经存在，从业务逻辑上来说是运行成功的，所以catch返回success给前端
    return {
      success: true,
      data: "users collection already exists",
    };
  }
};
