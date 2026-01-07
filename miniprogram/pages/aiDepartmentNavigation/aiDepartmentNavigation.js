// pages/aiDepartmentNavigation/aiDepartmentNavigation.js
Page({
  data: {
    // 地图及路线信息
    mapInfo: {
      title: 'AI路线指引',
      instructions: '请按照以下路线前往科室：\n1. 从当前位置出发，沿走廊直走\n2. 左转进入电梯厅，乘坐3楼电梯\n3. 出电梯后右转，直走50米即可到达呼吸内科'
    },
    // 医生信息
    doctorInfo: {
      name: '张医生',
      department: '呼吸内科',
      title: '主任医师',
      experience: '15年临床经验',
      specialty: '擅长呼吸系统疾病诊治'
    },
    // 用户号码信息
    userNumber: {
      number: '1023',
      queuePosition: '当前排队：5人',
      estimatedTime: '预计等待时间：约30分钟'
    },
    // 功能未完成提示
    showUnfinishedModal: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('AI Department Navigation Page loaded with options:', options);
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