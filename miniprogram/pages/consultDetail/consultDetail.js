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

  // 跳转科室导航页面
  toDeptNav() {
    wx.navigateTo({
      url: '/pages/aiDepartmentNavigation/aiDepartmentNavigation'
    })
  },

  // 跳转到药室导航页面
  toPharmacyNav() {
    wx.navigateTo({
      url: '/pages/aiPharmacyNavigation/aiPharmacyNavigation'
    })
  },

  // 点击流程图步骤跳转
  goToStep(e) {
    const step = e.currentTarget.dataset.step
    switch(step) {
      case '1':
        this.toRegister()
        break
      case '2':
        this.toDeptNav()
        break
      case '3':
        this.toPharmacyNav()
        break
      default:
        break
    }
  },

  // 从头开始按钮功能
  startFromBeginning() {
    this.toRegister()
  }
})