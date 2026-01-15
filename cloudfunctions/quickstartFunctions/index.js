const cloud = require("wx-server-sdk");
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
// 获取openid
const getOpenId = async () => {
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

// 获取小程序二维码
const getMiniProgramCode = async () => {
  // 获取小程序二维码的buffer
  const resp = await cloud.openapi.wxacode.get({
    path: "pages/index/index",
  });
  const { buffer } = resp;
  // 将图片上传云存储空间
  const upload = await cloud.uploadFile({
    cloudPath: "code.png",
    fileContent: buffer,
  });
  return upload.fileID;
};

// 创建用户集合
const createUserCollection = async () => {
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

// 创建销售集合
const createCollection = async () => {
  try {
    // 创建集合
    await db.createCollection("sales");
    await db.collection("sales").add({
      // data 字段表示需新增的 JSON 数据
      data: {
        region: "华东",
        city: "上海",
        sales: 11,
      },
    });
    await db.collection("sales").add({
      // data 字段表示需新增的 JSON 数据
      data: {
        region: "华东",
        city: "南京",
        sales: 11,
      },
    });
    await db.collection("sales").add({
      // data 字段表示需新增的 JSON 数据
      data: {
        region: "华南",
        city: "广州",
        sales: 22,
      },
    });
    await db.collection("sales").add({
      // data 字段表示需新增的 JSON 数据
      data: {
        region: "华南",
        city: "深圳",
        sales: 22,
      },
    });
    return {
      success: true,
    };
  } catch (e) {
    // 这里catch到的是该collection已经存在，从业务逻辑上来说是运行成功的，所以catch返回success给前端，避免工具在前端抛出异常
    return {
      success: true,
      data: "create collection success",
    };
  }
};

// 查询数据
const selectRecord = async () => {
  // 返回数据库查询结果
  return await db.collection("sales").get();
};

// 更新数据
const updateRecord = async (event) => {
  try {
    // 遍历修改数据库信息
    for (let i = 0; i < event.data.length; i++) {
      await db
        .collection("sales")
        .where({
          _id: event.data[i]._id,
        })
        .update({
          data: {
            sales: event.data[i].sales,
          },
        });
    }
    return {
      success: true,
      data: event.data,
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e,
    };
  }
};

// 新增数据
const insertRecord = async (event) => {
  try {
    const insertRecord = event.data;
    // 插入数据
    await db.collection("sales").add({
      data: {
        region: insertRecord.region,
        city: insertRecord.city,
        sales: Number(insertRecord.sales),
      },
    });
    return {
      success: true,
      data: event.data,
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e,
    };
  }
};

// 删除数据
const deleteRecord = async (event) => {
  try {
    await db
      .collection("sales")
      .where({
        _id: event.data._id,
      })
      .remove();
    return {
      success: true,
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e,
    };
  }
};

// 获取用户信息
const getUserInfo = async (event) => {
  try {
    const { openid } = event;
    
    // 数据验证
    if (!openid || openid.trim() === '') {
      return {
        success: false,
        errMsg: "openid不能为空"
      };
    }
    
    const user = await db.collection("users").where({
      openid: openid
    }).get();
    
    // 如果找到用户，过滤敏感数据
    if (user.data[0]) {
      // 创建一个新对象，只包含需要返回给前端的非敏感字段
      const safeUserInfo = {
        nickName: user.data[0].nickName,
        avatarUrl: user.data[0].avatarUrl,
        gender: user.data[0].gender,
        province: user.data[0].province,
        city: user.data[0].city,
        country: user.data[0].country,
        language: user.data[0].language,
        motto: user.data[0].motto,
        createdAt: user.data[0].createdAt,
        updatedAt: user.data[0].updatedAt
      };
      
      return {
        success: true,
        data: safeUserInfo
      };
    } else {
      return {
        success: true,
        data: null
      };
    }
  } catch (e) {
    console.error('getUserInfo error:', e);
    return {
      success: false,
      errMsg: "获取用户信息失败，请稍后重试"
    };
  }
};

// 创建或更新用户信息
const upsertUserInfo = async (event) => {
  try {
    let { openid, userInfo } = event;
    
    // 获取当前用户的真实openid
    const wxContext = cloud.getWXContext();
    const realOpenid = wxContext.OPENID;
    
    // 安全检查：确保用户只能操作自己的信息
    if (!openid || openid !== realOpenid) {
      return {
        success: false,
        errMsg: "无权操作此用户信息"
      };
    }
    
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

// const getOpenId = require('./getOpenId/index');
// const getMiniProgramCode = require('./getMiniProgramCode/index');
// const createCollection = require('./createCollection/index');
// const selectRecord = require('./selectRecord/index');
// const updateRecord = require('./updateRecord/index');
// const sumRecord = require('./sumRecord/index');
// const fetchGoodsList = require('./fetchGoodsList/index');
// const genMpQrcode = require('./genMpQrcode/index');
// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case "getOpenId":
      return await getOpenId();
    case "getMiniProgramCode":
      return await getMiniProgramCode();
    case "createCollection":
      return await createCollection();
    case "createUserCollection":
      return await createUserCollection();
    case "selectRecord":
      return await selectRecord();
    case "updateRecord":
      return await updateRecord(event);
    case "insertRecord":
      return await insertRecord(event);
    case "deleteRecord":
      return await deleteRecord(event);
    case "getUserInfo":
      return await getUserInfo(event);
    case "upsertUserInfo":
      return await upsertUserInfo(event);
  }
};
