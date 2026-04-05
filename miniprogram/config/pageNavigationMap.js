// 页面链接映射配置
// 用于RAG系统中的功能链接跳转

const PAGE_NAVIGATION_MAP = {
  navigateToAppointmentPage: {
    name: "立即挂号",
    handler: "gotoAppointmentPage"
  },
  navigateToDepartmentNavigationPage: {
    name: "科室导航",
    handler: "gotoDepartmentNavigationPage"
  },
  navigateToPharmacyNavigationPage: {
    name: "药房导航",
    handler: "gotoPharmacyNavigationPage"
  },
  navigateToUserInfoPage: {
    name: "个人资料",
    handler: "gotoUserInfoPage"
  },
  navigateToAppointmentRecordsPage: {
    name: "挂号记录",
    handler: "gotoAppointmentRecordsPage"
  },
  navigateToHealthInfo: {
    name: "健康档案",
    handler: "goToHealthInfo"
  }
};

/**
 * 根据链接类型获取对应的跳转函数
 * @param {string} linkUrl - 链接URL
 * @returns {function|null} 跳转函数
 */
function getNavigationHandler(linkUrl) {
  const mapping = PAGE_NAVIGATION_MAP[linkUrl];
  if (mapping && mapping.handler) {
    return mapping.handler;
  }
  return null;
}

/**
 * 获取所有可用的导航映射
 * @returns {object} 导航映射对象
 */
function getAllNavigationMappings() {
  return PAGE_NAVIGATION_MAP;
}

module.exports = {
  PAGE_NAVIGATION_MAP,
  getNavigationHandler,
  getAllNavigationMappings
};
