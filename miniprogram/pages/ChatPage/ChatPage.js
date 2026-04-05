import { callAIModelWithContext } from "./AIModule.js";
import {
  setPageData,
  getPageData,
  getChatHistory,
  setChatHistory,
  addChatMessage,
} from "../../utils/accountDataManager.js";
import {
  gotoAppointmentPage,
  gotoDepartmentNavigationPage,
  gotoPharmacyNavigationPage,
  gotoUserInfoPage,
  gotoAppointmentRecordsPage,
} from "../../utils/pageNavigation.js";

const nav = {
  gotoAppointmentPage,
  gotoDepartmentNavigationPage,
  gotoPharmacyNavigationPage,
  gotoUserInfoPage,
  gotoAppointmentRecordsPage,
};

const STORAGE_KEYS = {
  MODE: "aiDialogue_mode",
  APPOINTMENT_RECOMMENDATION: "aiDialogue_appointment_recommendation",
  VISIT_RESULT: "aiDialogue_visit_result",
};

const WELCOME_MESSAGE =
  '我是"医伴"小助手，可以向我咨询有关医疗或医院相关问题，点击右下角按钮可进入智能导诊模式';

const WELCOME_OPTIONS = ["医院科室介绍", "挂号流程说明", "医院导航"];

const { guideStages } = require("../../config/guideStages.js");

Page({
  data: {
    pageName: "ChatPage",
    messages: [],
    guideStages: [],

    pageConfigs: {
      mode: "chat",
      isStepDetailExpanded: false,
      stageSummary: "",
      stepDetail: "",
      stepName: "",
      userInput: "",
      stageIndex: 0,
      stepIndex: 0,
      sessionRecords: [],
      pendingUserInput: "",
    },

    isProcessing: false,
    scrollTop: 0,
    totalStepCount: 0,
    completedStepCount: 0,
  },

  onLoad() {
    this.initAISTageList();
    this.loadChatHistory();
    this.loadChatPageData();
  },

  onShow() {
    if (!this.data.messages?.length) {
      this.addAIMessage(WELCOME_MESSAGE, WELCOME_OPTIONS);
    }
  },

  onHide() {
    this.saveChatPageData();
    this.saveChatHistory();
  },

  onUnload() {},

  initAISTageList() {
    this.setData({ guideStages: guideStages });
  },

  loadChatHistory() {
    try {
      const chatHistory = getChatHistory() || [];

      const messages = chatHistory.map((item) => ({
        speaker: item.speaker,
        content: item.content,
        options: item.options || [],
        pagelinks: item.pagelinks || [],
        picture: item.picture || null,
      }));

      this.setData({ messages: messages.length > 0 ? messages : [] });
    } catch (error) {
      console.error("加载聊天历史失败:", error);
      this.setData({ messages: [] });
    }
  },

  loadChatPageData() {
    try {
      const savedPageData = getPageData(this.data.pageName);

      if (savedPageData) {
        this.setData({
          pageConfigs: savedPageData,
        });
      } else {
        this.setData({
          pageConfigs: {
            mode: "chat",
            isStepDetailExpanded: false,
            stageSummary: "",
            stepDetail: "",
            stepName: "",
            userInput: "",
            stageIndex: 0,
            stepIndex: 0,
            sessionRecords: [],
            pendingUserInput: "",
          },
        });
      }
    } catch (error) {
      console.error("加载聊天页面数据失败:", error);
      this.setData({
        pageConfigs: {
          mode: "chat",
          isStepDetailExpanded: false,
          stageSummary: "",
          stepDetail: "",
          stepName: "",
          userInput: "",
          stageIndex: 0,
          stepIndex: 0,
          sessionRecords: [],
          pendingUserInput: "",
        },
      });
    }
  },

  saveChatPageData() {
    try {
      const result = setPageData(this.data.pageName, this.data.pageConfigs);

      if (result) {
        console.log("聊天页面数据已成功保存");
      } else {
        console.error("聊天页面数据保存失败");
      }
    } catch (error) {
      console.error("保存聊天页面数据失败:", error);
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
      totalStepCount: guideStages.reduce(
        (sum, stage) => sum + stage.steps.length,
        0,
      ),
      completedStepCount: 0,
      messages: [],
      sessionRecords: [],
      mode: "guide",
      isProcessing: true,
    });

    this.addSystemMessage("导诊模式已开启");
    this.showNextStepMessage();
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

  processUserInputWorkflow() {
    this.recordUserInput();
    if (this.data.mode === "guide") {
      this.recordUserResponse();
      if (this.TryMoveToNextStep()) this.showNextStepMessage();
      else return;
    } else {
      this.processChatMessage();
    }
  },

  recordUserInput() {
    this.setData({ isProcessing: true });
    const { userInput, mode } = this.data;
    const trimmedInput = userInput?.trim();
    if (!trimmedInput) {
      return;
    }

    this.addMessage("user", trimmedInput);
    this.setData({
      userInput: "",
      pendingUserInput: trimmedInput,
    });
  },

  recordUserResponse() {
    const { guideStages, stageIndex, stepIndex, pendingUserInput } = this.data;
    const currentStage = guideStages[stageIndex];
    const currentStep = currentStage?.steps[stepIndex];
    if (currentStep) {
      this.setData({
        sessionRecords: [
          ...this.data.sessionRecords,
          {
            stepName: currentStep.stepName,
            question: currentStep.detail,
            response: pendingUserInput,
          },
        ],
      });
    }
  },

  async processChatMessage() {
    const { pendingUserInput, messages } = this.data;

    this.setData({ isProcessing: true });
    this.scrollToBottom();

    try {
      const aiReply = await callAIModelWithContext(pendingUserInput, messages);
      this.replaceLastAIMessage(aiReply.text, [], aiReply.pagelinks);
    } catch (error) {
      console.error("AI调用失败:", error);
      this.replaceLastAIMessage("抱歉，AI服务暂时不可用，请稍后重试。");
    } finally {
      this.setData({ isProcessing: false });
      this.scrollToBottom();
    }
  },

  updateStepDisplay() {
    const { guideStages, stageIndex, stepIndex } = this.data;
    const currentStage = guideStages[stageIndex];
    const step = currentStage?.steps[stepIndex];

    if (step) {
      this.setData({
        stageSummary: `阶段 ${stageIndex + 1}/${guideStages.length}：${currentStage.stageName}`,
        stepDetail: step.detail,
        stepName: step.stepName,
      });
    }
  },

  async TryMoveToNextStep() {
    const { guideStages, stageIndex, stepIndex } = this.data;
    const currentStage = guideStages[stageIndex];
    const nextStepIdx = stepIndex + 1;
    const calculateCompletedSteps = () => {
      let completed = 0;
      for (let i = 0; i < stageIndex; i++) {
        completed += guideStages[i].steps.length;
      }
      completed += nextStepIdx;
      return completed;
    };
    const calculateTotalSteps = () => {
      const total = guideStages.reduce(
        (sum, stage) => sum + stage.steps.length,
        0,
      );
      this.setData({ totalStepCount: total });
    };
    if (nextStepIdx < currentStage.steps.length) {
      this.setData({
        stepIndex: nextStepIdx,
        completedStepCount: calculateCompletedSteps(),
        isProcessing: true,
      });
      this.updateStepDisplay();

      return true;
    } else {
      const nextStageIdx = stageIndex + 1;
      if (nextStageIdx < guideStages.length) {
        let completed = 0;
        for (let i = 0; i <= stageIndex; i++) {
          completed += guideStages[i].steps.length;
        }

        this.setData({
          stageIndex: nextStageIdx,
          stepIndex: 0,
          completedStepCount: completed,
          isProcessing: true,
        });
        return true;
      } else return false;
    }
  },

  async showNextStepMessage() {
    const { guideStages, stageIndex, stepIndex } = this.data;
    const currentStage = guideStages[stageIndex];
    const step = currentStage?.steps[stepIndex];

    if (!step) {
      console.error("步骤不存在:", stageIndex, stepIndex);
      this.setData({ isProcessing: false });
      return;
    }

    try {
      if (step.handler) step.detail = step.handler(this);

      this.addAIMessage(
        step.detail,
        step.options,
        step.pagelinks,
        step.picture,
      );
    } catch (error) {
      console.error("执行步骤失败:", error);
      this.addMessage("ai", "抱歉，处理步骤时出现错误，请重试。");
    } finally {
      this.setData({ isProcessing: false });
      this.scrollToBottom();
    }
  },

  addMessage(speaker, content, options = [], pagelinks = [], picture = null) {
    const { messages } = this.data;
    const newMsg = { speaker, content, options, pagelinks, picture };
    console.log("[DEBUG] addMessage - newMsg:", newMsg);

    const updatedMessages = [...messages, newMsg];
    this.setData({ messages: updatedMessages });

    this.saveChatHistory(updatedMessages);
  },

  saveChatHistory() {
    try {
      const chatHistory = this.data.messages.map((msg) => ({
        speaker: msg.speaker,
        content: msg.content,
        options: msg.options || [],
        pagelinks: msg.pagelinks || [],
        picture: msg.picture || null,
      }));

      const result = setChatHistory(chatHistory);
      if (result) {
        console.log("聊天记录已保存");
      } else {
        console.error("聊天记录保存失败");
      }
    } catch (error) {
      console.error("保存聊天记录失败:", error);
    }
  },

  addUserMessage(content) {
    this.addMessage("user", content);
  },
  addAIMessage(content, options = [], pagelinks = [], picture = null) {
    this.addMessage("ai", content, options, pagelinks, picture);
  },

  addSystemMessage(content) {
    this.addMessage("system", content);
  },

  replaceLastAIMessage(content, options = [], pagelinks = [], picture = null) {
    const { messages } = this.data;

    if (messages.length > 0 && messages[messages.length - 1].speaker === "ai") {
      const updatedMessages = [...messages];
      updatedMessages[messages.length - 1] = {
        speaker: "ai",
        content,
        options,
        pagelinks,
        picture,
      };
      this.setData({ messages: updatedMessages });
      this.saveChatHistory(updatedMessages);
    } else {
      this.addMessage("ai", content, options, pagelinks, picture);
    }
  },

  scrollToBottom() {
    this.setData({ scrollTop: 999999 });
  },

  selectOption(e) {
    const selectedOption = e.detail.option || e.currentTarget.dataset.option;

    if (selectedOption) {
      this.setData({ userInput: selectedOption });
      this.processUserInputWorkflow();
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
          this.saveChatHistory([]);
          this.addAIMessage(WELCOME_MESSAGE, WELCOME_OPTIONS);
          wx.showToast({ title: "已清空聊天记录", icon: "success" });
        }
      },
    });
  },
});
