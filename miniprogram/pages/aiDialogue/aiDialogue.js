import * as nav from '../../utils/navigation.js';

// 初始化云数据库
const db = wx.cloud.database();
const dialogueCollection = db.collection('user_dialogues');

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
            options: ['头痛发热', '胸闷气促', '腹痛腹泻', '皮疹瘙痒']
          },
          {
            subTaskId: 2,
            subTaskName: '既往病史询问',
            detail: '请告知是否有慢性疾病、过敏史、近期用药情况等。',
            options: ['高血压', '糖尿病', '药物过敏', '无特殊病史']
          },
          {
            subTaskId: 3,
            subTaskName: '生活习惯与旅行史',
            detail: '请提供您的生活习惯、近期旅行史等信息。',
            options: ['近期有长途旅行', '作息规律', '饮食偏油腻', '常熬夜']
          },
          {
            subTaskId: 4,
            subTaskName: '分诊建议生成',
            detail: 'AI 正在分析您的资料，稍后将给出分诊建议。',
            options: [],
            taskFun: (userAnswer, bigStageIdx, subTaskIdx, pageContext) => {
              pageContext.generateTriageAdvice(userAnswer, bigStageIdx, subTaskIdx);
            }
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
            taskFun: (userAnswer, bigStageIdx, subTaskIdx, pageContext) => {
              pageContext.generateAppointmentAdvice(userAnswer, bigStageIdx, subTaskIdx);
            }
          }
        ]
      }
    ],
    messages: [],
    dialogueRecord: [],
    scrollTop: 0,
  },

  // ========== 核心流程控制 ==========
  startNewTask() {
    const firstBigStage = this.data.aiStageList[0];
    const firstSubTask = firstBigStage.subTasks[0];
    this.setData({
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
        success: async (res) => {
          if (res.confirm) {
            console.log('用户确认退出AI导诊模式');
            // 退出时保存对话记录到云数据库
            await this.saveDialogueToDatabase();
            
            this.setData({
              isGuideMode: false,
              currentStageIndex: 0,
              messages: [],
              dialogueRecord: []
            });
            wx.showToast({ title: '已退出AI导诊，对话已保存', icon: 'success' });
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
    this.setData({ userInput: '' });
    this.processUserMessage(userContent);
  },

  processUserMessage(userContent) {
    if (this.data.isGuideMode) {
      this.handleGuideModeMessage(userContent);
    } else {
      this.handleChatModeMessage(userContent);
    }
  },

  handleGuideModeMessage(userAnswer) {
    const recordDialogueAnswer = (answer, bigStageIdx, subTaskIdx) => {
      const bigStage = this.data.aiStageList[bigStageIdx];
      const subTask = bigStage ? bigStage.subTasks[subTaskIdx] : null;
      if (!subTask) {
        console.error('子任务不存在:', bigStageIdx, subTaskIdx);
        return;
      }
      const record = {
        bigStageId: bigStageIdx + 1,
        bigStageName: bigStage ? bigStage.bigStageName : '',
        subTaskId: subTaskIdx + 1,
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
    };

    const bigStageIdx = this.data.currentBigStageIndex;
    const subTaskIdx = this.data.currentSubTaskIdx;
    recordDialogueAnswer(userAnswer, bigStageIdx, subTaskIdx);
    this.setData({ isAITyping: true });
    this.scrollToBottom();
    setTimeout(() => {
      this.handleSubTaskCompleted(userAnswer, bigStageIdx, subTaskIdx);
    }, 1000);
  },

  handleChatModeMessage(userMessage) {
    this.addMessage('ai', 'AI思考中...');
    this.scrollToBottom();
    this.getAIReply(userMessage);
  },

  handleSubTaskCompleted(userAnswer, bigStageIdx, subTaskIdx) {
    const markCurrentMessageAnswered = (answer) => {
      const lastAiMessage = this.data.messages[this.data.messages.length - 1];
      if (lastAiMessage && lastAiMessage.speaker === 'ai') {
        lastAiMessage.content += `\n\n✅ 您的选择：${answer}`;
        lastAiMessage.options = [];
      }
    };

    const currentBigStage = this.data.aiStageList[bigStageIdx];
    const subTask = currentBigStage ? currentBigStage.subTasks[subTaskIdx] : null;
    if (!subTask) {
      console.error('子任务不存在:', bigStageIdx, subTaskIdx);
      return;
    }
    markCurrentMessageAnswered(userAnswer);
    const taskFun = subTask.taskFun;
    if (taskFun && typeof taskFun === 'function') {
      console.log(`[DEBUG] 调用子任务 lambda 函数`);
      taskFun(userAnswer, bigStageIdx, subTaskIdx, this);
    } else if (taskFun) {
      console.error(`[ERROR] taskFun 不是函数类型`);
      this.processNextStage(userAnswer, bigStageIdx, subTaskIdx);
    } else {
      console.log(`[DEBUG] 子任务未指定 taskFun，继续下一个`);
      this.processNextStage(userAnswer, bigStageIdx, subTaskIdx);
    }
  },

  processNextStage(userAnswer, bigStageIdx, subTaskIdx) {
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
          currentBigStageIndex: nextBigStageIdx,
          currentSubTaskIndex: 0,
          currentTaskSummary: `${nextBigStage.bigStageName} - ${firstSubTask.subTaskName}`,
          currentTaskDetail: firstSubTask.detail,
          isAITyping: false
        });
        this.addMessage('ai', `${nextBigStage.description}\n\n${firstSubTask.detail}`, firstSubTask.options);
      } else {
        this.generateTriageAdvice(userAnswer);
      }
    }
    this.scrollToBottom();
  },

  // ========== AI 调用与建议生成 ==========
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

  getAIReply(userContent) {
    if (!this.data.isGuideMode) {
      setTimeout(async () => {
        const aiReply = await this.callAIModel(userContent);
        const updatedMessages = [...this.data.messages.slice(0, -1), { speaker: 'ai', content: aiReply }];
        this.setData({ messages: updatedMessages });
        this.scrollToBottom();
      }, 800);
    }
  },

  async generateTriageAdvice(lastAnswer, bigStageIdx, subTaskIdx) {
    const recordDialogueAnswer = (answer, bigStageIdx, subTaskIdx) => {
      const bigStage = this.data.aiStageList[bigStageIdx];
      const subTask = bigStage ? bigStage.subTasks[subTaskIdx] : null;
      if (!subTask) {
        console.error('子任务不存在:', bigStageIdx, subTaskIdx);
        return;
      }
      const record = {
        bigStageId: bigStageIdx + 1,
        bigStageName: bigStage ? bigStage.bigStageName : '',
        subTaskId: subTaskIdx + 1,
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
    };

    const needsRecord = !this.data.dialogueRecord.some(
      r => r.bigStageId === bigStageIdx + 1 && r.subTaskId === subTaskIdx + 1
    );
    if (needsRecord) {
      recordDialogueAnswer(lastAnswer, bigStageIdx, subTaskIdx);
    }
    const updatedDialogueRecord = this.data.dialogueRecord;
    this.setData({
      currentBigStageIndex: this.data.aiStageList.length,
      currentSubTaskIndex: 0,
      currentTaskSummary: '问诊完成 - 正在生成分诊建议...',
      currentTaskDetail: 'AI正在分析您的症状',
      isAITyping: true
    });
    this.addMessage('ai', '🤔 AI 正在综合分析您的症状，请稍候...', []);
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
        
        // 问诊完成后保存到云数据库
        await this.saveDialogueToDatabase();
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
      
      // 即使AI调用失败，也保存到云数据库
      await this.saveDialogueToDatabase();
    }
    this.scrollToBottom();
  },

  generateAppointmentAdvice(userAnswer, bigStageIdx, subTaskIdx) {
    const recordDialogueAnswer = (answer, bigStageIdx, subTaskIdx) => {
      const bigStage = this.data.aiStageList[bigStageIdx];
      const subTask = bigStage ? bigStage.subTasks[subTaskIdx] : null;
      if (!subTask) {
        console.error('子任务不存在:', bigStageIdx, subTaskIdx);
        return;
      }
      const record = {
        bigStageId: bigStageIdx + 1,
        bigStageName: bigStage ? bigStage.bigStageName : '',
        subTaskId: subTaskIdx + 1,
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
    };

    recordDialogueAnswer(userAnswer, bigStageIdx, subTaskIdx);
    this.setData({
      currentBigStageIndex: this.data.aiStageList.length,
      currentSubTaskIndex: 0,
      currentTaskSummary: '生成挂号建议...',
      currentTaskDetail: 'AI正在为您推荐挂号科室',
      isAITyping: true
    });
    this.addMessage('ai', '🤔 AI 正在为您推荐挂号科室，请稍候...', []);
    setTimeout(async () => {
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
      
      // 生成挂号建议后保存到云数据库
      await this.saveDialogueToDatabase();
    }, 2000);
  },

  // ========== 云数据库操作 ==========
  async saveDialogueToDatabase() {
    try {
      // 获取用户openid
      let userInfo = {};
      try {
        const userRes = await wx.cloud.callFunction({
          name: 'getOpenId',
          data: {}
        });
        userInfo.openid = userRes.result.openid;
      } catch (e) {
        console.warn('获取openid失败', e);
        userInfo.openid = 'unknown_' + new Date().getTime();
      }

      // 构建对话记录
      const dialogueData = {
        userId: userInfo.openid,
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
        sessionId: 'session_' + new Date().getTime() + '_' + Math.floor(Math.random() * 1000),
        isCompleted: !this.data.isGuideMode || this.data.currentBigStageIndex >= this.data.aiStageList.length,
        currentStage: this.data.currentTaskSummary,
        fullDialogue: {
          messages: this.data.messages,
          dialogueRecord: this.data.dialogueRecord,
          aiStageList: this.data.aiStageList,
          formattedData: this.formatAllStagesForAI()
        },
        messageCount: this.data.messages.length,
        questionCount: this.data.dialogueRecord.length,
        stageCount: this.data.aiStageList.length,
        symptomSummary: this.formatAllStagesForAI()?.symptomSummary || '',
        medicalHistory: this.formatAllStagesForAI()?.medicalHistory || '',
        timestamp: new Date().toISOString()
      };

      // 保存到云数据库
      const result = await dialogueCollection.add({
        data: dialogueData
      });

      console.log('对话记录保存成功', result);
      return {
        success: true,
        id: result._id,
        data: dialogueData
      };
    } catch (error) {
      console.error('保存对话记录失败', error);
      wx.showToast({
        title: '对话记录保存失败',
        icon: 'none',
        duration: 2000
      });
      return {
        success: false,
        error: error.message
      };
    }
  },

  async loadHistoryDialogues() {
    try {
      wx.showLoading({ title: '加载历史记录...' });

      // 获取用户openid
      let userInfo = {};
      try {
        const userRes = await wx.cloud.callFunction({
          name: 'getOpenId',
          data: {}
        });
        userInfo.openid = userRes.result.openid;
      } catch (e) {
        console.warn('获取openid失败，无法加载个人历史记录', e);
        wx.hideLoading();
        wx.showToast({ title: '无法获取用户信息', icon: 'none' });
        return { success: false, error: '获取用户信息失败' };
      }

      // 查询用户历史记录
      const result = await dialogueCollection
        .where({
          userId: userInfo.openid
        })
        .orderBy('createTime', 'desc')
        .get();

      wx.hideLoading();

      // 无历史记录
      if (result.data.length === 0) {
        console.log('暂无历史对话记录');
        return { success: true, data: [], hasHistory: false };
      }

      // 加载最新记录
      const lastDialogue = result.data[0];
      console.log('加载最后一次对话记录：', lastDialogue);

      // 还原到页面
      this.setData({
        messages: lastDialogue.fullDialogue?.messages || [],
        dialogueRecord: lastDialogue.fullDialogue?.dialogueRecord || [],
        isGuideMode: !lastDialogue.isCompleted,
        currentBigStageIndex: this.getStageIndexByName(lastDialogue.currentStage),
        currentSubTaskIndex: this.getSubTaskIndexByName(lastDialogue.currentStage),
        currentTaskSummary: lastDialogue.currentStage || '',
        currentTaskDetail: lastDialogue.fullDialogue?.formattedData?.symptomSummary || '',
        showTaskDetail: true,
        scrollTop: 999999
      });

      wx.showToast({ 
        title: `加载成功，共${result.data.length}条历史记录`, 
        icon: 'success',
        duration: 2000
      });

      return {
        success: true,
        data: result.data,
        currentDialogue: lastDialogue,
        hasHistory: true
      };

    } catch (error) {
      wx.hideLoading();
      console.error('加载历史记录失败：', error);
      wx.showToast({ 
        title: `加载失败：${error.message || '未知错误'}`, 
        icon: 'none',
        duration: 3000
      });
      return { success: false, error: error.message };
    }
  },

  // 辅助函数：还原阶段索引
  getStageIndexByName(stageName) {
    if (!stageName) return 0;
    const bigStageName = stageName.split(' - ')[0];
    return this.data.aiStageList.findIndex(stage => stage.bigStageName === bigStageName) || 0;
  },

  getSubTaskIndexByName(stageName) {
    if (!stageName) return 0;
    const subTaskName = stageName.split(' - ')[1];
    const bigStageIdx = this.getStageIndexByName(stageName);
    const subTasks = this.data.aiStageList[bigStageIdx]?.subTasks || [];
    return subTasks.findIndex(task => task.subTaskName === subTaskName) || 0;
  },

  // ========== 数据格式化 ==========
  formatFirstStageForAI(bigStage, dialogueRecord) {
    if (!bigStage || !dialogueRecord || dialogueRecord.length === 0) {
      return null;
    }
    const firstStageRecords = dialogueRecord.filter(record => record.bigStageId === bigStage.bigStageId);
    if (firstStageRecords.length === 0) {
      return null;
    }
    const formattedData = {
      stageInfo: {
        bigStageId: bigStage.bigStageId,
        bigStageName: bigStage.bigStageName,
        description: bigStage.description,
        subTaskCount: bigStage.subTasks.length
      },
      qaRecords: firstStageRecords.map(record => ({
        subTaskId: record.subTaskId,
        subTaskName: record.subTaskName,
        question: record.question,
        answer: record.answer
      })),
      symptomSummary: firstStageRecords
        .filter(r => r.subTaskName === '主诉采集')
        .map(r => r.answer)
        .join('，') || '未提供主诉信息',
      medicalHistory: firstStageRecords
        .filter(r => r.subTaskName === '既往病史询问')
        .map(r => r.answer)
        .join('，') || '未提供病史信息',
      lifestyle: firstStageRecords
        .filter(r => r.subTaskName === '生活习惯与旅行史')
        .map(r => r.answer)
        .join('，') || '未提供生活习惯信息',
      fullDescription: `
【大阶段】${bigStage.bigStageName}
【阶段描述】${bigStage.description}

【问答详情】
${firstStageRecords.map((record, index) => `
${index + 1}. ${record.subTaskName}
   问题：${record.question}
   回答：${record.answer}
`).join('\n')}
      `.trim(),
      timestamp: new Date().toISOString(),
      recordCount: firstStageRecords.length
    };
    return formattedData;
  },

  formatAllStagesForAI() {
    const { aiStageList, dialogueRecord } = this.data;
    if (!aiStageList || aiStageList.length === 0 || !dialogueRecord || dialogueRecord.length === 0) {
      return null;
    }
    const formattedStages = aiStageList.map(stage => ({
      stageId: stage.bigStageId,
      stageName: stage.bigStageName,
      records: dialogueRecord
        .filter(r => r.bigStageId === stage.bigStageId)
        .map(r => ({
          subTaskId: r.subTaskId,
          subTaskName: r.subTaskName,
          question: r.question,
          answer: r.answer
        }))
    })).filter(stage => stage.records.length > 0);
    const completeData = {
      summary: {
        totalStages: formattedStages.length,
        totalQuestions: dialogueRecord.length,
        timestamp: new Date().toISOString()
      },
      stages: formattedStages,
      quickSummary: formattedStages.map(stage => ({
        stageName: stage.stageName,
        answerCount: stage.records.length,
        mainAnswers: stage.records.map(r => r.answer).join('，')
      })),
      aiPrompt: `
【患者智能问诊记录】

${formattedStages.map((stage, idx) => `
=== 第${idx + 1}阶段：${stage.stageName} ===
${stage.records.map((r, rIdx) => `
问题${rIdx + 1}（${r.subTaskName}）：${r.question}
患者回答：${r.answer}
`).join('\n')}
`).join('\n')}

---
请根据以上信息提供医疗建议。
      `.trim()
    };
    return completeData;
  },

  // ========== UI 交互 ==========
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
  onLoad(options) {
    if (!wx.cloud) {
      wx.showToast({ title: '请使用微信最新版本体验云开发功能', icon: 'none' });
      return;
    }
  
    // 异步初始化云开发，等待完成后再加载历史记录
    wx.cloud.init({
      env: 'cloud1-9gl1btw18d22e719', 
      traceUser: true,
    }).then(() => {
      // 云初始化完成后再加载历史记录
      this.loadHistoryDialogues();
    }).catch(err => {
      console.error('云初始化失败', err);
      wx.showToast({ title: '云服务初始化失败', icon: 'none' });
    });
  },

  onShow() {
    console.log('[DEBUG] onShow');
  },

  onReady() {},


  onHide() {},

  onUnload() {
    // 仅保存到云数据库
    this.saveDialogueToDatabase().then(res => {
      console.log('页面卸载时保存对话:', res);
    });
  },

  // ========== 页面跳转 ==========
  gotoHistory: nav.gotoHistory,
  gotoVoiceInput: nav.gotoVoiceInput,
  gotoReport: nav.gotoReport,
  gotoAIExplanation: nav.gotoAIExplanation,

  // ========== 预留接口 ==========
  toggleFunctionalBar() {
    this.setData({
      showFunctionalBar: !this.data.showFunctionalBar
    });
  },

  startSession() {},

  consultSession() {},

  onSubTaskCompleted(userAnswer, bigStageIdx, subTaskIdx) {
    console.log('[DEBUG] onSubTaskCompleted 被调用', { userAnswer, bigStageIdx, subTaskIdx });
  }
});
