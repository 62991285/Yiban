// pages/HealthInfoEditPage/HealthInfoEditPage.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    healthInfo: {},
    tempAllergies: "",
    tempChronicDiseases: "",
    tempMedications: "",
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
        healthInfo: userData.healthInfo || {},
        tempAllergies: (userData.healthInfo?.allergies || []).join("、"),
        tempChronicDiseases: (userData.healthInfo?.chronicDiseases || []).join(
          "、",
        ),
        tempMedications: (userData.healthInfo?.medications || []).join("、"),
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
        tempAllergies: (userData.healthInfo?.allergies || []).join("、"),
        tempChronicDiseases: (userData.healthInfo?.chronicDiseases || []).join(
          "、",
        ),
        tempMedications: (userData.healthInfo?.medications || []).join("、"),
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
    const { healthInfo, tempAllergies, tempChronicDiseases, tempMedications } =
      this.data;

    // 处理数组类型的健康信息
    const updatedHealthInfo = {
      ...healthInfo,
      allergies: tempAllergies
        ? tempAllergies
            .split("、")
            .map((item) => item.trim())
            .filter((item) => item)
        : [],
      chronicDiseases: tempChronicDiseases
        ? tempChronicDiseases
            .split("、")
            .map((item) => item.trim())
            .filter((item) => item)
        : [],
      medications: tempMedications
        ? tempMedications
            .split("、")
            .map((item) => item.trim())
            .filter((item) => item)
        : [],
    };

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
    userData.healthInfo = updatedHealthInfo;
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

  // ========== 健康信息输入处理 ==========

  onBloodTypeChange(e) {
    const bloodTypes = [
      "A型",
      "B型",
      "AB型",
      "O型",
      "RH阳性",
      "RH阴性",
      "未知",
    ];
    this.setData({ "healthInfo.bloodType": bloodTypes[e.detail.value] });
  },

  onHeightInput(e) {
    this.setData({ "healthInfo.height": e.detail.value });
  },

  onWeightInput(e) {
    this.setData({ "healthInfo.weight": e.detail.value });
  },

  onBloodPressureInput(e) {
    this.setData({ "healthInfo.bloodPressure": e.detail.value });
  },

  onAllergiesInput(e) {
    this.setData({ tempAllergies: e.detail.value });
  },

  onChronicDiseasesInput(e) {
    this.setData({ tempChronicDiseases: e.detail.value });
  },

  onMedicationsInput(e) {
    this.setData({ tempMedications: e.detail.value });
  },
});
