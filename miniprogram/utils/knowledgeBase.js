// 知识库 - 用于RAG检索
// 每个条目包含：关键词、问题、答案、相关链接

const KNOWLEDGE_BASE = [
  {
    keywords: ["挂号", "预约", "看病", "门诊"],
    question: "如何挂号预约？",
    answer:
      '您可以通过以下方式挂号预约：\n1. 在小程序内点击"挂号"功能\n2. 选择科室和医生\n3. 填写个人信息并预约\n4. 支付后完成预约',
    links: [
      {
        name: "立即挂号",
        url: "gotoAppointmentPage",
        icon: "🏥",
      },
    ],
  },
  {
    keywords: ["导航", "路线", "怎么走", "位置"],
    question: "医院在哪里？怎么走？",
    answer:
      '我院有多个院区：\n1. 汉口院区：武汉市江汉区解放大道1095号\n2. 光谷院区：武汉市洪山区光谷大道3号\n3. 中法院区：武汉市蔡甸区东风大道8号\n4. 军山医院：武汉经济技术开发区军山街\n\n进入医院后，可点击"科室导航"功能获取室内导航',
    links: [
      {
        name: "科室导航",
        url: "gotoDepartmentNavigationPage",
        icon: "🗺️",
      },
      {
        name: "药房导航",
        url: "gotoPharmacyNavigationPage",
        icon: "💊",
      },
    ],
  },
  {
    keywords: ["科室", "内科", "外科", "妇科", "儿科"],
    question: "有哪些科室？",
    answer:
      "我院开设以下科室：\n1. 内科：心血管内科、呼吸内科、消化内科、神经内科、内分泌科等\n2. 外科：普通外科、骨科、心胸外科、泌尿外科、神经外科\n3. 妇产科：妇科、产科、生殖医学中心\n4. 儿科：儿科门诊、儿童保健科、新生儿科\n5. 眼科、耳鼻喉科、口腔科、皮肤科等",
    links: [
      {
        name: "选择科室",
        url: "gotoAppointmentPage",
        icon: "🩺",
      },
    ],
  },
  {
    keywords: ["检查", "化验", "血常规", "B超"],
    question: "如何进行检查化验？",
    answer:
      "检查化验流程：\n1. 医生开具检查单\n2. 前往检查科室排队取号\n3. 进行检查（血常规、B超、CT等）\n4. 检查完成后等待结果\n5. 返回医生处解读结果\n\n血常规检查位于门诊采血中心",
    links: [
      {
        name: "查看检查指南",
        url: "gotoHealthInfoPage",
        icon: "📊",
      },
    ],
  },
  {
    keywords: ["取药", "药房", "药品", "处方"],
    question: "如何取药？",
    answer:
      "取药流程：\n1. 医生开具处方\n2. 前往缴费窗口或自助机缴费\n3. 持缴费凭证前往药房取药\n4. 药师核对后交付药品\n\n如有疑问，可前往药师门诊咨询",
    links: [
      {
        name: "药房导航",
        url: "gotoPharmacyNavigationPage",
        icon: "💊",
      },
    ],
  },
  {
    keywords: ["报告", "检查报告", "结果", "查询"],
    question: "如何查询检查报告？",
    answer:
      "查询检查报告方式：\n1. 在手机APP上进行复诊预约后可查看报告\n2. 自助打印区打印纸质报告\n3. 咨询医生解读报告\n\n打印地点：门诊自助服务区",
    links: [
      {
        name: "查看就诊记录",
        url: "gotoAppointmentRecordsPage",
        icon: "📄",
      },
    ],
  },
  {
    keywords: ["费用", "价格", "收费", "报销"],
    question: "费用如何计算？",
    answer:
      "费用说明：\n1. 普通号：50-100元\n2. 专家号：100-300元\n3. 检查费用根据项目不同而异\n4. 医保患者可持医保卡享受报销\n5. 自费患者需全额支付\n\n具体费用请咨询收费窗口或查看缴费记录",
    links: [
      {
        name: "缴费记录",
        url: "gotoUserInfoPage",
        icon: "💳",
      },
    ],
  },
  {
    keywords: ["急诊", "急救", "紧急", "危险"],
    question: "急诊服务如何？",
    answer:
      "急诊服务：\n24小时开放，处理急危重症患者\n地址：各院区门诊大楼1楼\n电话：各院区急诊科电话请拨打医院总机\n\n如遇严重症状，请立即前往急诊科",
    links: [
      {
        name: "急诊指南",
        url: "gotoHealthInfoPage",
        icon: "🚑",
      },
    ],
  },
  {
    keywords: ["健康档案", "体检", "健康", "病历"],
    question: "如何管理健康档案？",
    answer:
      '健康档案功能：\n1. 记录您的就诊历史\n2. 存储检查报告\n3. 跟踪慢性病管理\n4. 预约提醒\n5. 健康资讯推送\n\n点击"健康档案"功能可查看和管理您的健康信息',
    links: [
      {
        name: "健康档案",
        url: "gotoHealthInfoPage",
        icon: "❤️",
      },
    ],
  },
  {
    keywords: ["医生", "专家", "主治", "职称"],
    question: "如何选择医生？",
    answer:
      "选择医生建议：\n1. 普通号：常见疾病、复诊\n2. 专家号：复杂疾病、首次就诊\n3. 主任/副主任医师：经验丰富\n4. 主治医师：中坚力量\n5. 根据病情和紧急程度选择",
    links: [
      {
        name: "选择医生",
        url: "gotoAppointmentPage",
        icon: "👨‍⚕️",
      },
    ],
  },
  {
    keywords: ["时间", "排班", "上班", "门诊时间"],
    question: "门诊时间是什么时候？",
    answer:
      "门诊时间：\n上午：8:00-11:30\n下午：14:00-17:00\n晚上：18:00-20:00（部分科室）\n急诊：24小时\n\n节假日正常开诊，具体排班请查看预约页面",
    links: [
      {
        name: "预约挂号",
        url: "gotoAppointmentPage",
        icon: "📅",
      },
    ],
  },
];

// 检索函数
function retrieveRelevantKnowledge(query, topK = 3) {
  if (!query || typeof query !== "string") {
    return [];
  }

  const queryLower = query.toLowerCase();
  const keywords = queryLower
    .split(/[\s,，。！？;；:：]+/)
    .filter((word) => word.length > 1);

  const scoredItems = KNOWLEDGE_BASE.map((item) => {
    let score = 0;

    // 关键词匹配
    item.keywords.forEach((keyword) => {
      if (queryLower.includes(keyword.toLowerCase())) {
        score += 3;
      }
    });

    // 问题匹配
    if (item.question.toLowerCase().includes(queryLower)) {
      score += 5;
    }

    // 答案匹配
    if (item.answer.toLowerCase().includes(queryLower)) {
      score += 2;
    }

    return { ...item, score };
  });

  // 排序并返回前K个
  return scoredItems
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// 格式化知识库条目为字符串
function formatKnowledgeAsString(knowledgeItems) {
  if (!knowledgeItems || knowledgeItems.length === 0) {
    return "";
  }

  let result = "\n【相关知识库信息】\n\n";

  knowledgeItems.forEach((item, index) => {
    result += `${index + 1}. ${item.question}\n`;
    result += `答案：${item.answer}\n`;

    if (item.links && item.links.length > 0) {
      result += "相关功能：\n";
      item.links.forEach((link) => {
        result += `   ${link.icon} ${link.name}\n`;
      });
    }
    result += "\n";
  });

  return result;
}

// 获取相关链接
function getRelevantLinks(knowledgeItems) {
  if (!knowledgeItems || knowledgeItems.length === 0) {
    return [];
  }

  const allLinks = [];
  knowledgeItems.forEach((item) => {
    if (item.links && item.links.length > 0) {
      item.links.forEach((link) => {
        if (!allLinks.find((l) => l.name === link.name)) {
          allLinks.push({
            name: link.name,
            handler: link.url,
            icon: link.icon || "🔗",
          });
        }
      });
    }
  });

  return allLinks.slice(0, 5); // 最多返回5个链接
}

module.exports = {
  KNOWLEDGE_BASE,
  retrieveRelevantKnowledge,
  formatKnowledgeAsString,
  getRelevantLinks,
};
