const STEP_TYPES = {
  FIXED: "fixed",
  AI_PROCESSED: "ai_processed",
  DATA_PROCESSED: "data_processed",
};

const GUIDE_STAGES = [
  {
    stageIndex: 0,
    stageName: "情况资讯",
    icon: "📋",
    description: "采集您的症状信息",
    steps: [
      {
        stepIndex: 0,
        stepName: "主要症状",
        type: STEP_TYPES.FIXED,
        detail: "请问您哪里不舒服？请描述您的主要症状。",
        options: ["头痛", "发热", "腹痛", "胸闷", "其他症状"],
        pagelinks: null,
        handler: null,
        picture: null,
      },
      {
        stepIndex: 1,
        stepName: "症状详情",
        type: STEP_TYPES.FIXED,
        detail: "请问这个症状是什么时候开始的？持续了多久？",
        options: ["今天刚开始", "持续1-3天", "持续4-7天", "超过一周"],
        pagelinks: null,
        handler: null,
        picture: null,
      },
      {
        stepIndex: 2,
        stepName: "症状程度",
        type: STEP_TYPES.FIXED,
        detail: "请问症状的严重程度如何？",
        options: ["轻微", "中等", "严重", "非常严重"],
        pagelinks: null,
        handler: null,
        picture: null,
      },
    ],
  },
  {
    stageIndex: 1,
    stageName: "挂号服务",
    icon: "🏥",
    description: "根据症状为您推荐挂号科室",
    steps: [
      {
        stepIndex: 0,
        stepName: "生成挂号建议",
        type: STEP_TYPES.DATA_PROCESSED,
        detail: "AI正在分析您的症状，为您推荐合适的挂号科室...",
        options: [],
        pagelinks: [{ name: "前往挂号", handler: "gotoAppointmentPage" }],
        handler: "processAppointmentAdvice",
        picture: null,
      },
    ],
  },
  {
    stageIndex: 2,
    stageName: "科室导航",
    icon: "🗺️",
    description: "引导您前往挂号科室",
    steps: [
      {
        stepIndex: 0,
        stepName: "科室导航",
        type: STEP_TYPES.FIXED,
        detail:
          "已为您生成预约记录，是否需要开启科室导航？点击下方按钮开启导航",
        options: ["否", "是"],
        pagelinks: [
          {
            name: "科室导航",
            handler: "gotoDepartmentNavigationPage",
          },
        ],
        handler: null,
        picture: null,
      },
      {
        stepIndex: 1,
        stepName: "科室导航",
        type: STEP_TYPES.FIXED,
        detail: "从门诊大楼1楼进入后，请向左转，上扶梯，进入2楼",
        options: ["下一步"],
        pagelinks: [],
        handler: null,
        picture: "/images/department_navigation/电梯.jpg",
      },
      {
        stepIndex: 2,
        stepName: "科室导航",
        type: STEP_TYPES.FIXED,
        detail: "进入2楼之后。右转，回头进入前往三楼的扶梯，乘坐扶梯前往3楼后，左拐，前行6米后进入内科门诊区域，请在此处等待叫号",
        options: ["下一步"],
        pagelinks: [],
        handler: null,
        picture: "/images/department_navigation/内科.jpg",
      },
      {
        stepIndex: 3,
        stepName: "科室导航",
        type: STEP_TYPES.FIXED,
        detail: "医生开具检查单，准备前往血常规检查，请步行出内科诊室，向右前行20米，右转进入采血自助取号缴费区，在取号后继续向左前方长廊前行40米，可见门诊采血中心，请在此处等候采血。",
        options: ["下一步"],
        pagelinks: [],
        handler: null,
        picture: "/images/department_navigation/门诊采血中心.jpg",
      },
      {
        stepIndex: 4,
        stepName: "科室导航",
        type: STEP_TYPES.FIXED,
        detail: "在检查完成后，从采血门诊中心，出门直走30米，后左转20米后可见自助打印区，请在此打印检查报告单，打印完检查报告单后，请在手机app上进行复诊预约挂号，",
        options: ["下一步"],
        pagelinks: [],
        handler: null,
        picture: "/images/department_navigation/自助打印区.jpg",
      },
     
    
      {
        stepIndex: 5,
        stepName: "科室导航",
        type: STEP_TYPES.FIXED,
        detail: " 在取号后又左转出自助打印区，随后直行30m前往内科门诊b区进行复诊。",
        options: ["下一步"],
        pagelinks: [],
        handler: null,
        picture: "/images/department_navigation/内科.jpg",
      }

    ],
  },
  {
    stageIndex: 3,
    stageName: "完成就诊",
    icon: "👨‍⚕️",
    description: "等待医生就诊并获取诊断结果",
    steps: [
      {
        stepIndex: 0,
        stepName: "等待就诊",
        type: STEP_TYPES.FIXED,
        detail:
          "请前往取药，请步行出内科诊室，出门后向右乘坐扶梯前往2楼，下楼梯后向后方直行到头，前往自助服务区进行缴费，随后右转10m，前往取药自助排号区，取号后右侧即是门诊中心药房",
        options: ["下一步"],
        pagelinks: [{ name: "查看就诊记录", handler: "gotoUserInfoPage" }],
        handler: null,
        picture: "/images/department_navigation/取药自助排号区.jpg",
      },
    ],
  },
  {
    stageIndex: 4,
    stageName: "药房导航",
    icon: "💊",
    description: "引导您前往药房取药",
    steps: [
      {
        stepIndex: 0,
        stepName: "药房导航",
        type: STEP_TYPES.FIXED,
        detail: "（检测到复杂药物）检测到复杂药物处方，推荐前往药师门诊，进行咨询，拿取药物后，请向后行至扶梯口处，继续向前走20米，右侧即为药师门诊。",
        options: [],
        pagelinks: [
          {
            name: "药房导航",
            handler: "gotoPharmacyNavigationPage",
          },
        ],
        handler: null,
        picture:null
      }
    ],
  },


  {
    stageIndex: 5,
    stageName: "支付页面",
    icon: "💳",
    description: "完成支付并结束会话",
    steps: [
      {
        stepIndex: 0,
        stepName: "支付页面",
        type: STEP_TYPES.FIXED,
        detail: "请点击下方按钮前往支付页面完成支付。",
        options: [],
        pagelinks: [{ name: "前往支付", handler: null }],
        handler: null,
        picture:null
      },
      {
        stepIndex: 1,
        stepName: "确认支付完成",
        type: STEP_TYPES.DATA_PROCESSED,
        detail: "请问您已经完成支付了吗？",
        options: ["已完成支付", "尚未完成"],
        pagelinks: null,
        handler: "processPaymentCompletion",
        picture:null
      },
    ],
  },
];

class StepProcessor {
  constructor() {
    this.processors = {
      [STEP_TYPES.FIXED]: this.processFixedStep.bind(this),
      [STEP_TYPES.AI_PROCESSED]: this.processAIStep.bind(this),
      [STEP_TYPES.DATA_PROCESSED]: this.processDataStep.bind(this),
    };
  }

  async processStep(pageInstance, step, stageIndex, stepIndex) {
    const processor = this.processors[step.type];
    if (processor) {
      return await processor(pageInstance, step, stageIndex, stepIndex);
    }
    console.error(`未知的步骤类型: ${step.type}`);
    return null;
  }

  async processFixedStep(pageInstance, step) {
    pageInstance.addMessage(
      "ai",
      step.detail,
      step.options,
      step.pagelinks,
      step.picture,
    );
    return {
      success: true,
      message: step.detail,
      options: step.options,
      pagelinks: step.pagelinks,
      picture: step.picture,
    };
  }

  async processAIStep(pageInstance, step) {
    pageInstance.setData({ isProcessing: true });
    pageInstance.addMessage("ai", "🤔 AI 正在分析中...");

    try {
      const { sessionRecords } = pageInstance.data;
      const context = this.buildContext(sessionRecords);
      const aiResult = await this.callAI(context, step);

      pageInstance.setData({ isProcessing: false });
      pageInstance.replaceLastAIMessage(
        aiResult,
        step.options,
        step.pagelinks,
        step.picture,
      );

      return {
        success: true,
        message: aiResult,
        options: step.options,
        pagelinks: step.pagelinks,
        picture: step.picture,
      };
    } catch (error) {
      console.error("AI处理失败:", error);
      pageInstance.setData({ isProcessing: false });
      pageInstance.replaceLastAIMessage("抱歉，AI服务暂时不可用，请稍后重试。");
      return {
        success: false,
        message: "AI处理失败",
      };
    }
  }

  async processDataStep(pageInstance, step, stageIndex, stepIndex) {
    if (step.handler && stepHandlers[step.handler]) {
      return await stepHandlers[step.handler](
        pageInstance,
        step,
        stageIndex,
        stepIndex,
      );
    }
    return this.processFixedStep(pageInstance, step);
  }

  buildContext(sessionRecords) {
    return sessionRecords.map((record) => ({
      question: record.question,
      response: record.response,
    }));
  }

  async callAI(context, step) {
    const { callAIModel } = require("../../utils/aiUtils.js");
    const prompt = this.buildPrompt(context, step);
    return await callAIModel(prompt);
  }

  buildPrompt(context, step) {
    let prompt = `请根据以下对话历史和当前任务，生成下一步的响应：\n\n`;

    context.forEach((item) => {
      prompt += `Q: ${item.question}\nA: ${item.response}\n\n`;
    });

    prompt += `当前任务: ${step.detail}\n\n`;
    prompt += `请生成一个专业、友好的响应，帮助用户完成当前步骤。`;

    return prompt;
  }
}

const stepHandlers = {
  async processAppointmentAdvice(pageInstance, step) {
    const { sessionRecords } = pageInstance.data;

    pageInstance.setData({ isProcessing: true });
    pageInstance.addMessage(
      "ai",
      "🤔 AI 正在分析您的症状，为您推荐挂号科室...",
    );

    return new Promise((resolve) => {
      setTimeout(() => {
        const mainSymptom =
          sessionRecords.find((r) => r.stepName === "主要症状")?.response ||
          "未知";
        const symptomDetail =
          sessionRecords.find((r) => r.stepName === "症状详情")?.response ||
          "未知";
        const symptomSeverity =
          sessionRecords.find((r) => r.stepName === "症状程度")?.response ||
          "未知";

        let recommendedDepartment = "内科";
        let doctorType = "普通号";
        let estimatedWaitTime = "15-30分钟";

        if (mainSymptom.includes("头痛") || mainSymptom.includes("发热")) {
          recommendedDepartment = "内科";
        } else if (mainSymptom.includes("腹痛")) {
          recommendedDepartment = "消化内科";
        } else if (mainSymptom.includes("胸闷")) {
          recommendedDepartment = "心内科";
        } else if (
          mainSymptom.includes("咳嗽") ||
          mainSymptom.includes("呼吸困难")
        ) {
          recommendedDepartment = "呼吸内科";
        } else if (
          mainSymptom.includes("关节") ||
          mainSymptom.includes("骨骼")
        ) {
          recommendedDepartment = "骨科";
        }

        if (symptomSeverity === "严重" || symptomSeverity === "非常严重") {
          doctorType = "专家号";
          estimatedWaitTime = "30-60分钟";
        }

        const message =
          `📋 **挂号建议**\n\n根据您的症状分析，建议您挂：\n\n` +
          `• **推荐科室**：${recommendedDepartment}\n` +
          `• **医生类型**：${doctorType}\n` +
          `• **预计等待时间**：${estimatedWaitTime}\n\n` +
          `您的症状信息：\n` +
          `• 主要症状：${mainSymptom}\n` +
          `• 持续时间：${symptomDetail}\n` +
          `• 严重程度：${symptomSeverity}\n\n` +
          `如需预约，请点击下方的"前往挂号"按钮。`;

        pageInstance.setData({ isProcessing: false });
        pageInstance.replaceLastAIMessage(
          message,
          ["完成挂号"],
          step.pagelinks,
          step.picture,
        );

        pageInstance.saveAppointmentRecommendation({
          department: recommendedDepartment,
          doctorType: doctorType,
          mainSymptom: mainSymptom,
          symptomDetail: symptomDetail,
          symptomSeverity: symptomSeverity,
        });

        wx.showToast({
          title: "挂号建议已生成",
          icon: "success",
          duration: 2000,
        });
        pageInstance.scrollToBottom();

        resolve({
          success: true,
          message: message,
          options: [],
          pagelinks: step.pagelinks,
          picture: step.picture,
        });
      }, 2000);
    });
  },

  async processVisitCompletion(pageInstance, step) {
    const { pendingUserInput } = pageInstance.data;

    if (pendingUserInput === "已完成就诊") {
      pageInstance.setData({ isProcessing: true });
      pageInstance.addMessage("ai", "🤔 正在同步就诊结果...");

      return new Promise((resolve) => {
        setTimeout(() => {
          const visitResult = {
            visitDate: new Date().toISOString(),
            diagnosis: "上呼吸道感染",
            prescription: ["阿莫西林胶囊", "布洛芬缓释片", "感冒清热颗粒"],
            doctorAdvice: "注意休息，多喝水，按时服药，如有不适及时就医。",
          };

          pageInstance.saveVisitResult(visitResult);

          const message =
            `✅ **就诊已完成**\n\n您的就诊结果已同步到个人信息中：\n\n` +
            `• 诊断结果：${visitResult.diagnosis}\n` +
            `• 处方药品：${visitResult.prescription.join("、")}\n` +
            `• 医嘱：${visitResult.doctorAdvice}\n\n` +
            `您可以在个人中心查看详细的就诊记录。`;

          pageInstance.setData({ isProcessing: false });
          pageInstance.replaceLastAIMessage(message);

          wx.showToast({
            title: "就诊结果已同步",
            icon: "success",
            duration: 2000,
          });
          pageInstance.scrollToBottom();

          resolve({
            success: true,
            message: message,
            options: [],
            pagelinks: null,
          });
        }, 1500);
      });
    } else {
      const message = "好的，请您继续等待就诊。完成就诊后请告诉我。";
      pageInstance.addMessage("ai", message);
      pageInstance.scrollToBottom();

      return {
        success: true,
        message: message,
        options: [],
        pagelinks: null,
      };
    }
  },

  async processPaymentCompletion(pageInstance, step) {
    const { pendingUserInput } = pageInstance.data;

    if (pendingUserInput === "已完成支付") {
      pageInstance.setData({ isProcessing: true });
      pageInstance.addMessage("ai", "🤔 正在确认支付状态...");

      return new Promise((resolve) => {
        setTimeout(() => {
          const message =
            `🎉 **支付已完成**\n\n感谢您的使用！\n\n` +
            `✨ 祝您身体早日康复！\n\n` +
            `如果后续有任何健康问题，欢迎随时咨询。`;

          pageInstance.setData({ isProcessing: false });
          pageInstance.replaceLastAIMessage(message);

          wx.showToast({
            title: "支付已完成",
            icon: "success",
            duration: 2000,
          });
          pageInstance.scrollToBottom();

          setTimeout(() => {
            pageInstance.exitGuideMode();
          }, 3000);

          resolve({
            success: true,
            message: message,
            options: [],
            pagelinks: null,
          });
        }, 1500);
      });
    } else {
      const message = "好的，请您完成支付后告诉我。";
      pageInstance.addMessage("ai", message);
      pageInstance.scrollToBottom();

      return {
        success: true,
        message: message,
        options: [],
        pagelinks: null,
      };
    }
  },
};

const stepProcessor = new StepProcessor();

module.exports = {
  guideStages: GUIDE_STAGES,
  stepProcessor: stepProcessor,
  STEP_TYPES: STEP_TYPES,
};
