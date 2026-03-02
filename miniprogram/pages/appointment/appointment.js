const hospitalData = require('../../config/hospitalData.js');

Page({
  data: {
    // 流程步骤: 1-院区选择, 2-科室选择, 3-确认信息
    currentStep: 1,

    // 选择数据
    selectedArea: null,
    selectedDepartment: null,
    selectedSubDepartment: null,
    selectedTimeSlot: null,
    selectedPeriod: null,

    // 配置数据
    areas: [],
    departments: [],
    subDepartments: [],
    timeSlots: [],

    // 右侧面板显示类型: 'subDepartments' 或 'timeSlots'
    rightPanelType: 'subDepartments',

    // 日期信息
    currentDate: '',
    bookingInfo: {}
  },

  onLoad: function () {
    this.initData();
    this.setCurrentDate();
  },

  initData() {
    this.setData({
      areas: hospitalData.areas,
      departments: hospitalData.departments,
      timeSlots: hospitalData.timeSlots
    });
  },

  setCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekDay = weekDays[now.getDay()];
    this.setData({
      currentDate: `${year}-${month}-${day} ${weekDay}`
    });
  },

  // 选择院区
  selectArea(e) {
    const id = e.currentTarget.dataset.id;
    const area = this.data.areas.find(a => a.id === id);
    this.setData({
      selectedArea: area,
      selectedDepartment: null,
      selectedSubDepartment: null,
      selectedTimeSlot: null,
      selectedPeriod: null
    });
  },

  // 确认院区选择，进入下一步
  confirmArea() {
    if (!this.data.selectedArea) {
      wx.showToast({ title: '请选择院区', icon: 'none' });
      return;
    }
    this.goToStep(2);
  },

  // 选择大科室
  selectMainDepartment(e) {
    const id = e.currentTarget.dataset.id;
    const department = this.data.departments.find(dept => dept.id === id);
    this.setData({
      selectedDepartment: department,
      subDepartments: department.subDepartments || [],
      selectedSubDepartment: null,
      rightPanelType: 'subDepartments',
      selectedTimeSlot: null,
      selectedPeriod: null
    });
  },

  // 选择子科室
  selectSubDepartment(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    const subDepartment = this.data.subDepartments.find(sd => sd.id === id);
    this.setData({
      selectedSubDepartment: subDepartment,
      rightPanelType: 'timeSlots',
      selectedTimeSlot: null,
      selectedPeriod: null
    });
  },

  // 确认科室和时段选择，进入下一步
  confirmDepartment() {
    if (!this.data.selectedDepartment) {
      wx.showToast({ title: '请选择科室', icon: 'none' });
      return;
    }
    if (!this.data.selectedSubDepartment) {
      wx.showToast({ title: '请选择具体科室', icon: 'none' });
      return;
    }
    if (!this.data.selectedTimeSlot) {
      wx.showToast({ title: '请选择时段', icon: 'none' });
      return;
    }
    if (!this.data.selectedPeriod) {
      wx.showToast({ title: '请选择具体时间', icon: 'none' });
      return;
    }
    this.goToStep(3);
  },

  // 选择时段
  selectTimeSlot(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    this.setData({
      selectedTimeSlot: id,
      selectedPeriod: null
    });
  },

  // 选择具体时间
  selectPeriod(e) {
    const id = String(e.currentTarget.dataset.id);
    const timeSlot = this.data.timeSlots.find(ts => ts.id === this.data.selectedTimeSlot);
    const period = timeSlot ? timeSlot.periods.find(p => String(p.id) === id) : null;
    this.setData({
      selectedPeriod: period
    });
  },

  // 确认时段选择，进入下一步
  confirmTimeSlot() {
    if (!this.data.selectedTimeSlot) {
      wx.showToast({ title: '请选择时段', icon: 'none' });
      return;
    }
    if (!this.data.selectedPeriod) {
      wx.showToast({ title: '请选择具体时间', icon: 'none' });
      return;
    }
    this.goToStep(3);
  },

  // 生成挂号信息对象
  generateBookingInfo() {
    const timeSlot = this.data.timeSlots.find(ts => ts.id === this.data.selectedTimeSlot);
    const info = {
      id: Date.now(),
      area: this.data.selectedArea,
      department: this.data.selectedDepartment,
      subDepartment: this.data.selectedSubDepartment,
      timeSlot: timeSlot,
      period: this.data.selectedPeriod,
      date: this.data.currentDate,
      status: '已预约',
      createTime: new Date().toLocaleString(),
      bookingNo: this.generateBookingNo()
    };
    this.setData({
      bookingInfo: info,
      timeSlot: timeSlot,
      period: this.data.selectedPeriod
    });
    return info;
  },

  // 生成挂号编号
  generateBookingNo() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `BH${timestamp}${random}`;
  },

  // 确认预约
  confirmBooking() {
    const info = this.generateBookingInfo();

    // 保存到本地存储
    this.saveBookingRecord(info);

    wx.showLoading({ title: '正在提交...' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '预约成功',
        icon: 'success',
        duration: 2000
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    }, 1500);
  },

  // 保存预约记录
  saveBookingRecord(info) {
    let records = wx.getStorageSync('bookingRecords') || [];
    records.unshift(info);
    wx.setStorageSync('bookingRecords', records);
  },

  // 步骤导航
  goToStep(step) {
    this.setData({
      currentStep: step
    });

    // 如果进入科室选择步骤，更新子科室列表
    if (step === 2 && this.data.selectedDepartment) {
      this.setData({
        subDepartments: this.data.selectedDepartment.subDepartments || []
      });
    }
  },

  // 获取当前步骤的class
  getStepClass(step) {
    return this.data.currentStep === step ? 'current' : '';
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，仅用于阻止事件冒泡
  },

  // 返回上一步
  goToPrevStep() {
    const prevStep = this.data.currentStep - 1;
    if (prevStep >= 1) {
      this.goToStep(prevStep);
    }
  },

  // 返回科室列表
  backToSubDepartments() {
    this.setData({
      rightPanelType: 'subDepartments'
    });
  },

  // 重新开始
  restart() {
    this.setData({
      currentStep: 1,
      selectedArea: null,
      selectedDepartment: null,
      selectedSubDepartment: null,
      selectedTimeSlot: null,
      selectedPeriod: null,
      bookingInfo: {},
      rightPanelType: 'subDepartments'
    });
  },

  // 更新子科室列表
  updateSubDepartments() {
    if (this.data.selectedDepartment) {
      this.setData({
        subDepartments: this.data.selectedDepartment.subDepartments || []
      });
    }
  }
});
