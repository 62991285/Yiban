// pages/aiPharmacyNavigation/aiPharmacyNavigation.js
Page({
  data: {
    // 地图及路线信息
    mapInfo: {
      title: 'AI路线指引',
      instructions: '请按照以下路线前往药室：\n1. 从当前位置出发，沿走廊直走\n2. 右转进入电梯厅，乘坐1楼电梯\n3. 出电梯后左转，直走30米即可到达药房取药窗口'
    },
    // 药室信息
    pharmacyInfo: {
      name: '药房',
      location: '1楼大厅西侧',
      operatingHours: '周一至周日 8:00-18:00',
      contact: '010-12345678'
    },
    // 取药信息
    medicineInfo: {
      prescriptionNumber: 'RX20230515001',
      medicineCount: '3种药品',
      waitingTime: '预计等待时间：约15分钟'
    },
    // 功能未完成提示
    showUnfinishedModal: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('AI Pharmacy Navigation Page loaded with options:', options);
  },

  /**
   * 下一步按钮点击事件
   */
  nextStep() {
    // 显示功能未完成提示
    this.setData({
      showUnfinishedModal: true
    })
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
    // 页面加载时自动显示功能未完成提示
    this.setData({
      showUnfinishedModal: true
    })
  },

  /**
   * 关闭提示弹窗
   */
  onModalClose() {
    this.setData({
      showUnfinishedModal: false
    })
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
