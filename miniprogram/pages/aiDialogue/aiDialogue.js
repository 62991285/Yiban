Page({
  data: {
    
    isAIAssistedMode:false,
    showTaskDetail: false,
    currentTaskSummary: '',
    currentTaskDetail: '',
    userInput: '',
    currentStageIndex: 0,
    isAITyping: false,
    aiStageList: [
      {
        summary: '阶段 1：主诉采集',
        detail: '请您详细描述主要症状，如疼痛部位、持续时间、严重程度等。',
        icon: '🩺',
        options: ['头痛发热', '胸闷气促', '腹痛腹泻', '皮疹瘙痒']
      },
      {
        summary: '阶段 2：既往病史询问',
        detail: '请告知是否有慢性疾病、过敏史、近期用药情况等。',
        icon: '💊',
        options: ['高血压', '糖尿病', '药物过敏', '无特殊病史']
      },
      {
        summary: '阶段 3：生活习惯与旅行史',
        detail: '请说明近期旅行情况、饮食及作息习惯。',
        icon: '🌍',
        options: ['近期有长途旅行', '作息规律', '饮食偏油腻', '常熬夜']
      },
      {
        summary: '阶段 4：分诊建议生成',
        detail: 'AI 正在分析您的资料，稍后将给出分诊建议。',
        icon: '🏥',
        options: []
      }
    ],
    messages: [],
    scrollTop: 0,

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
    const firstStage = this.data.aiStageList[0];
    const newTask = {
      summary: firstStage.summary,
      detail: firstStage.detail
    };
    this.setData({
      currentTaskSummary: newTask.summary,
      currentTaskDetail: newTask.detail,
      showTaskDetail: true,
      currentStageIndex: 0,
      messages: [{
        speaker: 'ai',
        content: '您好！我是AI健康助手，我将通过几个问题来了解您的情况并提供初步建议。\n\n' + firstStage.detail,
        options: firstStage.options
      }]
    });
    this.scrollToBottom();
    this.setData({ isAIAssistedMode: true });
  },

  startOrDeleteNewTask() {
    if(!this.data.isAIAssistedMode) {
      this.startNewTask();
    } else {
      wx.showModal({
        title: '确认退出',
        content: "确定要退出AI导诊模式吗？当前的问诊进度将会丢失。",
        confirmText: "确定退出",
        cancelText: "继续问诊",
        success: (res) => {
          if (res.confirm) {
            console.log('用户确认退出AI导诊模式');
            this.setData({ 
              isAIAssistedMode: false,
              currentStageIndex: 0,
              messages: []
            });
            wx.showToast({ title: '已退出AI导诊', icon: 'success' });
          } else {
            console.log('用户取消退出');
          }
        }
      });
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
    
    // 如果在AI辅助模式下，将用户的文字输入也作为回答处理
    if (this.data.isAIAssistedMode) {
      this.addMessage('user', userContent);
      this.setData({ userInput: '' });
      
      // 显示AI正在输入
      this.setData({ isAITyping: true });
      this.scrollToBottom();
      
      // 延迟处理下一步
      setTimeout(() => {
        this.processNextStage(userContent);
      }, 1000);
    } else {
      // 非AI模式下保持原有逻辑
      this.addMessage('user', userContent);
      this.setData({ userInput: '' });
      this.addMessage('ai', 'AI思考中...');
      this.scrollToBottom();
      this.getAIReply(userContent);
    }
  },

  getAIReply(userContent){
    // 在非AI辅助模式下才使用此方法
    if (!this.data.isAIAssistedMode) {
      setTimeout(async () => {
        const aiReply = await this.callAIModel(userContent);
        const updatedMessages = [
          ...this.data.messages.slice(0, -1),
          { speaker: 'ai', content: aiReply }
        ];
        this.setData({ messages: updatedMessages });
        this.scrollToBottom();
      }, 800);
    }
  },

  scrollToBottom() {
    // 计算 scroll-top 为一个足够大的数
    this.setData({ scrollTop: 999999 });
  },

  async selectOption(e) {
    const selectedOption = e.currentTarget.dataset.option || e.currentTarget.textContent;
    console.log('[DEBUG] selectOption:', selectedOption);
    
    // 添加用户选择到消息列表
    this.addMessage('user', selectedOption);
    this.scrollToBottom();
    
    // 显示AI正在输入
    this.setData({ isAITyping: true });
    this.scrollToBottom();
    
    // 延迟一下再显示AI回复，模拟思考过程
    setTimeout(() => {
      this.processNextStage(selectedOption);
    }, 1000);
  },

  processNextStage(userAnswer) {
    const currentIndex = this.data.currentStageIndex;
    const nextIndex = currentIndex + 1;
    
    // 将当前AI消息标记为已回答（清空选项并记录选择）
    const lastAiMessage = this.data.messages[this.data.messages.length - 1];
    if (lastAiMessage && lastAiMessage.speaker === 'ai') {
      lastAiMessage.content += `\n\n✅ 您的选择：${userAnswer}`;
      lastAiMessage.options = []; // 清空选项，防止重复点击
    }
    
    if (nextIndex < this.data.aiStageList.length) {
      // 还有下一阶段，继续提问
      const nextStage = this.data.aiStageList[nextIndex];
      const stageMessages = [
        `感谢您的回答！接下来是第${nextIndex + 1}个问题：`,
        nextStage.detail
      ];
      
      const newAiMessage = {
        speaker: 'ai',
        content: stageMessages.join('\n\n'),
        options: nextStage.options
      };
      
      this.setData({ 
        currentStageIndex: nextIndex,
        currentTaskSummary: nextStage.summary,
        currentTaskDetail: nextStage.detail,
        isAITyping: false
      });
      
      this.addMessage('ai', newAiMessage.content, newAiMessage.options);
      
    } else {
      // 所有阶段完成，生成分诊建议
      this.generateTriageAdvice(userAnswer);
    }
    
    this.scrollToBottom();
  },

  generateTriageAdvice(lastAnswer) {
    // 添加最后的用户回答记录并清空选项
    const lastAiMessage = this.data.messages[this.data.messages.length - 1];
    if (lastAiMessage && lastAiMessage.speaker === 'ai') {
      lastAiMessage.content += `\n\n✅ 您的选择：${lastAnswer}`;
      lastAiMessage.options = []; // 清空选项，防止重复点击
    }
    
    const triageAdvice = `🏥 **分诊建议**\n\n根据您提供的信息，我的初步分析如下：\n\n1. **症状评估**：您描述的症状需要进一步专业评估\n2. **建议级别**：建议尽快就医咨询\n3. **推荐科室**：根据具体症状可选择内科或相应专科\n4. **注意事项**：\n   - 如症状加重请立即就医\n   - 保持良好的休息和饮食习惯\n   - 避免自行用药掩盖症状\n\n⚠️ **重要提醒**：此建议仅供参考，不能替代专业医生的诊断。如有紧急情况，请立即前往急诊科就诊。`;
    
    this.setData({ 
      currentStageIndex: this.data.aiStageList.length,
      currentTaskSummary: '问诊完成 - 分诊建议已生成',
      currentTaskDetail: 'AI已完成症状采集和分析，请查看分诊建议',
      isAITyping: false
    });
    
    this.addMessage('ai', triageAdvice, []);
    
    wx.showToast({ 
      title: '问诊完成！', 
      icon: 'success',
      duration: 2000 
    });
  },



  onInputChange(e) {
    console.log('[DEBUG] onInputChange:', e.detail.value);
    this.setData({ userInput: e.detail.value });
  },

  deleteChatHistory()
  {
    this.setData({messages:[]});
  },

  startSession(){
    



  },

  consultSession(){

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
      // 如果有保存的消息，说明之前在进行AI问诊
      this.setData({ isAIAssistedMode: true });
    } else {
      // 初始状态不自动开始任务，等待用户点击+
      this.setData({ 
        isAIAssistedMode: false,
        currentTaskSummary: '',
        currentTaskDetail: '',
        messages: []
      });
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

  // ========== 功能跳转接口（预留） ==========

addMessage(_speaker,_content,_options=[]){
  const newMsg={speaker:_speaker,content:_content,options:_options}
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
   wx.navigateTo({ url: '/pages/appointment/appointment' });
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