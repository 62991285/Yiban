import {
  getUserProfile,
  addAppointmentRecord,
} from "../../utils/userInfoManager.js";

Page({
  data: {
    selectedArea: 1, // 选中的院区ID
    selectedMainDepartment: 1, // 选中的大科室ID
    selectedSubDepartment: "", // 选中的子科室ID
    selectedSubDepartmentName: "", // 选中的子科室名称
    userInfo: {},
    areas: [
      { id: 1, name: "汉口院区" },
      { id: 2, name: "光谷院区" },
      { id: 3, name: "中法院区" },
      { id: 4, name: "军山医院" },
    ],
    mainDepartments: [
      { id: 1, name: "内科" },
      { id: 2, name: "外科" },
      { id: 3, name: "妇产科" },
      { id: 4, name: "儿科" },
      { id: 5, name: "眼科" },
      { id: 6, name: "耳鼻喉科" },
      { id: 7, name: "口腔科" },
      { id: 8, name: "皮肤科" },
    ],
    subDepartments: [
      { id: 101, name: "普通门诊" },
      { id: 102, name: "心血管内科" },
      { id: 103, name: "呼吸与重症医学科" },
      { id: 104, name: "消化内科" },
      { id: 105, name: "神经内科" },
      { id: 106, name: "内分泌科" },
      { id: 107, name: "血液内科" },
      { id: 108, name: "肾内科" },
    ],
  },

  onLoad: function () {
    // 页面加载时从本地存储获取用户信息
    this.loadUserInfo();
  },

  // 从本地存储加载用户信息
  loadUserInfo: function () {
    try {
      const userInfo = getUserProfile();
      this.setData({
        userInfo: userInfo,
      });
    } catch (error) {
      console.error("加载用户信息失败：", error);
      wx.showToast({ title: "加载用户信息失败", icon: "none" });
    }
  },

  // 选择院区
  selectArea: function (e) {
    const id = Number(e.currentTarget.dataset.id);
    this.setData({
      selectedArea: id,
    });
  },

  // 选择大科室
  selectMainDepartment: function (e) {
    const id = Number(e.currentTarget.dataset.id);
    this.setData({
      selectedMainDepartment: id,
      subDepartments: this.getSubDepartments(id),
      selectedSubDepartment: "", // 切换大科室清空子科室选择
      selectedSubDepartmentName: "",
    });
  },

  // 选择子科室
  selectSubDepartment: function (e) {
    const id = Number(e.currentTarget.dataset.id);
    const name = e.currentTarget.dataset.name;
    this.setData({
      selectedSubDepartment: id,
      selectedSubDepartmentName: name,
    });
  },

  // 医生姓名输入
  inputDoctorName: function () {},

  // 选择挂号时间段
  selectTimeSlot: function () {},

  // 获取子科室列表
  getSubDepartments: function (mainDepartmentId) {
    const departmentMap = {
      1: [
        // 内科
        { id: 101, name: "普通门诊" },
        { id: 102, name: "心血管内科" },
        { id: 103, name: "呼吸与重症医学科" },
        { id: 104, name: "消化内科" },
        { id: 105, name: "神经内科" },
        { id: 106, name: "内分泌科" },
      ],
      2: [
        // 外科
        { id: 201, name: "普通外科" },
        { id: 202, name: "骨科" },
        { id: 203, name: "心胸外科" },
        { id: 204, name: "泌尿外科" },
        { id: 205, name: "神经外科" },
      ],
      3: [
        // 妇产科
        { id: 301, name: "妇科" },
        { id: 302, name: "产科" },
        { id: 303, name: "生殖医学中心" },
      ],
      4: [
        // 儿科
        { id: 401, name: "儿科门诊" },
        { id: 402, name: "儿童保健科" },
        { id: 403, name: "新生儿科" },
      ],
    };
    return departmentMap[mainDepartmentId] || [];
  },

  submitRegistration: function () {
    // 1. 表单校验
    const {
      selectedArea,
      selectedMainDepartment,
      selectedSubDepartment,
      userInfo,
    } = this.data;

    // 校验用户信息是否完整
    if (!userInfo.name) {
      wx.showToast({ title: "请先完善个人信息", icon: "none" });
      return;
    }

    // 获取院区名称
    const areaItem = this.data.areas.find((area) => area.id === selectedArea);
    const hospitalName = areaItem ? areaItem.name : "";
    // 获取大科室名称
    const mainDeptItem = this.data.mainDepartments.find(
      (dept) => dept.id === selectedMainDepartment,
    );
    const mainDeptName = mainDeptItem ? mainDeptItem.name : "";

    // 校验必填项
    if (!hospitalName) {
      wx.showToast({ title: "请选择院区", icon: "none" });
      return;
    }
    if (!mainDeptName) {
      wx.showToast({ title: "请选择大科室", icon: "none" });
      return;
    }
    if (!this.data.selectedSubDepartmentName) {
      wx.showToast({ title: "请选择子科室", icon: "none" });
      return;
    }

    // 2. 构造挂号数据
    const registrationData = {
      userId: userInfo.name, // 用户标识
      userInfo: userInfo, // 用户信息
      hospitalName: hospitalName, // 挂号医院（院区）
      department: `${mainDeptName}-${this.data.selectedSubDepartmentName}`, // 挂号科目
      doctorName: null, // 医生名称暂置为null
      timeSlot: null, // 挂号时间段暂置为null
      createTime: new Date().getTime(), // 提交时间戳
      status: "pending", // 挂号状态
    };

    try {
      // 3. 保存到本地存储
      const success = addAppointmentRecord(registrationData);

      if (success) {
        wx.showToast({ title: "挂号信息保存成功", icon: "success" });

        // 4. 清空表单
        this.setData({
          selectedSubDepartment: "",
          selectedSubDepartmentName: "",
        });
      } else {
        wx.showToast({ title: "保存失败，请重试", icon: "none" });
      }
    } catch (error) {
      console.error("挂号信息保存失败：", error);
      wx.showToast({ title: "保存失败，请重试", icon: "none" });
    }
  },

  goToDepartmentDetail: function (e) {
    const departmentId = e.currentTarget.dataset.id;
    const departmentName = e.currentTarget.dataset.name;
    const selectedArea = this.data.selectedArea;
    const areaName = this.data.areas.find(
      (area) => area.id === selectedArea,
    ).name;

    wx.navigateTo({
      url: `/pages/DepartmentDetailPage/DepartmentDetailPage?departmentId=${departmentId}&departmentName=${departmentName}&areaName=${areaName}`,
    });
  },
  goToMyAppointments: function () {
    wx.navigateTo({
      url: "/appointment/pages/appointment/myAppointments",
    });
  },
  goToMyDoctors: function () {
    wx.navigateTo({
      url: "/appointment/pages/appointment/myDoctors",
    });
  },
});
