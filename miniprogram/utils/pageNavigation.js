/**
 * 页面导航工具函数 - 统一跳转接口
 * 所有页面跳转函数统一命名为 goto + 页面名称
 */

/**
 * 基础导航函数
 * @param {string} url - 目标页面路径
 * @param {Object} params - 跳转参数
 * @param {boolean} redirect - 是否使用 redirectTo
 */
function navigateTo(url, params = {}, redirect = false) {
  const queryString = Object.keys(params)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`,
    )
    .join("&");
  const fullUrl = queryString ? `${url}?${queryString}` : url;

  if (redirect) {
    wx.redirectTo({ url: fullUrl });
  } else {
    wx.navigateTo({ url: fullUrl });
  }
}

/**
 * 跳转到首页
 */
export function gotoHomePage() {
  navigateTo("/pages/HomePage/HomePage");
}

/**
 * 跳转到科室导航页面
 */
export function gotoDepartmentNavigationPage() {
  navigateTo("/pages/DepartmentNavigationPage/DepartmentNavigationPage");
}

/**
 * 跳转到科室详情页面
 * @param {string} departmentId - 科室ID
 */
export function gotoDepartmentDetailPage(departmentId) {
  navigateTo("/pages/DepartmentDetailPage/DepartmentDetailPage", {
    id: departmentId,
  });
}

/**
 * 跳转到药房导航页面
 */
export function gotoPharmacyNavigationPage() {
  navigateTo("/pages/PharmacyNavigationPage/PharmacyNavigationPage");
}

/**
 * 跳转到预约页面
 */
export function gotoAppointmentPage() {
  navigateTo("/pages/AppointmentPage/AppointmentPage");
}

/**
 * 跳转到预约记录页面
 */
export function gotoAppointmentRecordsPage() {
  navigateTo("/pages/AppointmentRecordsPage/AppointmentRecordsPage");
}

/**
 * 跳转到用户信息页面
 */
export function gotoUserInfoPage() {
  navigateTo("/pages/UserInfoPage/UserInfoPage");
}

/**
 * 跳转到编辑用户信息页面
 */
export function gotoEditUserInfoPage() {
  navigateTo("/pages/EditUserInfoPage/EditUserInfoPage");
}

/**
 * 跳转到工具页面
 */
export function gotoUtilitiesPage() {
  navigateTo("/pages/UtilitiesPage/UtilitiesPage");
}

/**
 * 跳转到聊天页面
 * @param {string} sessionId - 会话ID
 */
export function gotoChatPage(sessionId) {
  const params = sessionId ? { sessionId } : {};
  navigateTo("/pages/ChatPage/ChatPage", params);
}
