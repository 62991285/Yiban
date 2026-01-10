// pages/editUserInfo/editUserInfo.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取当前用户信息
    this.loadUserInfo();
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
   * 加载用户信息
   */
  loadUserInfo() {
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo') || {};
    this.setData({
      userInfo: userInfo
    });
  },
  
  /**
   * 返回按钮点击事件
   */
  onBackTap() {
    wx.navigateBack();
  },
  
  /**
   * 保存按钮点击事件
   */
  onSaveTap() {
    const that = this;
    const userInfo = this.data.userInfo;
    
    // 完善的数据验证
    if (!userInfo.nickName || userInfo.nickName.trim() === '') {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }
    
    if (userInfo.nickName.length > 20) {
      wx.showToast({
        title: '昵称长度不能超过20个字符',
        icon: 'none'
      });
      return;
    }
    
    if (userInfo.motto && userInfo.motto.length > 100) {
      wx.showToast({
        title: '个人签名长度不能超过100个字符',
        icon: 'none'
      });
      return;
    }
    
    if (userInfo.gender && ![0, 1, 2].includes(userInfo.gender)) {
      wx.showToast({
        title: '性别选择无效',
        icon: 'none'
      });
      return;
    }
    
    // 保存用户信息到云数据库
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'upsertUserInfo',
        openid: app.globalData.openid || wx.getStorageSync('openid'),
        userInfo: userInfo
      },
      success: res => {
        if (res.result.success) {
          // 更新本地和全局的用户信息
          app.globalData.userInfo = userInfo;
          wx.setStorageSync('userInfo', userInfo);
          
          // 显示保存成功提示
          wx.showToast({
            title: '保存成功',
            icon: 'success',
            success: () => {
              // 返回上一页
              setTimeout(() => {
                wx.navigateBack();
              }, 1500);
            }
          });
        }
      },
      fail: err => {
        console.error('[云函数] [upsertUserInfo] 调用失败', err);
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    });
  },
  
  /**
   * 昵称输入事件
   */
  onNickNameInput(e) {
    const nickName = e.detail.value;
    this.setData({
      'userInfo.nickName': nickName
    });
  },
  
  /**
   * 性别选择事件
   */
  onGenderChange(e) {
    const gender = parseInt(e.detail.value);
    this.setData({
      'userInfo.gender': gender
    });
  },
  
  /**
   * 个人签名输入事件
   */
  onMottoInput(e) {
    const motto = e.detail.value;
    this.setData({
      'userInfo.motto': motto
    });
  },
  
  /**
   * 头像上传点击事件
   */
  onAvatarUploadTap() {
    const that = this;
    
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePath = res.tempFilePaths[0];
        
        // 上传图片到云存储
        wx.cloud.uploadFile({
          cloudPath: `user-avatars/${app.globalData.openid || wx.getStorageSync('openid')}-${Date.now()}.png`,
          filePath: tempFilePath,
          success: res => {
            // 更新用户头像URL
            that.setData({
              'userInfo.avatarUrl': res.fileID
            });
            
            wx.showToast({
              title: '头像上传成功',
              icon: 'success'
            });
          },
          fail: err => {
            console.error('[上传文件] 失败：', err);
            wx.showToast({
              title: '头像上传失败',
              icon: 'none'
            });
          }
        });
      }
    });
  }
})