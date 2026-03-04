import * as nav from "../../utils/navigation.js";

Page({
  data: {
    mode: "chat",
    showTaskDetail: false,
    stageSummary: "",
    taskDetail: "",
    taskName: "",
    userInput: "",
    stageIndex: 0,
    taskIndex: 0,
    isAITyping: false,
    guideStages: [],
    aiMessageToSend: {},
    messages: [],
    dialogueRecord: [],
    scrollTop: 0,
    currentUserMessage: "",
    totalTaskCount: 0,
    completedTaskCount: 0,
    showFunctionalBar: false,
  },

  // ========== 初始化 AI 阶段任务 ==========

  initAISTageList() {
    this.setData({
      guideStages: [
        {
          stageIndex: 0,
          stageName: "智能问诊",
          icon: "🩺",
          description: "通过多轮对话收集您的症状信息",
          tasks: [
            {
              taskIndex: 0,
              taskName: "主诉采集",
              detail:
                "请您详细描述主要症状，如疼痛部位、持续时间、严重程度等。",
              options: ["头痛发热", "胸闷气促", "腹痛腹泻", "皮疹瘙痒"],
              navigations: null,
              taskFun: null,
            },

            {
              taskIndex: 1,
              taskName: "既往病史询问",
              detail: "请告知是否有慢性疾病、过敏史、近期用药情况等。",
              options: ["高血压", "糖尿病", "药物过敏", "无特殊病史"],
              navigations: null,
              taskFun: null,
            },
            {
              taskIndex: 2,
              taskName: "生活习惯与旅行史",
              detail: "请提供您的生活习惯、近期旅行史等信息。",
              options: ["近期有长途旅行", "作息规律", "饮食偏油腻", "常熬夜"],
              navigations: null,
              taskFun: null,
            },
            {
              taskIndex: 3,
              taskName: "分诊建议生成",
              detail: "需要我为您提供挂号服务吗？",
              options: ["需要", "不需要"],
              navigations: null,
              taskFun: this.generateTriageAdvice.bind(this),
            },
          ],
        },
        {
          stageIndex: 1,
          stageName: "挂号建议",
          icon: "📊",
          description: "前往挂号页面完成挂号",
          tasks: [
            {
              taskIndex: 0,
              taskName: "挂号建议生成",
              detail: "AI 正在分析您的资料，稍后将给出分诊建议。",
              options: [],
              navigations: [
                {
                  name: "挂号建议",
                  url: "/pages/appointment/appointment",
                },
                {
                  name: "报告",
                  url: "/pages/report/report",
                },
              ],
              taskFun: this.generateAppointmentAdvice.bind(this),
            },
          ],
        },
        {
          stageIndex: 2,
          stageName: "科室导航",
          icon: "🗺️",
          description: "引导您前往相应科室",
          tasks: [
            {
              taskIndex: 0,
              taskName: "根据室内导航界面到达相应科室",
              detail: "请根据室内导航界面到达相应科室",
              options: ["是", "否"],
              navigations: [
                {
                  name: "室内导航",
                  url: "/pages/navigation/navigation",
                },
              ],
              taskFun: null,
            },
          ],
        },
        {
          stageIndex: 3,
          stageName: "等待候诊",
          icon: "⏰",
          description: "耐心等待候诊与接收医生诊断",
          tasks: [
            {
              taskIndex: 0,
              taskName: "等待候诊",
              detail: "请耐心等待候诊与接收医生诊断。",
              options: ["候诊完成"],
              navigations: null,
              taskFun: null,
            },
          ],
        },
        {
          stageIndex: 4,
          stageName: "前往药学门诊",
          icon: "💊",
          description: "前往药学门诊取药或咨询",
          tasks: [
            {
              taskIndex: 0,
              taskName: "前往药学门诊",
              detail: "如需取药或咨询，请前往药学门诊",
              options: [],
              navigations: [
                {
                  name: "药学门诊导航",
                  url: "/pages/pharmacy/pharmacy",
                },
              ],
              taskFun: this.endGuideMode.bind(this),
            },
          ],
        },
      ],
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
    const stage = this.data.guideStages[bigStageIdx];
    const task = stage ? stage.tasks[subTaskIdx] : null;
    if (!task) {
      console.error("任务不存在:", bigStageIdx, subTaskIdx);
      return;
    }
    const record = {
      bigStageIndex: bigStageIdx,
      subTaskIndex: subTaskIdx,
      bigStageName: stage ? stage.stageName : "",
      subTaskName: task ? task.taskName : "",
      question: task ? task.detail : "",
      answer: answer,
    };
    const exists = this.data.dialogueRecord.some(
      (r) =>
        r.bigStageIndex === record.bigStageIndex &&
        r.subTaskIndex === record.subTaskIndex,
    );
    if (!exists) {
      this.setData({
        dialogueRecord: [...this.data.dialogueRecord, record],
      });
      console.log("[DEBUG] 记录对话答案:", record);
    }
  },

  startNewTask() {
    if (!this.data.guideStages || this.data.guideStages.length === 0) {
      console.error("[ERROR] guideStages 未初始化或为空");
      wx.showToast({ title: "系统初始化失败，请重试", icon: "none" });
      return;
    }
    const firstStage = this.data.guideStages[0];
    if (!firstStage || !firstStage.tasks || firstStage.tasks.length === 0) {
      console.error("[ERROR] 第一个阶段或任务未定义", firstStage);
      wx.showToast({ title: "任务数据异常，请重试", icon: "none" });
      return;
    }
    const firstTask = firstStage.tasks[0];
    this.setData({
      stageSummary: `阶段 1/${this.data.guideStages.length}：${firstStage.stageName}`,
      taskDetail: firstTask.detail,
      taskName: firstTask.taskName,
      showTaskDetail: true,
      stageIndex: 0,
      taskIndex: 0,
      messages: [],
    });
    this.addSystemMessage("导诊模式已开启");
    this.calculateTotalTasks();
    this.calculateCompletedTasks();
    this.setData({
      messages: [
        ...this.data.messages,
        {
          speaker: "ai",
          content:
            `您好！我是AI健康助手，${firstStage.description}\n\n` +
            firstTask.detail,
          options: firstTask.options,
        },
      ],
    });
    this.scrollToBottom();
    this.setData({ mode: "guide" });
    wx.setStorageSync("aiDialogue_mode", "guide");
  },

  startOrDeleteNewTask() {
    if (this.data.mode !== "guide") {
      this.startNewTask();
    } else {
      wx.showModal({
        title: "确认退出",
        content: "确定要退出AI导诊模式吗？当前的问诊进度将会丢失。",
        confirmText: "确定退出",
        cancelText: "继续问诊",
        success: async (res) => {
          if (res.confirm) {
            console.log("用户确认退出AI导诊模式");
            this.exitGuideMode();
          } else {
            console.log("用户取消退出");
          }
        },
      });
    }
  },

  exitGuideMode() {
    this.addSystemMessage("导诊模式已关闭");
    this.setData({
      mode: "chat",
      stageSummary: "",
      taskDetail: "",
      showTaskDetail: false,
      stageIndex: 0,
      taskIndex: 0,
    });
    wx.setStorageSync("aiDialogue_mode", "chat");
    wx.showToast({ title: "已退出AI导诊", icon: "success" });
  },

  sendMessage() {
    if (!this.data.userInput || !this.data.userInput.trim()) {
      return;
    }
    const userContent = this.data.userInput.trim();
    this.addMessage("user", userContent);
    this.setData({
      userInput: "",
      currentUserMessage: userContent,
    });
    this.processUserMessage(userContent);
  },

  processUserMessage() {
    if (this.data.mode === "guide") {
      this.handleGuideModeMessage();
    } else {
      this.handleChatModeMessage(userContent);
    }
  },

  handleGuideModeMessage() {
    this.recordDialogueAnswer(
      this.data.currentUserMessage,
      this.data.stageIndex,
      this.data.taskIndex,
    );

    this.setData({ isAITyping: true });
    this.scrollToBottom();
    setTimeout(() => {
      this.updateTaskDisplay();
      this.handleSubTaskCompleted();

      this.continueToNextTask();
    }, 1000);
  },

  updateTaskDisplay() {
    const currentStage = this.data.guideStages[this.data.stageIndex];
    if (!currentStage) {
      return;
    }
    const task = currentStage.tasks[this.data.taskIndex];
    if (task) {
      this.setData({
        stageSummary: `阶段 ${this.data.stageIndex + 1}/${this.data.guideStages.length}：${currentStage.stageName}`,
        taskDetail: task.detail,
        taskName: task.taskName,
      });
      this.calculateCompletedTasks();
    }
    this.scrollToBottom();
  },

  calculateTotalTasks() {
    let total = 0;
    this.data.guideStages.forEach((stage) => {
      total += stage.tasks.length;
    });
    this.setData({ totalTaskCount: total });
  },

  calculateCompletedTasks() {
    let completed = 0;
    for (let i = 0; i < this.data.stageIndex; i++) {
      completed += this.data.guideStages[i].tasks.length;
    }
    completed += this.data.taskIndex + 1;
    this.setData({ completedTaskCount: completed });
  },

  handleChatModeMessage() {
    this.addMessage("ai", "AI思考中...");
    this.scrollToBottom();
    this.getAIReply(userMessage);
  },

  handleSubTaskCompleted() {
    const currentStage = this.data.guideStages[this.data.stageIndex];
    const task = currentStage ? currentStage.tasks[this.data.taskIndex] : null;
    if (!task) {
      console.error("任务不存在:", this.data.stageIndex, this.data.taskIndex);
      return;
    }

    const aiMessageToSend = {
      speaker: "ai",
      content: task.detail,
      options: task.options,
      navigations: task.navigations,
    };

    const taskFun = task.taskFun;
    if (taskFun && typeof taskFun === "function") {
      console.log(`[DEBUG] 调用子任务 lambda 函数`);
      taskFun.call(this);
    } else {
      console.log(`[DEBUG] 子任务未指定 taskFun，继续下一个`);
    }

    this.addAIMessage(aiMessageToSend);
    this.scrollToBottom();
  },

  continueToNextTask() {
    const currentStage = this.data.guideStages[this.data.stageIndex];
    const nextTaskIdx = this.data.taskIndex + 1;
    //当前阶段的任务未完成
    if (nextTaskIdx < currentStage.tasks.length) {
      this.setData({
        taskIndex: nextTaskIdx,
        isAITyping: false,
      });
    }
    //进入下一个阶段
    else {
      const nextStageIdx = this.data.stageIndex + 1;
      if (nextStageIdx < this.data.guideStages.length) {
        this.setData({
          stageIndex: nextStageIdx,
          taskIndex: 0,
          isAITyping: false,
        });
      }
    }
  },

  // ========== AI 调用与建议生成 ==========

  getAIReply() {
    setTimeout(async () => {
      const aiReply = await this.callAIModel(this.data.currentUserMessage);
      const messages = this.data.messages;
      if (
        messages.length > 0 &&
        messages[messages.length - 1].speaker === "ai"
      ) {
        messages[messages.length - 1] = { speaker: "ai", content: aiReply };
        this.setData({ messages });
      }
      this.scrollToBottom();
    }, 800);
  },
  async callAIModel(userMessage) {
    try {
      const params = {
        name: "callAI",
        data: {
          type: "chat",
          messages: [{ role: "user", content: userMessage }],
        },
      };
      const result = await wx.cloud.callFunction(params);
      if (result.result.success) {
        return result.result.reply;
      } else {
        wx.showToast({ title: "AI服务暂不可用", icon: "none" });
        return "抱歉，AI服务暂时无法使用，请稍后再试。";
      }
    } catch (err) {
      wx.showToast({ title: "网络错误", icon: "none" });
      return "网络连接失败，请检查网络后重试。";
    }
  },

  async generateTriageAdvice() {
    this.setData({
      isAITyping: true,
    });
    this.addAIMessage({
      speaker: "ai",
      content: "🤔 AI 正在综合分析您的症状，请稍候...",
      options: [],
      navigations: [],
    });

    try {
      const result = await wx.cloud.callFunction({
        name: "callAI",
        data: {
          type: "triage",
          dialogueRecord: this.data.dialogueRecord,
        },
      });
      if (result.result.success) {
        this.setData({
          stageSummary: "问诊完成 - 分诊建议已生成",
          taskDetail: "AI已完成症状采集和分析",
          isAITyping: false,
        });
        this.replaceLastAIMessage({
          speaker: "ai",
          content: `🏥 **分诊建议**\n\n${result.result.advice}`,
          options: [],
          navigations: [],
        });
        //wx.showToast({ title: '问诊完成！', icon: 'success', duration: 2000 });
      } else {
        throw new Error(result.result.error || "AI调用失败");
      }
    } catch (err) {
      this.setData({
        isAITyping: false,
      });
      this.replaceLastAIMessage({
        speaker: "ai",
        content: `🏥 **分诊建议**\n\n根据您提供的信息，我的初步分析如下：\n\n1. **症状评估**：您描述的症状需要进一步专业评估\n2. **建议级别**：建议尽快就医咨询\n3. **推荐科室**：根据具体症状可选择内科或相应专科\n4. **注意事项**：\n   - 如症状加重请立即就医\n   - 保持良好的休息和饮食习惯\n   - 避免自行用药掩盖症状\n\n⚠️ **重要提醒**：此建议仅供参考，不能替代专业医生的诊断。如有紧急情况，请立即前往急诊科就诊。\n\n（注：AI服务暂不可用，以上为预设建议）`,
        options: [],
        navigations: [],
      });
      wx.showToast({
        title: "AI服务暂不可用，已使用预设建议",
        icon: "none",
        duration: 3000,
      });
    }
    this.scrollToBottom();
  },

  generateAppointmentAdvice() {
    this.addAIMessage({
      speaker: "ai",
      content: "🤔 AI 正在为您推荐挂号科室，请稍候...",
      options: [],
      navigations: [],
    });
    setTimeout(() => {
      this.setData({
        stageSummary: "挂号建议已生成",
        taskDetail: "已推荐挂号科室",
        isAITyping: false,
      });
      this.replaceLastAIMessage({
        speaker: "ai",
        content: `📋 **挂号建议**\n\n根据您的症状，建议您挂：\n\n• 科室：内科\n• 医生：普通号\n• 预计等待时间：15-30分钟\n\n如需预约，请点击下方的"挂号服务"按钮。`,
        options: [],
        navigations: [],
      });
      wx.showToast({
        title: "挂号建议已生成",
        icon: "success",
        duration: 2000,
      });
      this.scrollToBottom();
    }, 2000);
  },

  endGuideMode() {
    this.setData({
      stageSummary: "导诊完成",
      taskDetail: "感谢您的使用",
      isAITyping: true,
    });
    this.addAIMessage({
      speaker: "ai",
      content: "🤔 AI 正在生成结束语...",
      options: [],
      navigations: [],
    });
    setTimeout(() => {
      this.setData({
        isAITyping: false,
      });
      this.replaceLastAIMessage({
        speaker: "ai",
        content: `🎉 **导诊流程已完成**\n\n感谢您完成本次智能导诊！\n\n✨ 祝您身体早日康复！\n\n如果后续有任何健康问题，欢迎随时咨询。祝您生活愉快！`,
        options: [],
        navigations: [],
      });
      wx.showToast({ title: "导诊完成！", icon: "success", duration: 3000 });
      this.scrollToBottom();
      // 自动退出导诊模式
      setTimeout(() => {
        this.exitGuideMode();
      }, 2000);
    }, 1500);
  },

  // ========== UI 交互与事件处理 ==========

  addMessage(_speaker, _content, _options = [], _navigations = []) {
    const newMsg = {
      speaker: _speaker,
      content: _content,
      options: _options,
      navigations: _navigations,
    };
    this.setData({
      messages: [...this.data.messages, newMsg],
    });
  },

  addSystemMessage(_content) {
    const newMsg = {
      speaker: "system",
      content: _content,
      options: [],
      navigations: [],
    };
    this.setData({
      messages: [...this.data.messages, newMsg],
    });
  },

  addAIMessage(_message) {
    this.addMessage(
      "ai",
      _message.content,
      _message.options,
      _message.navigations,
    );
  },

  replaceLastAIMessage(_message) {
    const messages = [...this.data.messages];
    if (messages.length > 0 && messages[messages.length - 1].speaker === "ai") {
      messages[messages.length - 1] = {
        speaker: "ai",
        content: _message.content,
        options: _message.options,
        navigations: _message.navigations,
      };
      this.setData({ messages });
    } else {
      this.addAIMessage(_message);
    }
  },
  scrollToBottom() {
    this.setData({ scrollTop: 999999 });
  },

  async selectOption(e) {
    const selectedOption =
      e.detail.option ||
      e.currentTarget.dataset.option ||
      e.currentTarget.textContent;
    this.setData({ userInput: selectedOption });
    this.sendMessage();
  },

  onInputChange(e) {
    this.setData({ userInput: e.detail.value });
  },

  navigateTo(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.navigateTo({ url });
    }
  },

  toggleTaskDescription() {
    this.setData({ showTaskDetail: !this.data.showTaskDetail });
  },

  // ========== 生命周期函数 ==========

  onLoad(_options) {
    this.initAISTageList();
    const savedMessages = wx.getStorageSync("aiDialogue_messages") || [];
    const savedMode = wx.getStorageSync("aiDialogue_mode") || "chat";

    if (savedMessages.length > 0 && savedMode === "guide") {
      this.setData({ messages: savedMessages, mode: "guide" });
      this.calculateTotalTasks();
      this.calculateCompletedTasks();
      this.scrollToBottom();
    } else {
      this.setData({
        mode: "chat",
        stageSummary: "",
        taskDetail: "",
        stageIndex: 0,
        taskIndex: 0,
        messages: savedMessages.length > 0 ? savedMessages : [],
      });
    }
  },

  onShow() {
    console.log("[DEBUG] onShow");
    // 如果消息为空，添加欢迎消息
    if (!this.data.messages || this.data.messages.length === 0) {
      this.addMessage(
        "ai",
        '我是"医伴"小助手，可以向我咨询有关医疗或医院相关问题，点击右下角按钮可进入智能导诊模式',
        ["医院科室介绍", "挂号流程说明", "医院导航"],
      );
    }
  },

  onReady() {},

  onHide() {
    try {
      wx.setStorageSync("aiDialogue_messages", this.data.messages);
    } catch (e) {
      console.error("保存对话失败", e);
    }
  },

  onUnload() {
    try {
      wx.setStorageSync("aiDialogue_messages", this.data.messages);
    } catch (e) {
      console.error("保存对话失败", e);
    }
  },

  // ========== 页面跳转 ==========
  gotoHistory: nav.gotoHistory,
  gotoVoiceInput: nav.gotoVoiceInput,
  gotoReport: nav.gotoReport,
  gotoAIExplanation: nav.gotoAIExplanation,

  // ========== 预留接口 ==========
  toggleFunctionalBar() {
    this.setData({
      showFunctionalBar: !this.data.showFunctionalBar,
    });
  },

  deleteChatHistory() {
    wx.showModal({
      title: "清空聊天记录",
      content: "确定要清空所有聊天记录吗？",
      confirmText: "确定",
      cancelText: "取消",
      success: (res) => {
        if (res.confirm) {
          this.setData({ messages: [] });
          wx.showToast({ title: "已清空聊天记录", icon: "success" });
        }
      },
    });
  },

  onSubTaskCompleted(userAnswer, bigStageIdx, subTaskIdx) {
    console.log("[DEBUG] onSubTaskCompleted 被调用", {
      userAnswer,
      bigStageIdx,
      subTaskIdx,
    });
  },
});
