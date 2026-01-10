// app.js
App({
  onLaunch: function () {
    this.globalData = {
      // env 参数说明：
      //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
      //   此处使用动态环境配置，确保与云函数使用的环境一致
      env: wx.cloud.DYNAMIC_CURRENT_ENV,
      userInfo: null,
      openid: null
    };
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }
    
    // 初始化时检查用户登录状态
    this.checkLoginStatus();
  },
  
  // 检查用户登录状态
  checkLoginStatus: function() {
    const that = this;
    // 从本地缓存获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    const openid = wx.getStorageSync('openid');
    
    // 优先从缓存加载数据到全局
    if (userInfo) {
      that.globalData.userInfo = userInfo;
    }
    if (openid) {
      that.globalData.openid = openid;
    }
    
    // 如果没有openid，执行登录获取openid
    if (!openid) {
      that.login();
    }
  },
  
  // 用户登录
  login: function(callback) {
    const that = this;
    console.log('开始登录流程');
    
    // 调用wx.login获取code
    wx.login({
      success: res => {
        console.log('wx.login成功，code:', res.code);
        if (res.code) {
          // 发送code到云函数获取openid
          wx.cloud.callFunction({
            name: 'quickstartFunctions',
            data: {
              type: 'getOpenId'
            },
            success: res => {
              console.log('云函数getOpenId调用成功，结果:', res);
              if (res.result && res.result.openid) {
                that.globalData.openid = res.result.openid;
                wx.setStorageSync('openid', res.result.openid);
                console.log('openid已保存到全局和本地存储:', res.result.openid);
                
                // 创建用户集合（如果不存在）
                that.createUserCollection();
                
                // 获取用户信息，添加回调函数处理结果
                that.getUserInfo((success, userInfo) => {
                  if (!success) {
                    console.log('首次登录未获取到用户信息，等待用户主动授权');
                  } else {
                    console.log('首次登录成功获取用户信息', userInfo);
                  }
                });
                // 登录成功的标志是获取到openid，而不是用户信息
                if (callback) callback(true, res.result.openid);
              } else {
                console.error('云函数getOpenId返回结果无效:', res);
                if (callback) callback(false, null);
              }
            },
            fail: err => {
              console.error('[云函数] [getOpenId] 调用失败', err);
              
              // 检查是否是云开发未开通的错误
              if (err.errMsg && err.errMsg.includes('-601034')) {
                console.log('云开发服务未开通或权限不足，使用临时方案继续登录流程');
                
                // 临时方案：使用时间戳和随机数生成临时openid
                const tempOpenid = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                that.globalData.openid = tempOpenid;
                wx.setStorageSync('openid', tempOpenid);
                console.log('使用临时openid:', tempOpenid);
                
                // 虽然云开发不可用，但仍然允许用户继续使用小程序
                if (callback) callback(true, tempOpenid);
                return;
              }
              
              if (callback) callback(false, null);
            }
          });
        } else {
          console.error('登录失败！获取code失败:', res.errMsg);
          if (callback) callback(false, null);
        }
      },
      fail: err => {
        console.error('wx.login调用失败:', err);
        if (callback) callback(false, null);
      }
    });
  },
  
  // 创建用户集合
  createUserCollection: function() {
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'createUserCollection'
      },
      success: res => {
        console.log('创建用户集合成功', res);
      },
      fail: err => {
        console.error('[云函数] [createUserCollection] 调用失败', err);
        // 如果是云开发未开通的错误，不影响程序继续运行
        if (err.errMsg && err.errMsg.includes('-601034')) {
          console.log('云开发服务未开通，跳过用户集合创建');
        }
      }
    });
  },
  
  // 获取用户信息
  getUserInfo: function(callback) {
    const that = this;
    console.log('开始获取用户信息流程');
    
    // 检查用户授权状态
    wx.getSetting({
      success: res => {
        console.log('获取授权状态结果:', res);
        if (res.authSetting['scope.userInfo']) {
          // 已授权，可以直接调用 getUserInfo 获取头像昵称
          console.log('用户已授权，直接调用getUserInfo');
          wx.getUserInfo({
            success: res => {
              console.log('wx.getUserInfo调用成功，用户信息:', res.userInfo);
              that.globalData.userInfo = res.userInfo;
              wx.setStorageSync('userInfo', res.userInfo);
              console.log('用户信息已保存到全局和本地存储');
              
              // 将用户信息保存到云数据库
              that.saveUserInfoToCloud(res.userInfo);
              
              if (callback) callback(true, res.userInfo);
            },
            fail: err => {
              console.error('wx.getUserInfo调用失败:', err);
              if (callback) callback(false, err);
            }
          });
        } else {
          // 未授权，使用新的 getUserProfile API 获取用户信息
          console.log('用户未授权，调用getUserProfile请求授权');
          wx.getUserProfile({
            desc: '用于完善用户资料', // 声明获取用户信息的用途
            success: res => {
              console.log('wx.getUserProfile调用成功，用户信息:', res.userInfo);
              that.globalData.userInfo = res.userInfo;
              wx.setStorageSync('userInfo', res.userInfo);
              console.log('用户信息已保存到全局和本地存储');
              
              // 将用户信息保存到云数据库
              that.saveUserInfoToCloud(res.userInfo);
              
              if (callback) callback(true, res.userInfo);
            },
            fail: err => {
              console.error('wx.getUserProfile调用失败:', err);
              console.error('用户拒绝授权或授权流程中断');
              if (callback) callback(false, err);
            }
          });
        }
      },
      fail: err => {
        console.error('wx.getSetting调用失败:', err);
        if (callback) callback(false, err);
      }
    });
  },
  
  // 保存用户信息到云数据库
  saveUserInfoToCloud: function(userInfo) {
    const that = this;
    
    // 确保用户信息和openid存在
    if (!userInfo || !that.globalData.openid) {
      console.error('保存用户信息失败：用户信息或openid不存在');
      return;
    }
    
    // 检查openid是否是临时openid
    if (that.globalData.openid.startsWith('temp_')) {
      console.log('使用临时openid，跳过云数据库保存');
      return;
    }
    
    // 过滤不必要的字段，只保存需要的信息
    const safeUserInfo = {
      nickName: userInfo.nickName,
      avatarUrl: userInfo.avatarUrl,
      gender: userInfo.gender,
      province: userInfo.province,
      city: userInfo.city,
      country: userInfo.country,
      language: userInfo.language
    };
    
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'upsertUserInfo',
        openid: that.globalData.openid,
        userInfo: safeUserInfo
      },
      success: res => {
        console.log('保存用户信息成功', res);
      },
      fail: err => {
        console.error('[云函数] [upsertUserInfo] 调用失败', err);
        // 如果是云开发未开通的错误，不影响程序继续运行
        if (err.errMsg && err.errMsg.includes('-601034')) {
          console.log('云开发服务未开通，跳过用户信息保存到云数据库');
        }
      }
    });
  },
  

});
