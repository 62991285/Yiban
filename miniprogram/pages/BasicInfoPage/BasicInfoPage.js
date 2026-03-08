// pages/BasicInfoPage/BasicInfoPage.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    profile: {},
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
  onShow() {},

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
        profile: userData.profile || {},
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
        profile: userData.profile || {},
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
   * 保存按钮点击事件
   */
  onSaveTap() {
    const that = this;
    const { profile } = this.data;

    // 数据验证
    if (!profile.name || profile.name.trim() === "") {
      wx.showToast({ title: "请输入姓名", icon: "none" });
      return;
    }
    if (!profile.phone || profile.phone.trim() === "") {
      wx.showToast({ title: "请输入手机号", icon: "none" });
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(profile.phone)) {
      wx.showToast({ title: "手机号格式不正确", icon: "none" });
      return;
    }

    // 读取现有数据
    const fs = wx.getFileSystemManager();
    const filePath = `${wx.env.USER_DATA_PATH}/userData.json`;

    let userData = {};
    try {
      const data = fs.readFileSync(filePath, "utf8");
      userData = JSON.parse(data);
    } catch (err) {
      console.log("读取现有数据失败，创建新数据");
    }

    // 更新数据
    userData.profile = profile;
    userData.meta = {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
    };

    // 保存到本地文件
    try {
      fs.writeFileSync(filePath, JSON.stringify(userData, null, 2), "utf8");

      wx.showToast({
        title: "保存成功",
        icon: "success",
        success: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        },
      });
    } catch (err) {
      console.error("保存失败", err);
      wx.showToast({ title: "保存失败", icon: "none" });
    }
  },

  // ========== 个人信息输入处理 ==========

  onNameInput(e) {
    this.setData({ "profile.name": e.detail.value });
  },

  onGenderChange(e) {
    const genderMap = { 0: "未知", 1: "男", 2: "女" };
    this.setData({ "profile.gender": genderMap[e.detail.value] });
  },

  onAgeInput(e) {
    const age = parseInt(e.detail.value) || "";
    this.setData({ "profile.age": age });
  },

  onIdCardInput(e) {
    this.setData({ "profile.idCard": e.detail.value });
  },

  onPhoneInput(e) {
    this.setData({ "profile.phone": e.detail.value });
  },

  onAddressInput(e) {
    this.setData({ "profile.address": e.detail.value });
  },

  onEmergencyContactInput(e) {
    this.setData({ "profile.emergencyContact": e.detail.value });
  },
});
