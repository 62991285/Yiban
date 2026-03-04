import * as nav from "../../utils/navigation.js";

// 常量定义
const STORAGE_KEYS = {
  MESSAGES: "aiDialogue_messages",
  MODE: "aiDialogue_mode",
};

const WELCOME_MESSAGE =
  '我是"医伴"小助手，可以向我咨询有关医疗或医院相关问题，点击右下角按钮可进入智能导诊模式';

const WELCOME_OPTIONS = ["医院科室介绍", "挂号流程说明", "医院导航"];

// 导诊阶段配置 - 从配置文件加载
const GUIDE_STAGES = require("../../config/guideStages.js").guideStages;

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
    messages: [],
    dialogueRecord: [],
    scrollTop: 0,
    currentUserMessage: "",
    totalTaskCount: 0,
    completedTaskCount: 0,
    showFunctionalBar: false,
  },

  // ========== 生命周期函数 ==========

  onLoad() {
    this.initAISTageList();
    this.loadSavedState();
  },

  onShow() {
    if (!this.data.messages?.length) {
      this.addMessage("ai", WELCOME_MESSAGE, WELCOME_OPTIONS);
    }
  },

  onReady() {},

  onHide() {
    this.saveState();
  },

  onUnload() {
    this.saveState();
  },

  // ========== 初始化与状态管理 ==========

  initAISTageList() {
    this.setData({ guideStages: GUIDE_STAGES });
  },

  loadSavedState() {
    try {
      const savedMessages = wx.getStorageSync(STORAGE_KEYS.MESSAGES) || [];
      const savedMode = wx.getStorageSync(STORAGE_KEYS.MODE) || "chat";

      if (savedMessages.length > 0 && savedMode === "guide") {
        this.setData({ messages: savedMessages, mode: "guide" });
        this.calculateTotalTasks();
        this.calculateCompletedTasks();
        this.scrollToBottom();
      } else {
        this.setData({
          mode: "chat",
          messages: savedMessages.length > 0 ? savedMessages : [],
        });
      }
    } catch (error) {
      console.error("加载保存状态失败:", error);
      this.setData({ mode: "chat", messages: [] });
    }
  },

  saveState() {
    try {
      wx.setStorageSync(STORAGE_KEYS.MESSAGES, this.data.messages);
      wx.setStorageSync(STORAGE_KEYS.MODE, this.data.mode);
    } catch (error) {
      console.error("保存状态失败:", error);
    }
  },

  // ========== 核心流程控制 ==========

  startNewTask() {
    const { guideStages } = this.data;

    if (!guideStages?.length) {
      console.error("guideStages 未初始化或为空");
      wx.showToast({ title: "系统初始化失败，请重试", icon: "none" });
      return;
    }

    const firstStage = guideStages[0];
    if (!firstStage?.tasks?.length) {
      console.error("第一个阶段或任务未定义:", firstStage);
      wx.showToast({ title: "任务数据异常，请重试", icon: "none" });
      return;
    }

    const firstTask = firstStage.tasks[0];

    this.setData({
      stageSummary: `阶段 1/${guideStages.length}：${firstStage.stageName}`,
      taskDetail: firstTask.detail,
      taskName: firstTask.taskName,
      showTaskDetail: true,
      stageIndex: 0,
      taskIndex: 0,
      messages: [],
      dialogueRecord: [],
      mode: "guide",
    });

    this.addSystemMessage("导诊模式已开启");
    this.calculateTotalTasks();
    this.calculateCompletedTasks();
    this.addMessage(
      "ai",
      `您好！我是AI健康助手，${firstStage.description}\n\n${firstTask.detail}`,
      firstTask.options,
    );
    this.scrollToBottom();
  },

  startOrDeleteNewTask() {
    if (this.data.mode !== "guide") {
      this.startNewTask();
      return;
    }

    wx.showModal({
      title: "确认退出",
      content: "确定要退出AI导诊模式吗？当前的问诊进度将会丢失。",
      confirmText: "确定退出",
      cancelText: "继续问诊",
      success: (res) => {
        if (res.confirm) {
          this.exitGuideMode();
        }
      },
    });
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
      dialogueRecord: [],
    });
    wx.showToast({ title: "已退出AI导诊", icon: "success" });
  },

  sendMessage() {
    const { userInput } = this.data;
    const trimmedInput = userInput?.trim();

    if (!trimmedInput) {
      return;
    }

    this.addMessage("user", trimmedInput);
    this.setData({
      userInput: "",
      currentUserMessage: trimmedInput,
    });

    this.processUserMessage();
  },

  processUserMessage() {
    const { mode } = this.data;

    if (mode === "guide") {
      this.handleGuideModeMessage();
    } else {
      this.handleChatModeMessage();
    }
  },

  handleGuideModeMessage() {
    const { currentUserMessage, stageIndex, taskIndex } = this.data;

    this.recordDialogueAnswer(currentUserMessage, stageIndex, taskIndex);
    this.setData({ isAITyping: true });
    this.scrollToBottom();

    setTimeout(() => {
      this.handleSubTaskCompleted();
      this.continueToNextTask();
    }, 1000);
  },

  handleChatModeMessage() {
    const { currentUserMessage } = this.data;

    this.setData({ isAITyping: true });
    this.scrollToBottom();

    setTimeout(async () => {
      try {
        const aiReply = await this.callAIModel(currentUserMessage);
        this.replaceLastAIMessage(aiReply);
      } catch (error) {
        console.error("AI调用失败:", error);
        this.replaceLastAIMessage("抱歉，AI服务暂时不可用，请稍后重试。");
      } finally {
        this.setData({ isAITyping: false });
        this.scrollToBottom();
      }
    }, 800);
  },

  recordDialogueAnswer(answer, stageIdx, taskIdx) {
    const { guideStages, dialogueRecord } = this.data;
    const stage = guideStages[stageIdx];
    const task = stage?.tasks[taskIdx];

    if (!task) {
      console.error("任务不存在:", stageIdx, taskIdx);
      return;
    }

    const record = {
      bigStageIndex: stageIdx,
      subTaskIndex: taskIdx,
      bigStageName: stage.stageName,
      subTaskName: task.taskName,
      question: task.detail,
      answer,
    };

    const exists = dialogueRecord.some(
      (r) =>
        r.bigStageIndex === record.bigStageIndex &&
        r.subTaskIndex === record.subTaskIndex,
    );

    if (!exists) {
      this.setData({
        dialogueRecord: [...dialogueRecord, record],
      });
    }
  },

  handleSubTaskCompleted() {
    const { guideStages, stageIndex, taskIndex } = this.data;
    const currentStage = guideStages[stageIndex];
    const task = currentStage?.tasks[taskIndex];

    if (!task) {
      console.error("任务不存在:", stageIndex, taskIndex);
      return;
    }

    if (task.taskFun && typeof this[task.taskFun] === "function") {
      this[task.taskFun]();
    }

    this.addMessage("ai", task.detail, task.options, task.navigations);
    this.scrollToBottom();
  },

  continueToNextTask() {
    const { guideStages, stageIndex, taskIndex } = this.data;
    const currentStage = guideStages[stageIndex];
    const nextTaskIdx = taskIndex + 1;

    if (nextTaskIdx < currentStage.tasks.length) {
      this.setData({
        taskIndex: nextTaskIdx,
        isAITyping: false,
      });
      this.updateTaskDisplay();
      return;
    }

    const nextStageIdx = stageIndex + 1;
    if (nextStageIdx < guideStages.length) {
      this.setData({
        stageIndex: nextStageIdx,
        taskIndex: 0,
        isAITyping: false,
      });
      this.updateTaskDisplay();
    }
  },

  updateTaskDisplay() {
    const { guideStages, stageIndex, taskIndex } = this.data;
    const currentStage = guideStages[stageIndex];

    if (!currentStage) {
      return;
    }

    const task = currentStage.tasks[taskIndex];
    if (task) {
      this.setData({
        stageSummary: `阶段 ${stageIndex + 1}/${guideStages.length}：${currentStage.stageName}`,
        taskDetail: task.detail,
        taskName: task.taskName,
      });
      this.calculateCompletedTasks();
    }

    this.scrollToBottom();
  },

  calculateTotalTasks() {
    const { guideStages } = this.data;
    const total = guideStages.reduce(
      (sum, stage) => sum + stage.tasks.length,
      0,
    );
    this.setData({ totalTaskCount: total });
  },

  calculateCompletedTasks() {
    const { guideStages, stageIndex, taskIndex } = this.data;
    let completed = 0;

    for (let i = 0; i < stageIndex; i++) {
      completed += guideStages[i].tasks.length;
    }
    completed += taskIndex + 1;

    this.setData({ completedTaskCount: completed });
  },

  // ========== AI 调用与建议生成 ==========

  async callAIModel(userMessage, retryCount = 0) {
    const MAX_RETRIES = 2;
    const TIMEOUT = 15000;

    try {
      if (!wx.cloud || !wx.cloud.extend || !wx.cloud.extend.AI) {
        throw new Error("AI服务未初始化，请检查云开发配置");
      }

      const model = wx.cloud.extend.AI.createModel("hunyuan-exp");

      const aiCallPromise = (async () => {
        const result = await model.streamText({
          data: {
            model: "hunyuan-turbos-latest",
            messages: [{ role: "user", content: userMessage }],
          },
        });

        let fullText = "";
        for await (let event of result.eventStream) {
          if (event.data === "[DONE]") {
            break;
          }
          const data = JSON.parse(event.data);

          const think = data?.choices?.[0]?.delta?.reasoning_content;
          if (think) {
            console.log(think);
          }

          const text = data?.choices?.[0]?.delta?.content;
          if (text) {
            console.log(text);
            fullText += text;
          }
        }
        return fullText;
      })();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("timeout")), TIMEOUT);
      });

      const text = await Promise.race([aiCallPromise, timeoutPromise]);

      if (!text || text.trim() === "") {
        throw new Error("AI返回内容为空");
      }

      return text;
    } catch (error) {
      console.error(
        `callAIModel 错误 (重试 ${retryCount}/${MAX_RETRIES}):`,
        error,
      );

      if (retryCount < MAX_RETRIES && this.shouldRetry(error)) {
        console.log(`正在重试第 ${retryCount + 1} 次...`);
        await this.delay(1000 * (retryCount + 1));
        return this.callAIModel(userMessage, retryCount + 1);
      }

      throw error;
    }
  },

  // 获取网络类型
  getNetworkType() {
    return new Promise((resolve) => {
      wx.getNetworkType({
        success: (res) => resolve(res.networkType),
        fail: () => resolve("unknown"),
      });
    });
  },

  // 判断是否应该重试
  shouldRetry(error) {
    const retryableErrors = [
      "request:fail",
      "timeout",
      "网络错误",
      "网络不可用",
      "ECONNRESET",
      "ETIMEDOUT",
    ];

    const errorMessage = error.message || error.errMsg || String(error);
    return retryableErrors.some((keyword) => errorMessage.includes(keyword));
  },

  // 延迟函数
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  // 获取友好的错误信息
  getErrorMessage(error) {
    const errorMessage = error.message || error.errMsg || String(error);

    if (errorMessage.includes("超时") || errorMessage.includes("timeout")) {
      return "⏰ AI服务响应超时，请稍后重试或检查网络连接。";
    }

    if (errorMessage.includes("网络") || errorMessage.includes("network")) {
      return "📡 网络连接异常，请检查网络设置后重试。";
    }

    if (errorMessage.includes("云函数") || errorMessage.includes("cloud")) {
      return "☁️ 云服务暂时不可用，请稍后重试。";
    }

    if (errorMessage.includes("未开通") || errorMessage.includes("not found")) {
      return "🔧 AI服务未配置或已停用，请联系管理员。";
    }

    return (
      "😔 抱歉，AI服务暂时无法使用，请稍后再试。\n\n错误详情: " + errorMessage
    );
  },

  async generateTriageAdvice() {
    const { dialogueRecord } = this.data;

    this.setData({ isAITyping: true });
    this.addMessage("ai", "🤔 AI 正在综合分析您的症状，请稍候...");

    try {
      const result = await wx.cloud.callFunction({
        name: "callAI",
        data: { type: "triage", dialogueRecord },
      });

      if (result.result.success) {
        this.setData({
          stageSummary: "问诊完成 - 分诊建议已生成",
          taskDetail: "AI已完成症状采集和分析",
          isAITyping: false,
        });
        this.replaceLastAIMessage(`🏥 **分诊建议**\n\n${result.result.advice}`);
      } else {
        throw new Error(result.result.error || "AI调用失败");
      }
    } catch (error) {
      console.error("生成分诊建议失败:", error);
      this.setData({ isAITyping: false });
      this.replaceLastAIMessage(
        `🏥 **分诊建议**\n\n根据您提供的信息，我的初步分析如下：\n\n` +
          `1. **症状评估**：您描述的症状需要进一步专业评估\n` +
          `2. **建议级别**：建议尽快就医咨询\n` +
          `3. **推荐科室**：根据具体症状可选择内科或相应专科\n` +
          `4. **注意事项**：\n` +
          `   - 如症状加重请立即就医\n` +
          `   - 保持良好的休息和饮食习惯\n` +
          `   - 避免自行用药掩盖症状\n\n` +
          `⚠️ **重要提醒**：此建议仅供参考，不能替代专业医生的诊断。如有紧急情况，请立即前往急诊科就诊。\n\n` +
          `（注：AI服务暂不可用，以上为预设建议）`,
      );
      wx.showToast({
        title: "AI服务暂不可用，已使用预设建议",
        icon: "none",
        duration: 3000,
      });
    }

    this.scrollToBottom();
  },

  generateAppointmentAdvice() {
    this.addMessage("ai", "🤔 AI 正在为您推荐挂号科室，请稍候...");

    setTimeout(() => {
      this.setData({
        stageSummary: "挂号建议已生成",
        taskDetail: "已推荐挂号科室",
        isAITyping: false,
      });

      this.replaceLastAIMessage(
        `📋 **挂号建议**\n\n根据您的症状，建议您挂：\n\n` +
          `• 科室：内科\n` +
          `• 医生：普通号\n` +
          `• 预计等待时间：15-30分钟\n\n` +
          `如需预约，请点击下方的"挂号服务"按钮。`,
      );

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

    this.addMessage("ai", "🤔 AI 正在生成结束语...");

    setTimeout(() => {
      this.setData({ isAITyping: false });
      this.replaceLastAIMessage(
        `🎉 **导诊流程已完成**\n\n感谢您完成本次智能导诊！\n\n` +
          `✨ 祝您身体早日康复！\n\n` +
          `如果后续有任何健康问题，欢迎随时咨询。祝您生活愉快！`,
      );

      wx.showToast({ title: "导诊完成！", icon: "success", duration: 3000 });
      this.scrollToBottom();

      setTimeout(() => {
        this.exitGuideMode();
      }, 2000);
    }, 1500);
  },

  // ========== UI 交互与事件处理 ==========

  addMessage(speaker, content, options = [], navigations = []) {
    const { messages } = this.data;
    const newMsg = { speaker, content, options, navigations };
    this.setData({ messages: [...messages, newMsg] });
  },

  addSystemMessage(content) {
    this.addMessage("system", content);
  },

  replaceLastAIMessage(content, options = [], navigations = []) {
    const { messages } = this.data;

    if (messages.length > 0 && messages[messages.length - 1].speaker === "ai") {
      const updatedMessages = [...messages];
      updatedMessages[messages.length - 1] = {
        speaker: "ai",
        content,
        options,
        navigations,
      };
      this.setData({ messages: updatedMessages });
    } else {
      this.addMessage("ai", content, options, navigations);
    }
  },

  scrollToBottom() {
    this.setData({ scrollTop: 999999 });
  },

  selectOption(e) {
    const selectedOption = e.detail.option || e.currentTarget.dataset.option;

    if (selectedOption) {
      this.setData({ userInput: selectedOption });
      this.sendMessage();
    }
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
    const { showTaskDetail } = this.data;
    this.setData({ showTaskDetail: !showTaskDetail });
  },

  // ========== 页面跳转功能 ==========

  gotoHistory: nav.gotoHistory,
  gotoVoiceInput: nav.gotoVoiceInput,
  gotoReport: nav.gotoReport,
  gotoAIExplanation: nav.gotoAIExplanation,

  // ========== 功能接口 ==========

  toggleFunctionalBar() {
    const { showFunctionalBar } = this.data;
    this.setData({ showFunctionalBar: !showFunctionalBar });
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
});
