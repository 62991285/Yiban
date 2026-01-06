Page({
  // 返回上一级页面
  goBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  // 跳转一键挂号页面
  toRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    })
  },

  // 跳转科室导航页面
  toDeptNav() {
    wx.navigateTo({
      url: '/pages/deptNav/deptNav'
    })
  }
})