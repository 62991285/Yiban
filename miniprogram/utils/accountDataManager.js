/**
 * 账户数据管理模块
 * 统一管理用户账户相关数据：基本信息、健康记录、预约记录、对话记录等
 * 使用本地存储 wx.setStorageSync 和 wx.getStorageSync
 */

const STORAGE_KEYS = {
  PROFILE: "user_profile",
  PREFERENCES: "user_preferences",
  HEALTH_INFO: "user_healthInfo",
  HEALTH_CONDITIONS: "user_healthConditions",
  MEDICATIONS_CURRENT: "user_medicationsCurrent",
  MEDICATIONS_HISTORY: "user_medicationsHistory",
  HEALTH_RECORDS: "user_healthRecords",
  APPOINTMENTS: "user_appointments",
  CHAT_HISTORY: "user_chatHistory",
  VISIT_RECORDS: "user_visitRecords",
  NOTIFICATIONS: "user_notifications",
  PAGE_DATA: "page_data",
};

/**
 * 保存用户基本信息
 * @param {Object} profile 用户基本信息
 * @returns {boolean} 保存是否成功
 */
export function setProfile(profile) {
  try {
    wx.setStorageSync(STORAGE_KEYS.PROFILE, profile);
    return true;
  } catch (error) {
    console.error("保存基本信息失败:", error);
    return false;
  }
}

/**
 * 获取用户基本信息
 * @returns {Object} 用户基本信息
 */
export function getProfile() {
  try {
    return (
      wx.getStorageSync(STORAGE_KEYS.PROFILE) || {
        name: "",
        gender: "",
        age: "",
        idCard: "",
        phone: "",
        address: "",
        emergencyContact: "",
      }
    );
  } catch (error) {
    console.error("获取基本信息失败:", error);
    return {
      name: "",
      gender: "",
      age: "",
      idCard: "",
      phone: "",
      address: "",
      emergencyContact: "",
    };
  }
}

/**
 * 保存用户偏好设置
 * @param {Object} preferences 用户偏好设置
 * @returns {boolean} 保存是否成功
 */
export function setPreferences(preferences) {
  try {
    wx.setStorageSync(STORAGE_KEYS.PREFERENCES, preferences);
    return true;
  } catch (error) {
    console.error("保存偏好设置失败:", error);
    return false;
  }
}

/**
 * 获取用户偏好设置
 * @returns {Object} 用户偏好设置
 */
export function getPreferences() {
  try {
    return (
      wx.getStorageSync(STORAGE_KEYS.PREFERENCES) || {
        language: "zh-CN",
        theme: "default",
        notifications: true,
      }
    );
  } catch (error) {
    console.error("获取偏好设置失败:", error);
    return {
      language: "zh-CN",
      theme: "default",
      notifications: true,
    };
  }
}

/**
 * 保存用户健康基础信息
 * @param {Object} healthInfo 用户健康基础信息
 * @returns {boolean} 保存是否成功
 */
export function setHealthInfo(healthInfo) {
  try {
    wx.setStorageSync(STORAGE_KEYS.HEALTH_INFO, healthInfo);
    return true;
  } catch (error) {
    console.error("保存健康基础信息失败:", error);
    return false;
  }
}

/**
 * 获取用户健康基础信息
 * @returns {Object} 用户健康基础信息
 */
export function getHealthInfo() {
  try {
    return (
      wx.getStorageSync(STORAGE_KEYS.HEALTH_INFO) || {
        bloodType: "",
        height: "",
        weight: "",
        bloodPressure: "",
        heartRate: "",
      }
    );
  } catch (error) {
    console.error("获取健康基础信息失败:", error);
    return {
      bloodType: "",
      height: "",
      weight: "",
      bloodPressure: "",
      heartRate: "",
    };
  }
}

/**
 * 保存用户健康状况
 * @param {Object} healthConditions 用户健康状况
 * @returns {boolean} 保存是否成功
 */
export function setHealthConditions(healthConditions) {
  try {
    wx.setStorageSync(STORAGE_KEYS.HEALTH_CONDITIONS, healthConditions);
    return true;
  } catch (error) {
    console.error("保存健康状况失败:", error);
    return false;
  }
}

/**
 * 获取用户健康状况
 * @returns {Object} 用户健康状况
 */
export function getHealthConditions() {
  try {
    return (
      wx.getStorageSync(STORAGE_KEYS.HEALTH_CONDITIONS) || {
        allergies: [],
        chronicDiseases: [],
        pastIllnesses: [],
      }
    );
  } catch (error) {
    console.error("获取健康状况失败:", error);
    return {
      allergies: [],
      chronicDiseases: [],
      pastIllnesses: [],
    };
  }
}

/**
 * 保存当前用药记录
 * @param {Array} medications 当前用药记录
 * @returns {boolean} 保存是否成功
 */
export function setMedicationsCurrent(medications) {
  try {
    wx.setStorageSync(STORAGE_KEYS.MEDICATIONS_CURRENT, medications);
    return true;
  } catch (error) {
    console.error("保存当前用药记录失败:", error);
    return false;
  }
}

/**
 * 添加当前用药记录
 * @param {Object} medication 用药记录
 * @returns {boolean} 添加是否成功
 */
export function addMedicationsCurrent(medication) {
  try {
    const medications = getMedicationsCurrent();
    medications.push({
      ...medication,
      id: Date.now().toString(),
      addedAt: new Date().toISOString(),
    });
    wx.setStorageSync(STORAGE_KEYS.MEDICATIONS_CURRENT, medications);
    return true;
  } catch (error) {
    console.error("添加当前用药记录失败:", error);
    return false;
  }
}

/**
 * 获取当前用药记录
 * @returns {Array} 当前用药记录
 */
export function getMedicationsCurrent() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.MEDICATIONS_CURRENT) || [];
  } catch (error) {
    console.error("获取当前用药记录失败:", error);
    return [];
  }
}

/**
 * 保存历史用药记录
 * @param {Array} medications 历史用药记录
 * @returns {boolean} 保存是否成功
 */
export function setMedicationsHistory(medications) {
  try {
    wx.setStorageSync(STORAGE_KEYS.MEDICATIONS_HISTORY, medications);
    return true;
  } catch (error) {
    console.error("保存历史用药记录失败:", error);
    return false;
  }
}

/**
 * 添加历史用药记录
 * @param {Object} medication 用药记录
 * @returns {boolean} 添加是否成功
 */
export function addMedicationsHistory(medication) {
  try {
    const medications = getMedicationsHistory();
    medications.push({
      ...medication,
      id: Date.now().toString(),
      addedAt: new Date().toISOString(),
    });
    wx.setStorageSync(STORAGE_KEYS.MEDICATIONS_HISTORY, medications);
    return true;
  } catch (error) {
    console.error("添加历史用药记录失败:", error);
    return false;
  }
}

/**
 * 获取历史用药记录
 * @returns {Array} 历史用药记录
 */
export function getMedicationsHistory() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.MEDICATIONS_HISTORY) || [];
  } catch (error) {
    console.error("获取历史用药记录失败:", error);
    return [];
  }
}

/**
 * 保存健康记录
 * @param {Array} records 健康记录
 * @returns {boolean} 保存是否成功
 */
export function setHealthRecords(records) {
  try {
    wx.setStorageSync(STORAGE_KEYS.HEALTH_RECORDS, records);
    return true;
  } catch (error) {
    console.error("保存健康记录失败:", error);
    return false;
  }
}

/**
 * 添加健康记录
 * @param {Object} record 健康记录
 * @returns {boolean} 添加是否成功
 */
export function addHealthRecord(record) {
  try {
    const records = getHealthRecords();
    records.push({
      ...record,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    });
    wx.setStorageSync(STORAGE_KEYS.HEALTH_RECORDS, records);
    return true;
  } catch (error) {
    console.error("添加健康记录失败:", error);
    return false;
  }
}

/**
 * 获取健康记录
 * @returns {Array} 健康记录列表
 */
export function getHealthRecords() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.HEALTH_RECORDS) || [];
  } catch (error) {
    console.error("获取健康记录失败:", error);
    return [];
  }
}

/**
 * 保存预约记录
 * @param {Array} appointments 预约记录列表
 * @returns {boolean} 保存是否成功
 */
export function setAppointments(appointments) {
  try {
    wx.setStorageSync(STORAGE_KEYS.APPOINTMENTS, appointments);
    return true;
  } catch (error) {
    console.error("保存预约记录失败:", error);
    return false;
  }
}

/**
 * 添加预约记录
 * @param {Object} appointment 预约记录
 * @returns {boolean} 添加是否成功
 */
export function addAppointment(appointment) {
  try {
    const appointments = getAppointments();
    appointments.unshift({
      ...appointment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    });
    wx.setStorageSync(STORAGE_KEYS.APPOINTMENTS, appointments);
    return true;
  } catch (error) {
    console.error("添加预约记录失败:", error);
    return false;
  }
}

/**
 * 获取预约记录
 * @returns {Array} 预约记录列表
 */
export function getAppointments() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.APPOINTMENTS) || [];
  } catch (error) {
    console.error("获取预约记录失败:", error);
    return [];
  }
}

/**
 * 保存对话历史
 * @param {Array} chatHistory 对话历史列表
 * @returns {boolean} 保存是否成功
 */
export function setChatHistory(chatHistory) {
  try {
    wx.setStorageSync(STORAGE_KEYS.CHAT_HISTORY, chatHistory);
    return true;
  } catch (error) {
    console.error("保存对话历史失败:", error);
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
    let chatHistory = getChatHistory();
    chatHistory.push({
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    });
    // 限制历史记录数量，防止存储过大
    if (chatHistory.length > 100) {
      chatHistory = chatHistory.slice(-100);
    }
    wx.setStorageSync(STORAGE_KEYS.CHAT_HISTORY, chatHistory);
    return true;
  } catch (error) {
    console.error("添加对话记录失败:", error);
    return false;
  }
}

/**
 * 获取对话历史
 * @returns {Array} 对话历史列表
 */
export function getChatHistory() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.CHAT_HISTORY) || [];
  } catch (error) {
    console.error("获取对话历史失败:", error);
    return [];
  }
}

/**
 * 保存就诊记录
 * @param {Array} records 就诊记录列表
 * @returns {boolean} 保存是否成功
 */
export function setVisitRecords(records) {
  try {
    wx.setStorageSync(STORAGE_KEYS.VISIT_RECORDS, records);
    return true;
  } catch (error) {
    console.error("保存就诊记录失败:", error);
    return false;
  }
}

/**
 * 添加就诊记录
 * @param {Object} record 就诊记录
 * @returns {boolean} 添加是否成功
 */
export function addVisitRecord(record) {
  try {
    const records = getVisitRecords();
    records.push({
      ...record,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    });
    wx.setStorageSync(STORAGE_KEYS.VISIT_RECORDS, records);
    return true;
  } catch (error) {
    console.error("添加就诊记录失败:", error);
    return false;
  }
}

/**
 * 获取就诊记录
 * @returns {Array} 就诊记录列表
 */
export function getVisitRecords() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.VISIT_RECORDS) || [];
  } catch (error) {
    console.error("获取就诊记录失败:", error);
    return [];
  }
}

/**
 * 保存通知消息
 * @param {Array} notifications 通知消息列表
 * @returns {boolean} 保存是否成功
 */
export function setNotifications(notifications) {
  try {
    wx.setStorageSync(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return true;
  } catch (error) {
    console.error("保存通知消息失败:", error);
    return false;
  }
}

/**
 * 添加通知消息
 * @param {Object} notification 通知消息
 * @returns {boolean} 添加是否成功
 */
export function addNotification(notification) {
  try {
    const notifications = getNotifications();
    notifications.unshift({
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    });
    wx.setStorageSync(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return true;
  } catch (error) {
    console.error("添加通知消息失败:", error);
    return false;
  }
}

/**
 * 获取通知消息
 * @returns {Array} 通知消息列表
 */
export function getNotifications() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.NOTIFICATIONS) || [];
  } catch (error) {
    console.error("获取通知消息失败:", error);
    return [];
  }
}

/**
 * 清除所有用户数据
 * @returns {boolean} 清除是否成功
 */
export function clearAllUserData() {
  try {
    wx.removeStorageSync(STORAGE_KEYS.PROFILE);
    wx.removeStorageSync(STORAGE_KEYS.PREFERENCES);
    wx.removeStorageSync(STORAGE_KEYS.HEALTH_INFO);
    wx.removeStorageSync(STORAGE_KEYS.HEALTH_CONDITIONS);
    wx.removeStorageSync(STORAGE_KEYS.MEDICATIONS_CURRENT);
    wx.removeStorageSync(STORAGE_KEYS.MEDICATIONS_HISTORY);
    wx.removeStorageSync(STORAGE_KEYS.HEALTH_RECORDS);
    wx.removeStorageSync(STORAGE_KEYS.APPOINTMENTS);
    wx.removeStorageSync(STORAGE_KEYS.CHAT_HISTORY);
    wx.removeStorageSync(STORAGE_KEYS.VISIT_RECORDS);
    wx.removeStorageSync(STORAGE_KEYS.NOTIFICATIONS);
    wx.removeStorageSync(STORAGE_KEYS.PAGE_DATA);
    return true;
  } catch (error) {
    console.error("清除用户数据失败:", error);
    return false;
  }
}

/**
 * 保存页面参数数据
 * @param {string} pageName 页面名称
 * @param {Object} pageData 页面数据对象
 * @returns {boolean} 保存是否成功
 */
export function setPageData(pageName, pageData) {
  try {
    const pageDataObj = getPageDataObj();
    pageDataObj[pageName] = pageData;
    wx.setStorageSync(STORAGE_KEYS.PAGE_DATA, pageDataObj);
    return true;
  } catch (error) {
    console.error("保存页面参数失败:", error);
    return false;
  }
}

/**
 * 获取页面参数数据
 * @param {string} pageName 页面名称
 * @returns {Object|null} 页面数据对象，如果不存在则返回 null
 */
export function getPageData(pageName) {
  try {
    const pageDataObj = getPageDataObj();
    return pageDataObj[pageName] || null;
  } catch (error) {
    console.error("获取页面参数失败:", error);
    return null;
  }
}

/**
 * 清除指定页面的参数数据
 * @param {string} pageName 页面名称
 * @returns {boolean} 清除是否成功
 */
export function clearPageData(pageName) {
  try {
    const pageDataObj = getPageDataObj();
    delete pageDataObj[pageName];
    wx.setStorageSync(STORAGE_KEYS.PAGE_DATA, pageDataObj);
    return true;
  } catch (error) {
    console.error("清除页面参数失败:", error);
    return false;
  }
}

/**
 * 清除所有页面参数数据
 * @returns {boolean} 清除是否成功
 */
export function clearAllPageData() {
  try {
    wx.removeStorageSync(STORAGE_KEYS.PAGE_DATA);
    return true;
  } catch (error) {
    console.error("清除所有页面参数失败:", error);
    return false;
  }
}

/**
 * 获取页面数据对象
 * @returns {Object} 页面数据对象
 */
function getPageDataObj() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.PAGE_DATA) || {};
  } catch (error) {
    console.error("获取页面数据对象失败:", error);
    return {};
  }
}
