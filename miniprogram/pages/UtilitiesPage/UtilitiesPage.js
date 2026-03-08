// pages/UtilitiesPage/UtilitiesPage.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    functionList: [
      {
        id: 1,
        title: 'AI智能分诊',
        desc: '智能分析症状，推荐就诊科室',
        icon: '/images/icons/business.png',
        url: '/pages/DepartmentNavigationPage/DepartmentNavigationPage'
      },
      {
        id: 2,
        title: 'AI智能导诊',
        desc: '药房智能导航，快速找到药品',
        icon: '/images/icons/home.png',
        url: '/pages/PharmacyNavigationPage/PharmacyNavigationPage'
      },
      {
        id: 3,
        title: '在线问诊',
        desc: '与AI医生实时对话，获取专业建议',
        icon: '/images/icons/customer-service.svg',
        url: '/pages/ChatPage/ChatPage'
      },
      {
        id: 4,
        title: '预约挂号',
        desc: '快速预约专家门诊',
        icon: '/images/icons/examples.png',
        url: '/pages/AppointmentPage/AppointmentPage'
      },
      {
        id: 5,
        title: '我的档案',
        desc: '查看和管理个人信息',
        icon: '/images/icons/usercenter.png',
        url: '/pages/UserInfoPage/UserInfoPage'
      },
      {
        id: 6,
        title: '编辑资料',
        desc: '完善个人健康信息',
        icon: '/images/icons/setting.svg',
        url: '/pages/EditUserInfoPage/EditUserInfoPage'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 页面跳转
   */
  navigateToPage(e) {
    const url = e.currentTarget.dataset.url
    if (url) {
      wx.navigateTo({
        url: url,
        fail: () => {
          wx.showToast({
            title: '页面开发中',
            icon: 'none'
          })
        }
      })
    }
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

  }
})
