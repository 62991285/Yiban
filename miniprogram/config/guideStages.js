// 任务处理器集合
const taskHandlers = {
  // 生成分诊建议
  generateTriageAdvice: async (pageInstance) => {
    const { dialogueRecord } = pageInstance.data;

    pageInstance.setData({ isAITyping: true });
    pageInstance.addMessage("ai", "🤔 AI 正在综合分析您的症状，请稍候...");

    try {
      const result = await wx.cloud.callFunction({
        name: "callAI",
        data: { type: "triage", dialogueRecord },
      });

      if (result.result.success) {
        pageInstance.setData({
          stageSummary: "问诊完成 - 分诊建议已生成",
          taskDetail: "AI已完成症状采集和分析",
          isAITyping: false,
        });
        pageInstance.replaceLastAIMessage(
          `🏥 **分诊建议**\n\n${result.result.advice}`,
        );
      } else {
        throw new Error(result.result.error || "AI调用失败");
      }
    } catch (error) {
      console.error("生成分诊建议失败:", error);
      pageInstance.setData({ isAITyping: false });
      pageInstance.replaceLastAIMessage(
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

    pageInstance.scrollToBottom();
  },

  // 生成挂号建议
  generateAppointmentAdvice: (pageInstance) => {
    pageInstance.addMessage("ai", "🤔 AI 正在为您推荐挂号科室，请稍候...");

    setTimeout(() => {
      pageInstance.setData({
        stageSummary: "挂号建议已生成",
        taskDetail: "已推荐挂号科室",
        isAITyping: false,
      });

      pageInstance.replaceLastAIMessage(
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
      pageInstance.scrollToBottom();
    }, 2000);
  },

  // 结束导诊模式
  endGuideMode: (pageInstance) => {
    pageInstance.setData({
      stageSummary: "导诊完成",
      taskDetail: "感谢您的使用",
      isAITyping: true,
    });

    pageInstance.addMessage("ai", "🤔 AI 正在生成结束语...");

    setTimeout(() => {
      pageInstance.setData({ isAITyping: false });
      pageInstance.replaceLastAIMessage(
        `🎉 **导诊流程已完成**\n\n感谢您完成本次智能导诊！\n\n` +
          `✨ 祝您身体早日康复！\n\n` +
          `如果后续有任何健康问题，欢迎随时咨询。祝您生活愉快！`,
      );

      wx.showToast({ title: "导诊完成！", icon: "success", duration: 3000 });
      pageInstance.scrollToBottom();

      setTimeout(() => {
        pageInstance.exitGuideMode();
      }, 2000);
    }, 1500);
  },
};

// 导诊阶段配置
const GUIDE_STAGES = [
  {
    stageIndex: 0,
    stageName: "智能问诊",
    icon: "🩺",
    description: "通过多轮对话收集您的症状信息",
    tasks: [
      {
        taskIndex: 0,
        taskName: "主诉采集",
        detail: "请您详细描述主要症状，如疼痛部位、持续时间、严重程度等。",
        options: ["头痛发热", "胸闷气促", "腹痛腹泻", "皮疹瘙痒"],
        navigations: null,
        taskHandler: null,
      },
      {
        taskIndex: 1,
        taskName: "既往病史询问",
        detail: "请告知是否有慢性疾病、过敏史、近期用药情况等。",
        options: ["高血压", "糖尿病", "药物过敏", "无特殊病史"],
        navigations: null,
        taskHandler: null,
      },
      {
        taskIndex: 2,
        taskName: "生活习惯与旅行史",
        detail: "请提供您的生活习惯、近期旅行史等信息。",
        options: ["近期有长途旅行", "作息规律", "饮食偏油腻", "常熬夜"],
        navigations: null,
        taskHandler: null,
      },
      {
        taskIndex: 3,
        taskName: "分诊建议生成",
        detail: "需要我为您提供挂号服务吗？",
        options: ["需要", "不需要"],
        navigations: null,
        taskHandler: "generateTriageAdvice",
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
          { name: "挂号建议", url: "/pages/appointment/appointment" },
          { name: "报告", url: "/pages/report/report" },
        ],
        taskHandler: "generateAppointmentAdvice",
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
          { name: "室内导航", url: "/pages/navigation/navigation" },
        ],
        taskHandler: null,
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
        taskHandler: null,
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
          { name: "药学门诊导航", url: "/pages/pharmacy/pharmacy" },
        ],
        taskHandler: "endGuideMode",
      },
    ],
  },
];

module.exports = {
  guideStages: GUIDE_STAGES,
  taskHandlers: taskHandlers,
};
