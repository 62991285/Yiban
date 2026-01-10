// pages/mine/mine.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    isLogin: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 更新用户信息
    this.updateUserInfo();
    
    // 如果未登录，显示自动登录提示
    if (!this.data.isLogin) {
      wx.showModal({
        title: '提示',
        content: '点击登录按钮或头像区域，即可自动获取微信昵称和头像',
        showCancel: false,
        confirmText: '知道了'
      });
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 下拉刷新时更新用户信息
    this.updateUserInfo();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  /**
   * 更新用户信息
   */
  updateUserInfo() {
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo') || {};
    const openid = app.globalData.openid || wx.getStorageSync('openid');
    const isLogin = !!openid;
    
    this.setData({
      userInfo: userInfo,
      isLogin: isLogin
    });
    
    // 如果已登录，从云数据库获取最新用户信息
    if (isLogin) {
      this.getUserInfoFromCloud();
    }
  },

  /**
   * 从云数据库获取用户信息
   */
  getUserInfoFromCloud() {
    const that = this;
    const openid = app.globalData.openid || wx.getStorageSync('openid');
    
    // 如果是临时openid，跳过云函数调用
    if (openid && openid.startsWith('temp_')) {
      console.log('使用临时openid，跳过云数据库查询');
      return;
    }
    
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getUserInfo',
        openid: openid
      },
      success: res => {
        if (res.result.success && res.result.data) {
          const userInfo = res.result.data;
          // 更新本地和全局的用户信息
          app.globalData.userInfo = userInfo;
          wx.setStorageSync('userInfo', userInfo);
          that.setData({
            userInfo: userInfo
          });
        }
      },
      fail: err => {
        console.error('[云函数] [getUserInfo] 调用失败', err);
        // 如果是云开发未开通或权限不足的错误，不显示错误提示
        if (err.errCode === -601034) {
          console.log('云开发未开通，使用本地用户信息');
        } else {
          // 其他错误可以显示提示
          wx.showToast({
            title: '获取用户信息失败',
            icon: 'none'
          });
        }
      }
    });
  },

  /**
   * 用户信息区域点击事件
   */
  onUserInfoTap() {
    if (!this.data.isLogin) {
      this.onLoginTap();
    }
  },

  /**
   * 登录按钮点击事件
   */
  onLoginTap() {
    const that = this;
    
    // 如果已经登录，直接返回
    if (this.data.isLogin) {
      wx.showToast({
        title: '您已登录',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '登录中...',
    });
    
    // 先确保openid已获取
    if (!app.globalData.openid && !wx.getStorageSync('openid')) {
      app.login((loginSuccess, openid) => {
        if (loginSuccess && openid) {
          // openid获取成功，登录状态已建立
          // 获取用户信息（无论是否成功，登录都算成功）
          app.getUserInfo((success, userInfo) => {
            wx.hideLoading();
            
            // 无论用户信息是否获取成功，都更新页面状态
            that.updateUserInfo();
            
            if (success) {
              // 用户信息获取成功
              wx.showToast({
                title: '登录成功',
                icon: 'success'
              });
            } else {
              // 用户信息获取失败，但登录已经成功
              console.error('获取用户信息失败', userInfo);
              wx.showToast({
                title: '登录成功',
                icon: 'success'
              });
            }
          });
        } else {
          wx.hideLoading();
          console.error('登录失败，无法获取openid');
          wx.showToast({
            title: '登录失败',
            icon: 'error'
          });
        }
      });
    } else {
      // 已有openid，登录状态已建立
      // 获取用户信息（无论是否成功，登录都算成功）
      app.getUserInfo((success, userInfo) => {
        wx.hideLoading();
        
        // 无论用户信息是否获取成功，都更新页面状态
        that.updateUserInfo();
        
        if (success) {
          // 用户信息获取成功
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });
        } else {
          // 用户信息获取失败，但登录已经成功
          console.error('获取用户信息失败', userInfo);
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });
        }
      });
    }
  },

  /**
   * 退出登录按钮点击事件
   */
  onLogoutTap() {
    const that = this;
    
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: res => {
        if (res.confirm) {
          // 清除本地缓存和全局数据
          app.globalData.userInfo = null;
          app.globalData.openid = null;
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('openid');
          
          // 更新页面信息
          that.setData({
            userInfo: {},
            isLogin: false
          });
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 编辑信息按钮点击事件
   */
  onEditInfoTap() {
    wx.navigateTo({
      url: '/pages/editUserInfo/editUserInfo'
    });
  },
  

})