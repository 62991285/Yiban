// pages/HealthInfoPage/HealthInfoPage.js
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
   * 加载用户数据 - 从配置文件读取
   */
  loadUserData() {
    const that = this;
    const fs = wx.getFileSystemManager();

    // 使用文件系统读取本地配置文件
    try {
      const filePath = `${wx.env.USER_DATA_PATH}/userData.json`;
      const data = fs.readFileSync(filePath, "utf8");
      const userData = JSON.parse(data);

      that.setData({
        healthInfo: userData.healthInfo || {},
      });
    } catch (err) {
      console.log("本地文件读取失败，尝试读取项目配置文件", err);
      that.loadFromConfig();
    }
  },

  /**
   * 从项目配置文件加载（首次使用）
   */
  loadFromConfig() {
    const that = this;
    const fs = wx.getFileSystemManager();

    try {
      // 读取项目目录下的配置文件
      const data = fs.readFileSync("miniprogram/config/userData.json", "utf8");
      const userData = JSON.parse(data);

      that.setData({
        healthInfo: userData.healthInfo || {},
      });

      // 保存到本地文件，以便后续使用
      that.saveUserDataToLocal(userData);
    } catch (err) {
      console.error("读取配置文件失败", err);
      wx.showToast({
        title: "加载数据失败",
        icon: "none",
      });
    }
  },

  /**
   * 保存用户数据到本地
   */
  saveUserDataToLocal(userData) {
    const fs = wx.getFileSystemManager();
    const filePath = `${wx.env.USER_DATA_PATH}/userData.json`;

    try {
      fs.writeFileSync(filePath, JSON.stringify(userData, null, 2), "utf8");
    } catch (err) {
      console.error("保存到本地失败", err);
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
