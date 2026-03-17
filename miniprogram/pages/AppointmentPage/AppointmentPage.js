import {
  getUserProfile,
  addAppointmentRecord,
} from "../../utils/userInfoManager.js";
import {
  gotoDepartmentDetailPage,
  gotoAppointmentRecordsPage,
  gotoEditUserInfoPage,
} from "../../utils/pageNavigation.js";
const STORAGE_KEY_USER_DATA = "userData";
Page({
  data: {
    currentStep: 1,
    selectedArea: {},
    selectedDepartment: {},
    selectedSubDepartment: {},
    selectedTimeSlot: {},
    selectedPeriod: {},
    rightPanelType: "subDepartments",
    currentDate: "",
    userInfo: {},
    areas: [
      { id: 1, name: "汉口院区", address: "湖北省武汉市江岸区" },
      { id: 2, name: "光谷院区", address: "湖北省武汉市洪山区" },
      { id: 3, name: "中法院区", address: "湖北省武汉市蔡甸区" },
      { id: 4, name: "军山医院", address: "湖北省武汉市汉南区" },
    ],
    departments: [
      { id: 1, name: "内科", icon: "🏥" },
      { id: 2, name: "外科", icon: "🔪" },
      { id: 3, name: "妇产科", icon: "👶" },
      { id: 4, name: "儿科", icon: "🧒" },
      { id: 5, name: "眼科", icon: "👁️" },
      { id: 6, name: "耳鼻喉科", icon: "👂" },
      { id: 7, name: "口腔科", icon: "🦷" },
      { id: 8, name: "皮肤科", icon: "🧴" },
    ],
    subDepartments: [],
    timeSlots: [
      {
        id: 1,
        name: "上午",
        periods: [
          { id: 1, name: "08:00-09:00" },
          { id: 2, name: "09:00-10:00" },
          { id: 3, name: "10:00-11:00" },
          { id: 4, name: "11:00-12:00" },
        ],
      },
      {
        id: 2,
        name: "下午",
        periods: [
          { id: 5, name: "14:00-15:00" },
          { id: 6, name: "15:00-16:00" },
          { id: 7, name: "16:00-17:00" },
          { id: 8, name: "17:00-18:00" },
        ],
      },
      {
        id: 3,
        name: "晚上",
        periods: [
          { id: 9, name: "18:00-19:00" },
          { id: 10, name: "19:00-20:00" },
        ],
      },
    ],
  },

  onLoad: function () {
    //this.loadUserInfo();
    //this.loadUserData();
    var userdata=wx.getStorageSync('userData')

console.log(userdata);
  
this.setData({userInfo:userdata.profile});

    this.setCurrentDate();
  },

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

  loadUserInfo: function () {
    try {
      const userInfo = getUserProfile();
      this.setData({
        userInfo: userInfo,
      });

      // 检查用户信息是否完整
      if (!userInfo.name) {
        console.log("用户信息不完整，提示用户完善");
        // 这里不直接跳转，只在用户点击预约时跳转，避免影响用户体验
      }
    } catch (error) {
      console.error("加载用户信息失败：", error);
      wx.showToast({ title: "加载用户信息失败", icon: "none" });
    }
  },

  setCurrentDate: function () {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    this.setData({
      currentDate: `${year}-${month}-${day}`,
    });
  },

  selectArea: function (e) {
    const id = Number(e.currentTarget.dataset.id);
    const area = this.data.areas.find((item) => item.id === id);
    this.setData({
      selectedArea: area,
    });
  },

  confirmArea: function () {
    if (!this.data.selectedArea.id) {
      wx.showToast({ title: "请选择院区", icon: "none" });
      return;
    }
    this.setData({
      currentStep: 2,
    });
  },

  selectMainDepartment: function (e) {
    const id = Number(e.currentTarget.dataset.id);
    const department = this.data.departments.find((item) => item.id === id);
    this.setData({
      selectedDepartment: department,
      subDepartments: this.getSubDepartments(id),
      selectedSubDepartment: {},
      rightPanelType: "subDepartments",
    });
  },

  selectSubDepartment: function (e) {
    const id = Number(e.currentTarget.dataset.id);
    const subDepartment = this.data.subDepartments.find(
      (item) => item.id === id,
    );
    this.setData({
      selectedSubDepartment: subDepartment,
      rightPanelType: "timeSlots",
    });
  },

  backToSubDepartments: function () {
    this.setData({
      rightPanelType: "subDepartments",
    });
  },

  selectTimeSlot: function (e) {
    const id = Number(e.currentTarget.dataset.id);
    const timeSlot = this.data.timeSlots.find((item) => item.id === id);
    this.setData({
      selectedTimeSlot: timeSlot,
      selectedPeriod: {},
    });
  },

  selectPeriod: function (e) {
    const id = Number(e.currentTarget.dataset.id);
    const period = this.data.selectedTimeSlot.periods.find(
      (item) => item.id === id,
    );
    this.setData({
      selectedPeriod: period,
    });
  },

  stopPropagation: function () {
    // 阻止事件冒泡
  },

  getSubDepartments: function (mainDepartmentId) {
    const departmentMap = {
      1: [
        { id: 101, name: "普通门诊", description: "常见疾病诊疗" },
        { id: 102, name: "心血管内科", description: "心脏血管疾病" },
        { id: 103, name: "呼吸与重症医学科", description: "呼吸系统疾病" },
        { id: 104, name: "消化内科", description: "消化系统疾病" },
        { id: 105, name: "神经内科", description: "神经系统疾病" },
        { id: 106, name: "内分泌科", description: "内分泌疾病" },
        { id: 107, name: "血液内科", description: "血液系统疾病" },
        { id: 108, name: "肾内科", description: "肾脏疾病" },
      ],
      2: [
        { id: 201, name: "普通外科", description: "常见外科疾病" },
        { id: 202, name: "骨科", description: "骨骼肌肉疾病" },
        { id: 203, name: "心胸外科", description: "心脏胸部疾病" },
        { id: 204, name: "泌尿外科", description: "泌尿系统疾病" },
        { id: 205, name: "神经外科", description: "神经系统疾病" },
      ],
      3: [
        { id: 301, name: "妇科", description: "女性生殖系统疾病" },
        { id: 302, name: "产科", description: "孕期保健及分娩" },
        { id: 303, name: "生殖医学中心", description: "不孕不育诊疗" },
      ],
      4: [
        { id: 401, name: "儿科门诊", description: "儿童常见疾病" },
        { id: 402, name: "儿童保健科", description: "儿童健康保健" },
        { id: 403, name: "新生儿科", description: "新生儿疾病" },
      ],
      5: [
        { id: 501, name: "眼科门诊", description: "常见眼病" },
        { id: 502, name: "白内障科", description: "白内障诊疗" },
        { id: 503, name: "青光眼科", description: "青光眼诊疗" },
      ],
      6: [
        { id: 601, name: "耳科", description: "耳部疾病" },
        { id: 602, name: "鼻科", description: "鼻部疾病" },
        { id: 603, name: "喉科", description: "喉部疾病" },
      ],
      7: [
        { id: 701, name: "口腔内科", description: "口腔内科疾病" },
        { id: 702, name: "口腔外科", description: "口腔外科疾病" },
        { id: 703, name: "口腔修复科", description: "牙齿修复" },
      ],
      8: [
        { id: 801, name: "皮肤科门诊", description: "常见皮肤病" },
        { id: 802, name: "性病科", description: "性传播疾病" },
        { id: 803, name: "美容皮肤科", description: "美容皮肤问题" },
      ],
    };
    return departmentMap[mainDepartmentId] || [];
  },

  goToPrevStep: function () {
    if (this.data.currentStep === 2) {
      this.setData({
        currentStep: 1,
      });
    } else if (this.data.currentStep === 3) {
      this.setData({
        currentStep: 2,
      });
    }
  },

  confirmDepartment: function () {
    if (!this.data.selectedDepartment.id) {
      wx.showToast({ title: "请选择科室", icon: "none" });
      return;
    }
    if (!this.data.selectedSubDepartment.id) {
      wx.showToast({ title: "请选择子科室", icon: "none" });
      return;
    }
    this.setData({
      currentStep: 3,
    });
  },

  confirmBooking: function () {
    const {
      selectedArea,
      selectedDepartment,
      selectedSubDepartment,
      selectedTimeSlot,
      selectedPeriod,
      userInfo,
      currentDate,
    } = this.data;

    if (!userInfo.name) {
      wx.showToast({ title: "请先完善个人信息", icon: "none" });
      setTimeout(() => {
        gotoEditUserInfoPage();
      }, 1000);
      return;
    }

    if (!selectedTimeSlot.id || !selectedPeriod.id) {
      wx.showToast({ title: "请选择就诊时段", icon: "none" });
      return;
    }

    const registrationData = {
      userId: userInfo.name,
      userInfo: userInfo,
      area: selectedArea,
      department: selectedDepartment,
      subDepartment: selectedSubDepartment,
      date: currentDate,
      timeSlot: selectedTimeSlot,
      period: selectedPeriod,
      status: "已预约",
      bookingNo: this.generateBookingNo(),
      createTime: new Date().getTime(),
    };

    try {
      const success = addAppointmentRecord(registrationData);

      if (success) {
        wx.showToast({ title: "预约成功", icon: "success" });
        setTimeout(() => {
          gotoAppointmentRecordsPage();
        }, 1500);
      } else {
        wx.showToast({ title: "预约失败，请重试", icon: "none" });
      }
    } catch (error) {
      console.error("预约失败：", error);
      wx.showToast({ title: "预约失败，请重试", icon: "none" });
    }
  },

  generateBookingNo: function () {
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `BK${year}${month}${day}${random}`;
  },

  goToDepartmentDetail: function (e) {
    const departmentId = e.currentTarget.dataset.id;
    gotoDepartmentDetailPage(departmentId);
  },

  goToMyAppointments: function () {
    gotoAppointmentRecordsPage();
  },

  goToMyDoctors: function () {
    wx.showToast({
      title: "功能开发中",
      icon: "none",
    });
  },
});
