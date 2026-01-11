
Page({
  data: {

    showFunctionalBar: false,
    showTaskDetail: false,
    currentTaskSummary: '',
    currentTaskDetail: '',
    userInput: '',
    showSummaryModal: false,
    showUnfinishedModal: false,
    showPaymentModal: false,
    complaint: '头痛发热2天伴咳嗽',
    temperature: '38.5',
    messages: [
      {
        type: 'ai',
        content: '您好！我是您的医伴助手，请问有什么可以帮助您的吗？',
        options: ['头痛发热', '咳嗽咽痛', '腹痛腹泻']
      }
    ],
    scrollTop: 0
  },

  // ========== 已使用函数（带调试日志） ==========

  toggleFunctionalBar() {
    console.log('[DEBUG] toggleFunctionalBar called');
    this.setData({ showFunctionalBar: !this.data.showFunctionalBar });
  },

  toggleTaskDescription() {
    console.log('[DEBUG] toggleTaskDescription called');
    this.setData({ showTaskDetail: !this.data.showTaskDetail });
  },

  startNewTask() {
    console.log('[DEBUG] startNewTask called');
    const newTask = {
      summary: '正在为您创建新问诊任务...',
      detail: '系统将引导您完成症状采集与分诊。'
    };
    this.setData({
      currentTaskSummary: newTask.summary,
      currentTaskDetail: newTask.detail,
      showTaskDetail: true,
      messages: [{
        type: 'ai',
        content: '您好！检测到您开启了一段新问诊，请描述您的主要不适：',
        options: ['头痛发热', '胸闷气促', '腹痛腹泻', '皮疹瘙痒']
      }]
    });
    this.scrollToBottom();
  },

  async callAIModel(userMessage) {
    console.log('[DEBUG] callAIModel input:', userMessage);
    // TODO: 替换为真实 API 调用
    return '（模拟）AI 正在分析您的症状...';
  },


  sendMessage() {
    console.log('[DEBUG] sendMessage called');
    if (!this.data.userInput.trim()) return;

    const userContent = this.data.userInput.trim();
    const newMessages = [
      ...this.data.messages,
      { type: 'user', content: userContent },
      { type: 'ai', content: 'AI思考中...' }
    ];

    this.setData({
      messages: newMessages,
      userInput: ''
    });

    // 立即滚动到底部（显示“思考中”）
    this.scrollToBottom();

    // 模拟 AI 异步回复
    setTimeout(async () => {
      const aiReply = await this.callAIModel(userContent);
      const updatedMessages = [
        ...this.data.messages.slice(0, -1),
        { type: 'ai', content: aiReply }
      ];
      this.setData({ messages: updatedMessages });
      this.scrollToBottom(); // 再次滚动到底
    }, 800);
  },

  scrollToBottom() {
    // 计算 scroll-top 为一个足够大的数
    this.setData({ scrollTop: 999999 });
  },

  selectOption(e) {
    console.log('[DEBUG] selectOption:', e.currentTarget.dataset.option || e.currentTarget.textContent);
    wx.showToast({ title: '已选择：' + e.currentTarget.textContent, icon: 'none', duration: 1000 });
  },

  nextStep() {
    console.log('[DEBUG] nextStep called');
    this.setData({ showPaymentModal: true });
  },

  closePaymentModal() {
    console.log('[DEBUG] closePaymentModal called');
    this.setData({ showPaymentModal: false });
  },

  onPaymentComplete() {
    console.log('[DEBUG] onPaymentComplete called');
    this.closePaymentModal();
    wx.navigateTo({ url: '/pages/aiDepartmentNavigation/aiDepartmentNavigation' });
  },

  onInputChange(e) {
    console.log('[DEBUG] onInputChange:', e.detail.value);
    this.setData({ userInput: e.detail.value });
  },

  // ========== 生命周期函数 ==========
  onLoad(options) {
    console.log('[DEBUG] onLoad:', options);
  },
  onShow() {
    console.log('[DEBUG] onShow');
    // this.setData({ showUnfinishedModal: true });
  },
  onReady() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {},

  // ========== 功能跳转接口（预留） ==========

gotoHistory() {
  console.log('[DEBUG] gotoHistory');
  // wx.navigateTo({ url: '/pages/history/history' });
},

gotoVoiceInput() {
  console.log('[DEBUG] gotoVoiceInput');
  // wx.navigateTo({ url: '/pages/voiceInput/voiceInput' });
},

gotoReport() {
  console.log('[DEBUG] gotoReport');
  // wx.navigateTo({ url: '/pages/report/report' });
},

gotoAIExplanation() {
  console.log('[DEBUG] gotoAIExplanation');
  // wx.navigateTo({ url: '/pages/aiExplanation/aiExplanation' });
},
toggleFunctionalBar() {
  console.log('[DEBUG] toggleFunctionalBar');
  this.setData({
    showFunctionalBar: !this.data.showFunctionalBar
  });
},

});