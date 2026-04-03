import { getHealthInfo } from "../../utils/accountDataManager.js";
import { gotoHealthInfoEditPage } from "../../utils/pageNavigation.js";

Page({
  /**
   * 页面的初始数据
   */
  data: {
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
      const healthInfo = getHealthInfo();

      this.setData({
        healthInfo: healthInfo || {},
      });
    } catch (err) {
      console.log("读取用户数据失败", err);
    }
  },

  /**
   * 返回按钮点击事件
   */
  onBackTap() {
    wx.navigateBack();
  },

  /**
   * 编辑按钮点击事件
   */
  onEditTap() {
    gotoHealthInfoEditPage();
  },
});
