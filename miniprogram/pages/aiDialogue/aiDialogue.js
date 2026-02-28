import * as nav from '../../utils/navigation.js';

Page({
  data: {
    isGuideMode: false,
    showTaskDetail: false,
    currentTaskSummary: '',
    currentTaskDetail: '',
    userInput: '',
    currentBigStageIndex: 0,
    currentSubTaskIndex: 0,
    isAITyping: false,
    aiStageList: [],
    messages: [],
    dialogueRecord: [],
    scrollTop: 0,
    // 全局变量：当前阶段ID
    currentBigStageId: 0,
    currentSubTaskId: 0,
    // 全局变量：最近一次用户发送内容
    currentUserMessage: '',
  },

  // ========== 初始化 AI 阶段任务 ==========

  initAISTageList() {
    this.setData({
      aiStageList: [
        {
          bigStageId: 1,
          bigStageName: '智能问诊',
          icon: '🩺',
          description: '通过多轮对话收集您的症状信息',
          subTasks: [
            {
              subTaskId: 1,
              subTaskName: '主诉采集',
              detail: '请您详细描述主要症状，如疼痛部位、持续时间、严重程度等。',
              options: ['头痛发热', '胸闷气促', '腹痛腹泻', '皮疹瘙痒'],
              taskFun:this.continueToNextStage
              },
            
            {
              subTaskId: 2,
              subTaskName: '既往病史询问',
              detail: '请告知是否有慢性疾病、过敏史、近期用药情况等。',
              options: ['高血压', '糖尿病', '药物过敏', '无特殊病史'],
              taskFun: this.continueToNextStage
            },
            {
              subTaskId: 3,
              subTaskName: '生活习惯与旅行史',
              detail: '请提供您的生活习惯、近期旅行史等信息。',
              options: ['近期有长途旅行', '作息规律', '饮食偏油腻', '常熬夜'],
              taskFun: this.continueToNextStage
            },
            {
              subTaskId: 4,
              subTaskName: '分诊建议生成',
              detail: 'AI 正在分析您的资料，稍后将给出分诊建议。',
              options: [],
              taskFun: this.generateTriageAdvice
            }
          ]
        },
        {
          bigStageId: 2,
          bigStageName: '挂号建议',
          icon: '📊',
          description: '对您的健康状况进行综合评估',
          subTasks: [
            {
              subTaskId: 1,
              subTaskName: '分诊建议生成',
              detail: 'AI 正在分析您的资料，稍后将给出分诊建议。',
              options: [],
              taskFun: generateAppointmentAdvice
              
            }
          ]
        }
      ]
    });
  },

  // ========== 核心流程控制 ==========

  /**
   * 记录对话答案
   * @param {string} answer - 用户回答
   * @param {number} bigStageIdx - 大阶段索引
   * @param {number} subTaskIdx - 子任务索引
   */
  recordDialogueAnswer(answer, bigStageIdx, subTaskIdx) {
    const bigStage = this.data.aiStageList[bigStageIdx];
    const subTask = bigStage ? bigStage.subTasks[subTaskIdx] : null;
    if (!subTask) {
      console.error('子任务不存在:', bigStageIdx, subTaskIdx);
      return;
    }
    const record = {
      bigStageId: subTask.bigStageId,
      subTaskId: subTask.subTaskId,
      bigStageName: bigStage ? bigStage.bigStageName : '',
      subTaskName: subTask ? subTask.subTaskName : '',
      question: subTask ? subTask.detail : '',
      answer: answer
    };
    const exists = this.data.dialogueRecord.some(
      r => r.bigStageId === record.bigStageId && r.subTaskId === record.subTaskId
    );
    if (!exists) {
      this.setData({
        dialogueRecord: [...this.data.dialogueRecord, record]
      });
      console.log('[DEBUG] 记录对话答案:', record);
    }
  },

  startNewTask() {
    const firstBigStage = this.data.aiStageList[0];
    const firstSubTask = firstBigStage.subTasks[0];
    this.setData({
      currentBigStageId: firstBigStage.bigStageId,
      currentSubTaskId: firstSubTask.subTaskId,
      currentTaskSummary: `${firstBigStage.bigStageName} - ${firstSubTask.subTaskName}`,
      currentTaskDetail: firstSubTask.detail,
      showTaskDetail: true,
      currentBigStageIndex: 0,
      currentSubTaskIndex: 0,
      messages: [{
        speaker: 'ai',
        content: `您好！我是AI健康助手，${firstBigStage.description}\n\n` + firstSubTask.detail,
        options: firstSubTask.options
      }]
    });
    this.scrollToBottom();
    this.setData({ isGuideMode: true });
  },

  startOrDeleteNewTask() {
    if (!this.data.isGuideMode) {
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
              isGuideMode: false,
              currentBigStageId: 0,
              currentSubTaskId: 0,
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

  sendMessage() {
    if (!this.data.userInput || !this.data.userInput.trim()) {
      return;
    }
    const userContent = this.data.userInput.trim();
    this.addMessage('user', userContent);
    this.setData({
      userInput: '',
      currentUserMessage: userContent
    });
    this.processUserMessage(userContent);
  },

  processUserMessage() {
    if (this.data.isGuideMode) {
      this.handleGuideModeMessage();
    } else {
      this.handleChatModeMessage();
    }
  },

  handleGuideModeMessage() {
    const bigStageIdx = this.data.currentBigStageIndex;
    const subTaskIdx = this.data.currentSubTaskIndex;
    this.recordDialogueAnswer(this.data.currentUserMessage, bigStageIdx, subTaskIdx);
    this.setData({ isAITyping: true });
    this.scrollToBottom();
    setTimeout(() => {
      this.handleSubTaskCompleted();
    }, 1000);
  },

  handleChatModeMessage() {
    this.addMessage('ai', 'AI思考中...');
    this.scrollToBottom();
    this.getAIReply();
  },

  handleSubTaskCompleted() {
    const markCurrentMessageAnswered = (answer) => {
      const lastAiMessage = this.data.messages[this.data.messages.length - 1];
      if (lastAiMessage && lastAiMessage.speaker === 'ai') {
        lastAiMessage.content += `\n\n✅ 您的选择：${answer}`;
        lastAiMessage.options = [];
      }
    };

    const bigStageIdx = this.data.currentBigStageIndex;
    const subTaskIdx = this.data.currentSubTaskIndex;
    const currentBigStage = this.data.aiStageList[bigStageIdx];
    const subTask = currentBigStage ? currentBigStage.subTasks[subTaskIdx] : null;
    if (!subTask) {
      console.error('子任务不存在:', bigStageIdx, subTaskIdx);
      return;
    }
    markCurrentMessageAnswered(this.data.currentUserMessage);
    const taskFun = subTask.taskFun;
    if (taskFun && typeof taskFun === 'function') {
      console.log(`[DEBUG] 调用子任务 lambda 函数`);
      taskFun();
    } else if (taskFun) {
      console.error(`[ERROR] taskFun 不是函数类型`);
      this.continueToNextStage();
    } else {
      console.log(`[DEBUG] 子任务未指定 taskFun，继续下一个`);
      this.continueToNextStage();
    }
  },

  continueToNextStage() {
    const bigStageIdx = this.data.currentBigStageIndex;
    const subTaskIdx = this.data.currentSubTaskIndex;
    const currentBigStage = this.data.aiStageList[bigStageIdx];
    const nextSubTaskIdx = subTaskIdx + 1;
    if (nextSubTaskIdx < currentBigStage.subTasks.length) {
      const nextSubTask = currentBigStage.subTasks[nextSubTaskIdx];
      const stageMessages = [
        `感谢您的回答！接下来是${currentBigStage.bigStageName}的第${nextSubTaskIdx + 1}个问题：`,
        nextSubTask.detail
      ];
      const newAiMessage = {
        speaker: 'ai',
        content: stageMessages.join('\n\n'),
        options: nextSubTask.options
      };
      this.setData({
        currentBigStageId: nextSubTask.bigStageId,
        currentSubTaskId: nextSubTask.subTaskId,
        currentSubTaskIndex: nextSubTaskIdx,
        currentTaskSummary: `${currentBigStage.bigStageName} - ${nextSubTask.subTaskName}`,
        currentTaskDetail: nextSubTask.detail,
        isAITyping: false
      });
      this.addMessage('ai', newAiMessage.content, newAiMessage.options);
    } else {
      const nextBigStageIdx = bigStageIdx + 1;
      if (nextBigStageIdx < this.data.aiStageList.length) {
        const nextBigStage = this.data.aiStageList[nextBigStageIdx];
        const firstSubTask = nextBigStage.subTasks[0];
        this.setData({
          currentBigStageId: firstSubTask.bigStageId,
          currentSubTaskId: firstSubTask.subTaskId,
          currentBigStageIndex: nextBigStageIdx,
          currentSubTaskIndex: 0,
          currentTaskSummary: `${nextBigStage.bigStageName} - ${firstSubTask.subTaskName}`,
          currentTaskDetail: firstSubTask.detail,
          isAITyping: false
        });
        this.addMessage('ai', `${nextBigStage.description}\n\n${firstSubTask.detail}`, firstSubTask.options);
      } else {
        this.generateTriageAdvice();
      }
    }
    this.scrollToBottom();
  },

  // ========== AI 调用与建议生成 ==========

 

  getAIReply() {
    if (!this.data.isGuideMode) {
      setTimeout(async () => {
        const aiReply = await this.callAIModel(this.data.currentUserMessage);
        const updatedMessages = [...this.data.messages.slice(0, -1), { speaker: 'ai', content: aiReply }];
        this.setData({ messages: updatedMessages });
        this.scrollToBottom();
      }, 800);
    }

    
  },
 async callAIModel(userMessage) {
    try {
      const params = {
        name: 'callAI',
        data: {
          type: 'chat',
          messages: [{ role: 'user', content: userMessage }]
        }
      };
      const result = await wx.cloud.callFunction(params);
      if (result.result.success) {
        return result.result.reply;
      } else {
        wx.showToast({ title: 'AI服务暂不可用', icon: 'none' });
        return '抱歉，AI服务暂时无法使用，请稍后再试。';
      }
    } catch (err) {
      wx.showToast({ title: '网络错误', icon: 'none' });
      return '网络连接失败，请检查网络后重试。';
    }
  },

  async generateTriageAdvice() {
    const bigStageIdx = this.data.currentBigStageIndex;
    const subTaskIdx = this.data.currentSubTaskIndex;
    const needsRecord = !this.data.dialogueRecord.some(
      r => r.bigStageId === this.data.currentBigStageId && r.subTaskId === this.data.currentSubTaskId
    );
    if (needsRecord) {
      this.recordDialogueAnswer(this.data.currentUserMessage, bigStageIdx, subTaskIdx);
    }
    const updatedDialogueRecord = this.data.dialogueRecord;
    this.setData({
      currentBigStageIndex: this.data.aiStageList.length,
      currentSubTaskIndex: 0,
      currentTaskSummary: '问诊完成 - 正在生成分诊建议...',
      currentTaskDetail: 'AI正在分析您的症状',
      isAITyping: true
    });
    this.addMessage('ai', '🤔 AI 正在综合分析您的症状，请稍候...');
    const firstBigStage = this.data.aiStageList[0];
    const formattedData = this.formatFirstStageForAI(firstBigStage, updatedDialogueRecord);
    try {
      const result = await wx.cloud.callFunction({
        name: 'callAI',
        data: {
          type: 'triage',
          dialogueRecord: updatedDialogueRecord,
          formattedData: formattedData,
          aiPrompt: formattedData.aiPrompt
        }
      });
      if (result.result.success) {
        const updatedMessages = [...this.data.messages.slice(0, -1)];
        updatedMessages.push({
          speaker: 'ai',
          content: `🏥 **分诊建议**\n\n${result.result.advice}`,
          options: []
        });
        this.setData({
          messages: updatedMessages,
          currentTaskSummary: '问诊完成 - 分诊建议已生成',
          currentTaskDetail: 'AI已完成症状采集和分析',
          isAITyping: false
        });
        wx.showToast({ title: '问诊完成！', icon: 'success', duration: 2000 });
      } else {
        throw new Error(result.result.error || 'AI调用失败');
      }
    } catch (err) {
      const updatedMessages = [...this.data.messages.slice(0, -1)];
      updatedMessages.push({
        speaker: 'ai',
        content: `🏥 **分诊建议**\n\n根据您提供的信息，我的初步分析如下：\n\n1. **症状评估**：您描述的症状需要进一步专业评估\n2. **建议级别**：建议尽快就医咨询\n3. **推荐科室**：根据具体症状可选择内科或相应专科\n4. **注意事项**：\n   - 如症状加重请立即就医\n   - 保持良好的休息和饮食习惯\n   - 避免自行用药掩盖症状\n\n⚠️ **重要提醒**：此建议仅供参考，不能替代专业医生的诊断。如有紧急情况，请立即前往急诊科就诊。\n\n（注：AI服务暂不可用，以上为预设建议）`,
        options: []
      });
      this.setData({
        messages: updatedMessages,
        currentTaskSummary: '问诊完成',
        currentTaskDetail: '（已使用预设建议）',
        isAITyping: false
      });
      wx.showToast({ title: 'AI服务暂不可用，已使用预设建议', icon: 'none', duration: 3000 });
    }
    this.scrollToBottom();
  },

  generateAppointmentAdvice() {
    const bigStageIdx = this.data.currentBigStageIndex;
    const subTaskIdx = this.data.currentSubTaskIndex;
    this.recordDialogueAnswer(this.data.currentUserMessage, bigStageIdx, subTaskIdx);
    this.setData({
      currentBigStageIndex: this.data.aiStageList.length,
      currentSubTaskIndex: 0,
      currentTaskSummary: '生成挂号建议...',
      currentTaskDetail: 'AI正在为您推荐挂号科室',
      isAITyping: true
    });
    this.addMessage('ai', '🤔 AI 正在为您推荐挂号科室，请稍候...');
    setTimeout(() => {
      const updatedMessages = [...this.data.messages.slice(0, -1)];
      updatedMessages.push({
        speaker: 'ai',
        content: `📋 **挂号建议**\n\n根据您的症状，建议您挂：\n\n• 科室：内科\n• 医生：普通号\n• 预计等待时间：15-30分钟\n\n如需预约，请点击下方的"挂号服务"按钮。`,
        options: []
      });
      this.setData({
        messages: updatedMessages,
        currentTaskSummary: '挂号建议已生成',
        currentTaskDetail: '已推荐挂号科室',
        isAITyping: false
      });
      wx.showToast({ title: '挂号建议已生成', icon: 'success', duration: 2000 });
      this.scrollToBottom();
    }, 2000);
  },

  
  // ========== UI 交互与事件处理 ==========

  addMessage(_speaker, _content, _options = []) {
    const newMsg = { speaker: _speaker, content: _content, options: _options };
    this.setData({
      messages: this.data.messages.concat(newMsg)
    });
  },

  scrollToBottom() {
    this.setData({ scrollTop: 999999 });
  },

  async selectOption(e) {
    const selectedOption = e.detail.option || e.currentTarget.dataset.option || e.currentTarget.textContent;
    this.setData({ userInput: selectedOption });
    this.sendMessage();
  },

  onInputChange(e) {
    this.setData({ userInput: e.detail.value });
  },

  toggleTaskDescription() {
    this.setData({ showTaskDetail: !this.data.showTaskDetail });
  },

  // ========== 生命周期函数 ==========

  onLoad(_options) {
    this.initAISTageList();
    const savedMessages = wx.getStorageSync('aiDialogue_messages') || [];
    if (savedMessages.length > 0) {
      this.setData({ messages: savedMessages });
      this.scrollToBottom();
      this.setData({ isGuideMode: true });
    } else {
      this.setData({
        isGuideMode: false,
        currentBigStageId: 0,
        currentSubTaskId: 0,
        currentTaskSummary: '',
        currentTaskDetail: '',
        currentBigStageIndex: 0,
        currentSubTaskIndex: 0,
        messages: []
      });
    }
  },

  onShow() {
    console.log('[DEBUG] onShow');
  },

  onReady() {},

  onHide() {
    try {
      wx.setStorageSync('aiDialogue_messages', this.data.messages);
    } catch (e) {
      console.error('保存对话失败', e);
    }
  },

  onUnload() {
    wx.setStorageSync('aiDialogue_messages', this.data.messages);
  },

  // ========== 页面跳转功能 ==========

  gotoHistory: nav.gotoHistory,
  gotoVoiceInput: nav.gotoVoiceInput,
  gotoReport: nav.gotoReport,
  gotoAIExplanation: nav.gotoAIExplanation,

  // ========== 预留功能接口 ==========

  toggleFunctionalBar() {
    this.setData({
      showFunctionalBar: !this.data.showFunctionalBar
    });
  },

  deleteChatHistory() {
    this.setData({ messages: [] });
  },

  startSession() {},

  consultSession() {},

  onSubTaskCompleted(userAnswer, bigStageIdx, subTaskIdx) {
    console.log('[DEBUG] onSubTaskCompleted 被调用', { userAnswer, bigStageIdx, subTaskIdx });
  }

});
