/**
 * 本地用户数据存储
 * 用于本地开发和测试，直接作为数据源使用
 */

// 导出可修改的用户数据对象
let userData = {
  // 用户基本信息
  profile: {
    name: "张三",
    gender: "男",
    age: 35,
    idCard: "420106198912345678",
    phone: "13800138000",
    address: "湖北省武汉市洪山区光谷大道123号",
    emergencyContact: "李四 13900139000"
  },
  
  // 用户健康信息
  healthInfo: {
    bloodType: "A型",
    allergies: ["青霉素", "花生"],
    chronicDiseases: ["高血压"],
    medications: ["降压药每日一次"],
    height: "175cm",
    weight: "70kg",
    bloodPressure: "130/85"
  },
  
  // 预约记录
  appointments: [
    {
      id: "apt_001",
      userId: "张三",
      userInfo: {
        name: "张三",
        gender: "男",
        age: 35,
        phone: "13800138000"
      },
      hospitalName: "汉口院区",
      department: "内科-心血管内科",
      doctorName: "王医生",
      timeSlot: "2026-03-10 09:00",
      createTime: 1709452800000,
      status: "confirmed",
      createdAt: "2026-03-01T10:00:00.000Z"
    },
    {
      id: "apt_002",
      userId: "张三",
      userInfo: {
        name: "张三",
        gender: "男",
        age: 35,
        phone: "13800138000"
      },
      hospitalName: "光谷院区",
      department: "外科-骨科",
      doctorName: null,
      timeSlot: null,
      createTime: 1709539200000,
      status: "pending",
      createdAt: "2026-03-02T14:30:00.000Z"
    }
  ],
  
  // 对话历史
  chatHistory: [
    {
      id: "msg_001",
      speaker: "ai",
      content: "您好！我是AI健康助手，请问您哪里不舒服？",
      options: ["头痛", "发热", "腹痛", "胸闷", "其他症状"],
      pagelinks: [],
      timestamp: "2026-03-01T09:00:00.000Z"
    },
    {
      id: "msg_002",
      speaker: "user",
      content: "头痛",
      timestamp: "2026-03-01T09:01:00.000Z"
    },
    {
      id: "msg_003",
      speaker: "ai",
      content: "请问这个症状是什么时候开始的？持续了多久？",
      options: ["今天刚开始", "持续1-3天", "持续4-7天", "超过一周"],
      pagelinks: [],
      timestamp: "2026-03-01T09:01:30.000Z"
    },
    {
      id: "msg_004",
      speaker: "user",
      content: "持续1-3天",
      timestamp: "2026-03-01T09:02:00.000Z"
    },
    {
      id: "msg_005",
      speaker: "ai",
      content: "📋 **挂号建议**\n\n根据您的症状分析，建议您挂：\n\n• **推荐科室**：内科\n• **医生类型**：普通号\n• **预计等待时间**：15-30分钟\n\n如需预约，请点击下方的\"前往挂号\"按钮。",
      options: [],
      pagelinks: [{ name: "前往挂号", handler: "gotoAppointmentPage" }],
      timestamp: "2026-03-01T09:05:00.000Z"
    }
  ],
  
  // 元数据
  meta: {
    version: "1.0.0",
    lastUpdated: new Date().toISOString()
  }
};

// 导出用户数据
export default userData;
