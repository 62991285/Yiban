// app.js
// 日志控制模块
const isDev = true; // 开发环境为true，生产环境为false
const logger = {
  log: function(...args) {
    if (isDev) {
      console.log(...args);
    }
  },
  error: function(...args) {
    if (isDev) {
      console.error(...args);
    }
  }
};

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
      logger.error("请使用 2.2.3 或以上的基础库以使用云能力");
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
      
      // 检查登录态是否有效
      wx.checkSession({
        success: () => {
          // session 未过期，继续使用当前登录态
        },
        fail: () => {
          // session 已过期，重新登录
          that.login();
        }
      });
    } else {
      // 如果没有openid，执行登录获取openid
      that.login();
    }
  },
  
  // 用户登录
  login: function(callback) {
    const that = this;
    
    // 调用wx.login获取code
    wx.login({
      success: res => {
        if (res.code) {
          // 发送code到云函数获取openid
          wx.cloud.callFunction({
            name: 'getOpenId',
            data: {},
            success: res => {
              if (res.result && res.result.openid) {
                that.globalData.openid = res.result.openid;
                wx.setStorageSync('openid', res.result.openid);
                
                // 登录成功的标志是获取到openid
                if (callback) callback(true, res.result.openid);
              } else {
                logger.error('云函数getOpenId返回结果无效:', res);
                wx.showToast({
                  title: '登录失败，获取openid失败',
                  icon: 'none',
                  duration: 2000
                });
                if (callback) callback(false, null);
              }
            },
            fail: err => {
        logger.error('[云函数] [getOpenId] 调用失败', err);
        
        // 统一显示错误提示
        wx.showToast({
          title: '登录失败，请稍后重试',
          icon: 'none',
          duration: 2000
        });
        
        if (callback) callback(false, null);
      }
          });
        } else {
          logger.error('登录失败！获取code失败:', res.errMsg);
          wx.showToast({
            title: '登录失败，获取code失败',
            icon: 'none',
            duration: 2000
          });
          if (callback) callback(false, null);
        }
      },
      fail: err => {
        logger.error('wx.login调用失败:', err);
        wx.showToast({
          title: '登录失败，请稍后重试',
          icon: 'none',
          duration: 2000
        });
        if (callback) callback(false, null);
      }
    });
  },
  
  // 创建用户集合
  createUserCollection: function() {
    wx.cloud.callFunction({
      name: 'createUserCollection',
      data: {},
      success: res => {
        logger.log('创建用户集合成功', res);
      },
      fail: err => {
        logger.error('[云函数] [createUserCollection] 调用失败', err);
      }
    });
  },
  
  // 获取用户信息（自动获取已授权的信息，未授权则返回需要授权的状态）
  getUserInfo: function(callback) {
    const that = this;
    
    // 检查用户授权状态
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: res => {
              that.globalData.userInfo = res.userInfo;
              wx.setStorageSync('userInfo', res.userInfo);
              
              // 将用户信息保存到云数据库
              that.saveUserInfoToCloud(res.userInfo);
              
              if (callback) callback(true, res.userInfo);
            },
            fail: err => {
              logger.error('wx.getUserInfo调用失败:', err);
              if (callback) callback(false, err);
            }
          });
        } else {
          // 未授权，不能自动调用 wx.getUserProfile，需要通过按钮触发
          // 这里返回一个特殊状态，让页面显示授权按钮
          if (callback) callback('needAuth', null);
        }
      },
      fail: err => {
        logger.error('wx.getSetting调用失败:', err);
        if (callback) callback(false, err);
      }
    });
  },
  
  // 通过按钮点击触发的用户信息获取（仅用于用户手势触发）
  getUserInfoByButton: function(callback) {
    const that = this;
    
    // 检查用户授权状态
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: res => {
              that.globalData.userInfo = res.userInfo;
              wx.setStorageSync('userInfo', res.userInfo);
              
              // 将用户信息保存到云数据库
              that.saveUserInfoToCloud(res.userInfo);
              
              if (callback) callback(true, res.userInfo);
            },
            fail: err => {
              logger.error('wx.getUserInfo调用失败:', err);
              if (callback) callback(false, err);
            }
          });
        } else {
          // 未授权，通过按钮点击触发授权
          wx.getUserProfile({
            desc: '用于完善用户资料', // 声明获取用户信息的用途
            success: res => {
              that.globalData.userInfo = res.userInfo;
              wx.setStorageSync('userInfo', res.userInfo);
              
              // 将用户信息保存到云数据库
              that.saveUserInfoToCloud(res.userInfo);
              
              if (callback) callback(true, res.userInfo);
            },
            fail: err => {
              logger.error('wx.getUserProfile调用失败:', err);
              if (callback) callback(false, err);
            }
          });
        }
      },
      fail: err => {
        logger.error('wx.getSetting调用失败:', err);
        if (callback) callback(false, err);
      }
    });
  },
  
  // 检查云开发状态
  checkCloudStatus: function(callback) {
    const that = this;
    
    // 调用云函数检查状态
    wx.cloud.callFunction({
      name: 'getOpenId',
      data: {},
      success: res => {
        if (res.result && res.result.openid) {
          if (callback) callback(true);
        } else {
          if (callback) callback(false, 'cloud_error');
        }
      },
      fail: err => {
        if (err.errMsg && err.errMsg.includes('-601034')) {
          if (callback) callback(false, 'cloud_not_enabled');
        } else {
          if (callback) callback(false, 'cloud_error');
        }
      }
    });
  },
  
  // 保存用户信息到云数据库
  saveUserInfoToCloud: function(userInfo) {
    const that = this;
    
    // 确保用户信息存在
    if (!userInfo) {
      logger.error('保存用户信息失败：用户信息不存在');
      return;
    }
    
    // 确保openid存在
    if (!that.globalData.openid) {
      logger.error('保存用户信息失败：openid不存在');
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
      name: 'upsertUserInfo',
      data: {
        userInfo: safeUserInfo
      },
      success: res => {
        logger.log('保存用户信息成功', res);
      },
      fail: err => {
        logger.error('[云函数] [upsertUserInfo] 调用失败', err);
        
        // 统一显示错误提示
        wx.showToast({
          title: '保存用户信息失败，请稍后重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  

});
