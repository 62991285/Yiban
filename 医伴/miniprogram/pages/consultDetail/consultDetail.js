Page({
  data: {
    showUnfinishedModal: false
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面加载时自动显示功能未完成提示
    this.setData({
      showUnfinishedModal: true
    })
  },

  // 功能未完成提示
  showUnfinishedTip() {
    this.setData({
      showUnfinishedModal: true
    })
  },

  // 关闭提示弹窗
  onModalClose() {
    this.setData({
      showUnfinishedModal: false
    })
  },

  // 跳转一键挂号页面
  toRegister() {
    wx.navigateTo({
      url: '/pages/registerHelper/registerHelper'
    })
  },

  // 跳转科室导航页面（未完成功能）
  toDeptNav() {
    this.showUnfinishedTip()
  }
})