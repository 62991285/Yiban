// pages/EditUserInfoPage/EditUserInfoPage.js
const STORAGE_KEY_USER_DATA = "userData";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    editType: "profile",
    profile: {},
    healthInfo: {},
    tempAllergies: "",
    tempChronicDiseases: "",
    tempMedications: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const editType = options.type || "profile";
    this.setData({ editType });
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
  onPullDownRefresh() {},

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
      const userData = wx.getStorageSync(STORAGE_KEY_USER_DATA);

      if (userData) {
        this.setData({
          profile: userData.profile || {},
          healthInfo: userData.healthInfo || {},
          tempAllergies: (userData.healthInfo?.allergies || []).join("、"),
          tempChronicDiseases: (
            userData.healthInfo?.chronicDiseases || []
          ).join("、"),
          tempMedications: (userData.healthInfo?.medications || []).join("、"),
        });
      }
    } catch (err) {
      console.log("读取用户数据失败", err);
    }
  },

  /**
   * 保存用户数据
   */
  saveUserData() {
    try {
      const userData = wx.getStorageSync(STORAGE_KEY_USER_DATA) || {
        profile: {},
        healthInfo: {},
        meta: {
          version: "1.0.0",
          lastUpdated: new Date().toISOString(),
        },
      };

      const { editType, profile, healthInfo } = this.data;

      userData.profile =
        editType === "profile" ? profile : userData.profile || {};
      userData.healthInfo =
        editType === "health" ? healthInfo : userData.healthInfo || {};
      userData.meta = {
        version: "1.0.0",
        lastUpdated: new Date().toISOString(),
      };

      wx.setStorageSync(STORAGE_KEY_USER_DATA, userData);
      console.log("用户数据保存成功");
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
    const {
      editType,
      profile,
      healthInfo,
      tempAllergies,
      tempChronicDiseases,
      tempMedications,
    } = this.data;

    // 数据验证
    if (editType === "profile") {
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
    }

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
    let userData = {};
    try {
      userData = wx.getStorageSync(STORAGE_KEY_USER_DATA) || {};
    } catch (err) {
      console.log("读取现有数据失败，创建新数据");
    }

    // 更新数据
    userData.profile =
      editType === "profile" ? profile : userData.profile || {};
    userData.healthInfo =
      editType === "health" ? updatedHealthInfo : userData.healthInfo || {};
    userData.meta = {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
    };

    // 保存到storage
    try {
      wx.setStorageSync(STORAGE_KEY_USER_DATA, userData);

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
