Page({
  // 新增：刷新按钮点击事件
  onRefresh() {
    // 显示加载提示
    wx.showLoading({
      title: '刷新中...',
      mask: true
    })

    // 模拟刷新逻辑（你可以替换成实际的业务逻辑，比如重新请求数据）
    setTimeout(() => {
      // 隐藏加载提示
      wx.hideLoading()
      // 提示刷新成功
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1500
      })
    }, 1000)
  },

  // 前往AI问诊页面
  toConsult() {
    wx.navigateTo({
      url: '/pages/consultDetail/consultDetail'
    })
  },

  // 前往问诊记录页面
  toRecord() {
    wx.navigateTo({
      url: '/pages/record/record'
    })
  },

  // 前往“我的”页面
  toMine() {
    wx.navigateTo({
      url: '/pages/mine/mine'
    })
  }
})