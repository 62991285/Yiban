// pages/UserInfoPage/UserInfoPage.js
const STORAGE_KEY_USER_DATA = "userData";

import {
  gotoBasicInfoPage,
  gotoHealthInfoPage,
  gotoAppointmentRecordsPage,
  gotoChatPage,
} from "../../utils/pageNavigation.js";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    profile: {},
    healthInfo: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadUserData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadUserData();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadUserData();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},

  /**
   * 加载用户数据 - 从本地storage读取
   */
  loadUserData() {
    try {
      const userData = wx.getStorageSync(STORAGE_KEY_USER_DATA);

      if (userData) {
        this.setData({
          profile: userData.profile || {},
          healthInfo: userData.healthInfo || {},
        });
      }
    } catch (err) {
      console.log("读取用户数据失败", err);
    }
  },

  /**
   * 编辑个人信息
   */
  gotoBasicInfo() {
    gotoBasicInfoPage();
  },

  /**
   * 跳转到健康档案
   */
  goToHealthInfo() {
    gotoHealthInfoPage();
  },

  /**
   * 跳转到挂号记录
   */
  goToAppointmentRecords() {
    gotoAppointmentRecordsPage();
  },

  /**
   * 跳转到对话记录
   */
  goToChatHistory() {
    gotoChatPage();
  },
});
