/**
 * 用户信息管理模块
 * 直接操作本地 js 文件中的用户数据
 */

import userData from "../resources/userData.js";

/**
 * 获取用户基本信息
 * @returns {Object} 用户基本信息
 */
export function getUserProfile() {
  return userData.profile || {
    name: '',
    gender: '',
    age: '',
    idCard: '',
    phone: '',
    address: '',
    emergencyContact: ''
  };
}

/**
 * 保存用户基本信息
 * @param {Object} profile 用户基本信息
 * @returns {boolean} 保存是否成功
 */
export function saveUserProfile(profile) {
  try {
    userData.profile = { ...profile };
    userData.meta.lastUpdated = new Date().toISOString();
    return true;
  } catch (error) {
    console.error('保存用户信息失败:', error);
    return false;
  }
}

/**
 * 获取用户健康信息
 * @returns {Object} 用户健康信息
 */
export function getHealthInfo() {
  return userData.healthInfo || {
    bloodType: '',
    allergies: [],
    chronicDiseases: [],
    medications: [],
    height: '',
    weight: '',
    bloodPressure: ''
  };
}

/**
 * 保存用户健康信息
 * @param {Object} healthInfo 用户健康信息
 * @returns {boolean} 保存是否成功
 */
export function saveHealthInfo(healthInfo) {
  try {
    userData.healthInfo = { ...healthInfo };
    userData.meta.lastUpdated = new Date().toISOString();
    return true;
  } catch (error) {
    console.error('保存健康信息失败:', error);
    return false;
  }
}

/**
 * 获取预约记录
 * @returns {Array} 预约记录列表
 */
export function getAppointmentRecords() {
  return userData.appointments || [];
}

/**
 * 保存预约记录
 * @param {Array} records 预约记录列表
 * @returns {boolean} 保存是否成功
 */
export function saveAppointmentRecords(records) {
  try {
    userData.appointments = [...records];
    userData.meta.lastUpdated = new Date().toISOString();
    return true;
  } catch (error) {
    console.error('保存预约记录失败:', error);
    return false;
  }
}

/**
 * 添加预约记录
 * @param {Object} record 预约记录
 * @returns {boolean} 添加是否成功
 */
export function addAppointmentRecord(record) {
  try {
    userData.appointments.unshift({
      ...record,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    });
    userData.meta.lastUpdated = new Date().toISOString();
    return true;
  } catch (error) {
    console.error('添加预约记录失败:', error);
    return false;
  }
}

/**
 * 获取对话历史
 * @returns {Array} 对话历史列表
 */
export function getChatHistory() {
  return userData.chatHistory || [];
}

/**
 * 保存对话历史
 * @param {Array} history 对话历史列表
 * @returns {boolean} 保存是否成功
 */
export function saveChatHistory(history) {
  try {
    userData.chatHistory = [...history];
    userData.meta.lastUpdated = new Date().toISOString();
    return true;
  } catch (error) {
    console.error('保存对话历史失败:', error);
    return false;
  }
}

/**
 * 添加对话记录
 * @param {Object} message 对话消息
 * @returns {boolean} 添加是否成功
 */
export function addChatMessage(message) {
  try {
    userData.chatHistory.push({
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    });
    // 限制历史记录数量，防止存储过大
    if (userData.chatHistory.length > 100) {
      userData.chatHistory.splice(0, userData.chatHistory.length - 100);
    }
    userData.meta.lastUpdated = new Date().toISOString();
    return true;
  } catch (error) {
    console.error('添加对话记录失败:', error);
    return false;
  }
}

/**
 * 清除所有用户数据
 * @returns {boolean} 清除是否成功
 */
export function clearAllUserData() {
  try {
    userData.profile = {
      name: '',
      gender: '',
      age: '',
      idCard: '',
      phone: '',
      address: '',
      emergencyContact: ''
    };
    
    userData.healthInfo = {
      bloodType: '',
      allergies: [],
      chronicDiseases: [],
      medications: [],
      height: '',
      weight: '',
      bloodPressure: ''
    };
    
    userData.appointments = [];
    userData.chatHistory = [];
    userData.meta.lastUpdated = new Date().toISOString();
    
    return true;
  } catch (error) {
    console.error('清除用户数据失败:', error);
    return false;
  }
}

/**
 * 获取完整用户信息
 * @returns {Object} 完整用户信息
 */
export function getCompleteUserInfo() {
  return {
    profile: getUserProfile(),
    healthInfo: getHealthInfo(),
    appointments: getAppointmentRecords(),
    chatHistory: getChatHistory(),
    meta: userData.meta
  };
}

/**
 * 重置用户数据为默认值
 * @returns {boolean} 重置是否成功
 */
export function resetUserData() {
  try {
    // 重置为默认测试数据
    userData.profile = {
      name: "张三",
      gender: "男",
      age: 35,
      idCard: "420106198912345678",
      phone: "13800138000",
      address: "湖北省武汉市洪山区光谷大道123号",
      emergencyContact: "李四 13900139000"
    };
    
    userData.healthInfo = {
      bloodType: "A型",
      allergies: ["青霉素", "花生"],
      chronicDiseases: ["高血压"],
      medications: ["降压药每日一次"],
      height: "175cm",
      weight: "70kg",
      bloodPressure: "130/85"
    };
    
    userData.appointments = [
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
    ];
    
    userData.chatHistory = [
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
    ];
    
    userData.meta.lastUpdated = new Date().toISOString();
    
    return true;
  } catch (error) {
    console.error('重置用户数据失败:', error);
    return false;
  }
}
