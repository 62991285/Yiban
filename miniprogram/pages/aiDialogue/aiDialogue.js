import * as nav from "../../utils/navigation.js";
import { callAIModel } from "../../utils/aiUtils.js";

// 常量定义
const STORAGE_KEYS = {
  MESSAGES: "aiDialogue_messages",
  MODE: "aiDialogue_mode",
};

const WELCOME_MESSAGE =
  '我是"医伴"小助手，可以向我咨询有关医疗或医院相关问题，点击右下角按钮可进入智能导诊模式';

const WELCOME_OPTIONS = ["医院科室介绍", "挂号流程说明", "医院导航"];

// 导诊阶段配置 - 从配置文件加载
const { guideStages, stepActions } = require("../../config/guideStages.js");

const STEP_ACTIONS = stepActions;

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
    this.setData({ guideStages: guideStages });
  },

  loadSavedState() {
    try {
      const savedMessages = wx.getStorageSync(STORAGE_KEYS.MESSAGES) || [];
      const savedMode = wx.getStorageSync(STORAGE_KEYS.MODE) || "chat";

      if (savedMessages.length > 0 && savedMode === "guide") {
        this.setData({ messages: savedMessages, mode: "guide" });
        this.updateStepDisplay();
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

  startGuideSession() {
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
    });

    this.addSystemMessage("导诊模式已开启");
    this.updateStepDisplay();
    this.addMessage(
      "ai",
      `您好！我是AI健康助手，${firstStage.description}\n\n${firstStep.detail}`,
      firstStep.options,
    );
    this.scrollToBottom();
  },

  toggleGuideSession() {
    if (this.data.mode !== "guide") {
      this.startGuideSession();
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

  processGuideResponse() {
    const { pendingUserInput, stageIndex, stepIndex } = this.data;

    this.recordUserResponse(pendingUserInput, stageIndex, stepIndex);
    this.setData({ isProcessing: true });
    this.scrollToBottom();
    this.executeCurrentStep();
    this.continueToNextStep();
  },

  processChatMessage() {
    const { pendingUserInput } = this.data;

    this.setData({ isProcessing: true });
    this.scrollToBottom();

    setTimeout(async () => {
      try {
        const aiReply = await callAIModel(pendingUserInput);
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

  recordUserResponse(response, stageIdx, stepIdx) {
    const { guideStages, sessionRecords } = this.data;
    const stage = guideStages[stageIdx];
    const step = stage?.steps[stepIdx];

    if (!step) {
      console.error("步骤不存在:", stageIdx, stepIdx);
      return;
    }

    const record = {
      stageIndex: stageIdx,
      stepIndex: stepIdx,
      stageName: stage.stageName,
      stepName: step.stepName,
      question: step.detail,
      response,
    };

    const exists = sessionRecords.some(
      (r) =>
        r.stageIndex === record.stageIndex && r.stepIndex === record.stepIndex,
    );

    if (!exists) {
      this.setData({
        sessionRecords: [...sessionRecords, record],
      });
    }
  },

  executeCurrentStep() {
    const { guideStages, stageIndex, stepIndex } = this.data;
    const currentStage = guideStages[stageIndex];
    const step = currentStage?.steps[stepIndex];

    if (!step) {
      console.error("步骤不存在:", stageIndex, stepIndex);
      return;
    }

    // 使用配置文件中的步骤动作处理器
    if (step.stepHandler && STEP_ACTIONS[step.stepHandler]) {
      STEP_ACTIONS[step.stepHandler](this);
    }

    this.addMessage("ai", step.detail, step.options, step.navigations);
    this.scrollToBottom();
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

    // 计算总步骤数的局部函数
    const calculateTotalSteps = () => {
      const total = guideStages.reduce(
        (sum, stage) => sum + stage.steps.length,
        0,
      );
      this.setData({ totalStepCount: total });
    };

    // 计算已完成步骤数的局部函数
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

  // ========== AI 调用与建议生成 ==========

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

  toggleStepDescription() {
    const { isStepDetailExpanded } = this.data;
    this.setData({ isStepDetailExpanded: !isStepDetailExpanded });
  },

  // ========== 页面跳转功能 ==========

  gotoHistory: nav.gotoHistory,
  gotoVoiceInput: nav.gotoVoiceInput,
  gotoReport: nav.gotoReport,
  gotoAIExplanation: nav.gotoAIExplanation,

  // ========== 功能接口 ==========

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
