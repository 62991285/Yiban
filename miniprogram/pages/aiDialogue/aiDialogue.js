Page({
  data: {
    
    isAIAssistedMode:false,
    showFunctionalBar: false,
    showTaskDetail: false,
    currentTaskSummary: '',
    currentTaskDetail: '',
    userInput: '',
    messages: [
      {
        speaker: 'ai',
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

  startOrDeleteNewTask() {
    if(!this.isAIAssistedMode)
    { const newTask = {
        summary: '正在为您创建新问诊任务...',
        detail: '系统将引导您完成症状采集与分诊。'
      };
      this.setData({
        currentTaskSummary: newTask.summary,
        currentTaskDetail: newTask.detail,
        showTaskDetail: true,
        messages: [{
          speaker: 'ai',
          content: '您好！检测到您开启了一段新问诊，请描述您的主要不适：',
          options: ['头痛发热', '胸闷气促', '腹痛腹泻', '皮疹瘙痒']
        }]
      });
      this.scrollToBottom();
      this.isAIAssistedMode=true;
    }
    else{
      wx.showModal({
        content:"你确定要退出AI导诊模式吗？",
        confirmText:"确定",
        success (res) {
          if (res.confirm) {
            console.log('用户点击确认')
            this.isAIAssistedMode=false;
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })

    }
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
    // const newMessages = [
    //   ...this.data.messages,
    //   { type: 'user', content: userContent },
    //   { type: 'ai', content: 'AI思考中...' }
    // ];
  this.addMessage('user',userContent);
  this.addMessage('ai', 'AI思考中...')
    // this.setData({
    //   messages: newMessages,
    //   userInput: ''
    // });
this.setData({userInput: ''});
    // 立即滚动到底部（显示“思考中”）
    this.scrollToBottom();

    // 模拟 AI 异步回复
    setTimeout(async () => {
      const aiReply = await this.callAIModel(userContent);
      const updatedMessages = [
        ...this.data.messages.slice(0, -1),
        { speaker: 'ai', content: aiReply }
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

  deleteChatHistory()
  {
    this.setData({messages:[]});
  },

  // ========== 生命周期函数 ==========
  onLoad(options) {
    console.log('[DEBUG] onLoad:', options);
    const savedMessages = wx.getStorageSync('aiDialogue_messages') || [];
    if (savedMessages.length > 0) {
      this.setData({
        messages: savedMessages
      });
      // 恢复后自动滚动到底部
      this.scrollToBottom();
    } else {
      // 初始化首条 AI 消息（如需要）
      this.startNewTask();
    }
  },
  onShow() {
    console.log('[DEBUG] onShow');
    // this.setData({ showUnfinishedModal: true });
  },
  onReady() {},
  onHide() {
    // 保存关键状态到本地存储
    try {
      wx.setStorageSync('aiDialogue_messages', this.data.messages);
    } catch (e) {
      console.error('保存对话失败', e);
    }
  },
  onUnload() {    
    wx.setStorageSync('aiDialogue_messages', this.data.messages);
},

// 其他方法：sendMessage, scrollToBottom, startNewTask 等保持不变},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {},

  // ========== 功能跳转接口（预留） ==========

addMessage(_speaker,_content)
{
  const newMsg={speaker:_speaker,content:_content}
     this.setData({
       messages: this.data.messages.concat(newMsg)
     });
},

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
}



);