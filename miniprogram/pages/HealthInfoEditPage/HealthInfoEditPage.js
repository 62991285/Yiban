import {
  getHealthInfo,
  setHealthInfo,
} from "../../utils/accountDataManager.js";

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
  onHide() {
    this.saveUserData();
  },

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
   * 加载用户数据
   */
  loadUserData() {
    try {
      const healthInfo = getHealthInfo();

      this.setData({
        healthInfo: healthInfo || {},
        tempAllergies: (healthInfo?.allergies || []).join("、"),
        tempChronicDiseases: (healthInfo?.chronicDiseases || []).join("、"),
        tempMedications: (healthInfo?.medications || []).join("、"),
      });
    } catch (err) {
      console.log("读取用户数据失败", err);
    }
  },

  /**
   * 保存用户数据
   */
  saveUserData() {
    try {
      const {
        healthInfo,
        tempAllergies,
        tempChronicDiseases,
        tempMedications,
      } = this.data;

      // 处理数组类型的健康信息
      const updatedHealthInfo = {
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

      const result = setHealthInfo(updatedHealthInfo);

      if (result) {
        console.log("用户数据保存成功");
      } else {
        console.error("用户数据保存失败");
      }
    } catch (err) {
      console.error("保存用户数据失败", err);
    }
  },

  /**
   * 返回按钮点击事件
   */
  onBackTap() {
    this.saveUserData();
    wx.navigateBack();
  },

  /**
   * 保存按钮点击事件
   */
  onSaveTap() {
    const { healthInfo, tempAllergies, tempChronicDiseases, tempMedications } =
      this.data;

    // 处理数组类型的健康信息
    const updatedHealthInfo = {
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

    const result = setHealthInfo(updatedHealthInfo);

    if (result) {
      wx.showToast({
        title: "保存成功",
        icon: "success",
        success: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        },
      });
    } else {
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
