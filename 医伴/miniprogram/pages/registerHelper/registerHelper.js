// pages/registerHelper/registerHelper.js
Page({
  data: {
    userInput: '',
    showSummaryModal: false,
    showUnfinishedModal: false,
    complaint: '头痛发热2天伴咳嗽',
    temperature: '38.5',
    messages: [
      {
        type: 'ai',
        content: '您好！我是您的挂号助手，请问有什么可以帮助您的吗？',
        options: ['头痛发热', '咳嗽咽痛', '腹痛腹泻']
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 可以接收从consultDetail页面传递过来的参数
    console.log('Register Helper Page loaded with options:', options);
  },

  /**
   * 用户输入变化事件
   */
  onInputChange(e) {
    this.setData({
      userInput: e.detail.value
    });
  },

  /**
   * 发送消息
   */
  sendMessage() {
    if (!this.data.userInput.trim()) return;

    // 获取用户输入的内容
    const userContent = this.data.userInput.trim();
    
    // 添加用户消息到对话历史
    const newMessages = [...this.data.messages, {
      type: 'user',
      content: userContent
    }];
    
    // 添加AI回复到对话历史
    newMessages.push({
      type: 'ai',
      content: '该功能还未完成，敬请期待！'
    });
    
    // 更新消息列表并清空输入框
    this.setData({
      messages: newMessages,
      userInput: ''
    });
    
    // 滚动到最新消息
    setTimeout(() => {
      const query = wx.createSelectorQuery();
      query.select('.chat-history').boundingClientRect();
      query.select('.chat-history').scrollOffset();
      query.exec((res) => {
        if (res && res[1]) {
          wx.pageScrollTo({
            scrollTop: res[1].scrollTop + res[0].height,
            duration: 300
          });
        }
      });
    }, 100);
  },

  /**
   * 选择症状选项
   */
  selectOption(e) {
    const option = e.currentTarget.textContent;
    console.log('Selected option:', option);
    
    // 这里可以添加选择选项后的逻辑
    wx.showToast({
      title: '已选择：' + option,
      icon: 'none',
      duration: 1000
    });
  },

  /**
   * 打开信息总结和挂号对话框
   */
  openSummaryModal() {
    this.setData({
      showSummaryModal: true
    });
  },

  /**
   * 关闭信息总结和挂号对话框
   */
  closeSummaryModal() {
    this.setData({
      showSummaryModal: false
    });
  },

  /**
   * 主诉输入变化
   */
  onComplaintChange(e) {
    this.setData({
      complaint: e.detail.value
    });
  },

  /**
   * 体温输入变化
   */
  onTemperatureChange(e) {
    this.setData({
      temperature: e.detail.value
    });
  },

  /**
   * 确认挂号
   */
  confirmRegistration() {
    // 这里可以添加确认挂号的逻辑
    wx.showToast({
      title: '挂号信息已提交',
      icon: 'success',
      duration: 1500
    });

    this.closeSummaryModal();
  },

  /**
   * 下一步按钮点击事件
   */
  nextStep() {
    // 跳转到AI辅助科室导航页面
    wx.navigateTo({
      url: '/pages/aiDepartmentNavigation/aiDepartmentNavigation'
    });
  },

  /**
   * 关闭提示弹窗
   */
  onModalClose() {
    this.setData({
      showUnfinishedModal: false
    });
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