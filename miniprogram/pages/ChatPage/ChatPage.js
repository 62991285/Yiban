import { callAIModel } from "../../utils/aiUtils.js";
import {
  getChatHistory,
  saveChatHistory,
  addChatMessage,
} from "../../utils/userInfoManager.js";

const STORAGE_KEYS = {
  MODE: "aiDialogue_mode",
  APPOINTMENT_RECOMMENDATION: "aiDialogue_appointment_recommendation",
  VISIT_RESULT: "aiDialogue_visit_result",
};

const WELCOME_MESSAGE =
  '我是"医伴"小助手，可以向我咨询有关医疗或医院相关问题，点击右下角按钮可进入智能导诊模式';

const WELCOME_OPTIONS = ["医院科室介绍", "挂号流程说明", "医院导航"];

const { guideStages, stepProcessor } = require("../../config/guideStages.js");

Page({
  data: {
    mode: "chat",
    isStepDetailExpanded: false,
    stageSummary: "",
    stepDetail: "",
    stepName: "",
    userInput: "",
    stageIndex: 0,
    stepIndex: 0,
    isProcessing: false,
    guideStages: [],
    messages: [],
    sessionRecords: [],
    scrollTop: 0,
    pendingUserInput: "",
    totalStepCount: 0,
    completedStepCount: 0,
    isToolbarVisible: false,
  },

  onLoad() {
    this.initAISTageList();
    this.loadSavedState();
  },

  onShow() {
    if (!this.data.messages?.length) {
      this.addMessage("ai", WELCOME_MESSAGE, WELCOME_OPTIONS);
    }
  },

  onHide() {
    this.saveState();
  },

  onUnload() {
    this.saveState();
  },

  initAISTageList() {
    this.setData({ guideStages: guideStages });
  },

  loadSavedState() {
    try {
      const chatHistory = getChatHistory() || [];
      const savedMode = wx.getStorageSync(STORAGE_KEYS.MODE) || "chat";
      const messages = chatHistory.map((item) => ({
        speaker: item.speaker,
        content: item.content,
        options: item.options || [],
        pagelinks: item.pagelinks || [],
      }));

      if (messages.length > 0 && savedMode === "guide") {
        this.setData({ messages, mode: "guide" });
        this.updateStepDisplay();
      } else {
        this.setData({
          mode: "chat",
          messages: messages.length > 0 ? messages : [],
        });
      }
    } catch (error) {
      console.error("加载保存状态失败:", error);
      this.setData({ mode: "chat", messages: [] });
    }
  },

  saveState() {
    try {
      const chatHistory = this.data.messages.map((message) => ({
        speaker: message.speaker,
        content: message.content,
        options: message.options || [],
        pagelinks: message.pagelinks || [],
      }));

      const saveResult = saveChatHistory(chatHistory);
      wx.setStorageSync(STORAGE_KEYS.MODE, this.data.mode);

      if (saveResult) {
        console.log(
          "聊天历史已成功保存到userData，消息数量:",
          chatHistory.length,
        );
      } else {
        console.error("聊天历史保存失败");
      }
    } catch (error) {
      console.error("保存状态失败:", error);
    }
  },

  async startGuideSession() {
    const { guideStages } = this.data;

    if (!guideStages?.length) {
      console.error("guideStages 未初始化或为空");
      wx.showToast({ title: "系统初始化失败，请重试", icon: "none" });
      return;
    }

    const firstStage = guideStages[0];
    if (!firstStage?.steps?.length) {
      console.error("第一个阶段或步骤未定义:", firstStage);
      wx.showToast({ title: "步骤数据异常，请重试", icon: "none" });
      return;
    }

    const firstStep = firstStage.steps[0];

    this.setData({
      stageSummary: `阶段 1/${guideStages.length}：${firstStage.stageName}`,
      stepDetail: firstStep.detail,
      stepName: firstStep.stepName,
      isStepDetailExpanded: true,
      stageIndex: 0,
      stepIndex: 0,
      messages: [],
      sessionRecords: [],
      mode: "guide",
      isProcessing: true,
    });

    this.addSystemMessage("导诊模式已开启");
    this.updateStepDisplay();

    try {
      await stepProcessor.processStep(this, firstStep, 0, 0);
    } catch (error) {
      console.error("启动导诊模式失败:", error);
      this.addMessage("ai", "抱歉，启动导诊模式时出现错误，请重试。");
    } finally {
      this.setData({ isProcessing: false });
      this.scrollToBottom();
    }
  },

  async toggleGuideSession() {
    if (this.data.mode !== "guide") {
      await this.startGuideSession();
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
      stepDetail: "",
      isStepDetailExpanded: false,
      stageIndex: 0,
      stepIndex: 0,
      sessionRecords: [],
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
      pendingUserInput: trimmedInput,
    });

    this.processUserMessage();
  },

  processUserMessage() {
    const { mode } = this.data;

    if (mode === "guide") {
      this.processGuideResponse();
    } else {
      this.processChatMessage();
    }
  },

  async processGuideResponse() {
    const { pendingUserInput, stageIndex, stepIndex } = this.data;
    this.setData({ isProcessing: true });
    this.scrollToBottom();
    await this.executeCurrentStep();
    this.continueToNextStep();
  },

  processChatMessage() {
    const { pendingUserInput, messages } = this.data;

    this.setData({ isProcessing: true });
    this.scrollToBottom();

    setTimeout(async () => {
      try {
        const enhancedPrompt = this.buildChatPrompt(pendingUserInput, messages);
        const aiReply = await callAIModel(enhancedPrompt);
        this.replaceLastAIMessage(aiReply);
      } catch (error) {
        console.error("AI调用失败:", error);
        this.replaceLastAIMessage("抱歉，AI服务暂时不可用，请稍后重试。");
      } finally {
        this.setData({ isProcessing: false });
        this.scrollToBottom();
      }
    }, 800);
  },

  buildChatPrompt(userMessage, messages) {
    const systemPrompt = `你是"医伴"，一位温暖贴心的AI健康陪伴助手。正在陪伴用户看病就医。

【回答要求】
1. 简短亲切：每次回复控制在2-3句话，像朋友聊天一样自然
2. 专业温暖：医学信息准确，语气温柔关切
3. 对话感强：先回应用户情绪，再给出建议，最后可问"还有什么想了解的？"
4. 逐步展开：用户追问时再详细解释，不一次性说太多
5. 安全提醒：急重症必须建议立即就医

【示例风格】
- "别担心，这种情况很常见。可能是轻微感冒，多喝温水休息就好。还有哪里不舒服吗？"
- "理解您的担心。这个指标稍微偏高，建议复查确认。您最近饮食如何？"

【禁忌】
- 不长篇大论
- 不罗列123条
- 不冷冰冰说教

请像朋友一样简短回复：`;

    const conversationHistory = this.buildConversationHistory(messages);

    if (conversationHistory) {
      return `${systemPrompt}\n\n对话历史：\n${conversationHistory}\n\n用户：${userMessage}\n\n医伴：`;
    }

    return `${systemPrompt}\n\n用户：${userMessage}\n\n医伴：`;
  },

  buildConversationHistory(messages) {
    const chatMessages = messages.filter(
      (msg) => msg.speaker === "user" || msg.speaker === "ai",
    );
    const recentMessages = chatMessages.slice(-6);

    if (recentMessages.length === 0) {
      return "";
    }

    return recentMessages
      .map((msg) => {
        const role = msg.speaker === "user" ? "用户" : "医伴";
        const content = msg.content?.substring(0, 100) || "";
        return `${role}：${content}`;
      })
      .join("\n");
  },

  async executeCurrentStep() {
    const { guideStages, stageIndex, stepIndex } = this.data;
    const currentStage = guideStages[stageIndex];
    const step = currentStage?.steps[stepIndex];

    if (!step) {
      console.error("步骤不存在:", stageIndex, stepIndex);
      this.setData({ isProcessing: false });
      return;
    }

    try {
      await stepProcessor.processStep(this, step, stageIndex, stepIndex);
    } catch (error) {
      console.error("执行步骤失败:", error);
      this.addMessage("ai", "抱歉，处理步骤时出现错误，请重试。");
    } finally {
      this.setData({ isProcessing: false });
      this.scrollToBottom();
    }
  },

  continueToNextStep() {
    const { guideStages, stageIndex, stepIndex } = this.data;
    const currentStage = guideStages[stageIndex];
    const nextStepIdx = stepIndex + 1;

    if (nextStepIdx < currentStage.steps.length) {
      this.setData({
        stepIndex: nextStepIdx,
        isProcessing: false,
      });
      this.updateStepDisplay();
      return;
    }

    const nextStageIdx = stageIndex + 1;
    if (nextStageIdx < guideStages.length) {
      this.setData({
        stageIndex: nextStageIdx,
        stepIndex: 0,
        isProcessing: false,
      });
      this.updateStepDisplay();
    }
  },

  updateStepDisplay() {
    const { guideStages, stageIndex, stepIndex } = this.data;
    const currentStage = guideStages[stageIndex];

    if (!currentStage) {
      return;
    }

    const calculateTotalSteps = () => {
      const total = guideStages.reduce(
        (sum, stage) => sum + stage.steps.length,
        0,
      );
      this.setData({ totalStepCount: total });
    };

    const calculateCompletedSteps = () => {
      let completed = 0;
      for (let i = 0; i < stageIndex; i++) {
        completed += guideStages[i].steps.length;
      }
      completed += stepIndex + 1;
      this.setData({ completedStepCount: completed });
    };

    const step = currentStage.steps[stepIndex];
    if (step) {
      this.setData({
        stageSummary: `阶段 ${stageIndex + 1}/${guideStages.length}：${currentStage.stageName}`,
        stepDetail: step.detail,
        stepName: step.stepName,
      });
      calculateCompletedSteps();
    }

    calculateTotalSteps();
    this.scrollToBottom();
  },

  saveAppointmentRecommendation(recommendation) {
    try {
      wx.setStorageSync(
        STORAGE_KEYS.APPOINTMENT_RECOMMENDATION,
        recommendation,
      );
    } catch (error) {
      console.error("保存挂号建议失败:", error);
    }
  },

  saveVisitResult(visitResult) {
    try {
      const existingResults =
        wx.getStorageSync(STORAGE_KEYS.VISIT_RESULT) || [];
      const newResults = [...existingResults, visitResult];
      wx.setStorageSync(STORAGE_KEYS.VISIT_RESULT, newResults);
    } catch (error) {
      console.error("保存就诊结果失败:", error);
    }
  },

  addMessage(speaker, content, options = [], pagelinks = []) {
    const { messages } = this.data;
    const newMsg = { speaker, content, options, pagelinks };
    console.log("[DEBUG] addMessage - newMsg:", newMsg);
    this.setData({ messages: [...messages, newMsg] });
    // 立即保存到文件
    this.saveState();
  },

  addSystemMessage(content) {
    this.addMessage("system", content);
  },

  replaceLastAIMessage(content, options = [], pagelinks = []) {
    const { messages } = this.data;

    if (messages.length > 0 && messages[messages.length - 1].speaker === "ai") {
      const updatedMessages = [...messages];
      updatedMessages[messages.length - 1] = {
        speaker: "ai",
        content,
        options,
        pagelinks,
      };
      this.setData({ messages: updatedMessages });
      // 立即保存到文件
      this.saveState();
    } else {
      this.addMessage("ai", content, options, pagelinks);
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
    const handler = e.currentTarget.dataset.handler;

    if (handler && nav[handler]) {
      nav[handler]();
    }
  },

  toggleStepDescription() {
    const { isStepDetailExpanded } = this.data;
    this.setData({ isStepDetailExpanded: !isStepDetailExpanded });
  },

  toggleFunctionalBar() {
    const { isToolbarVisible } = this.data;
    this.setData({ isToolbarVisible: !isToolbarVisible });
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
