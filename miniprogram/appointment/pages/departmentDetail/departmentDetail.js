Page({
  data: {
    departmentId: '',
    departmentName: '',
    areaName: '',
    isFollowed: false,
    activeTab: 1,
    filterTabs: [
      { id: 1, name: '全部' },
      { id: 2, name: '内科' },
      { id: 3, name: '呼吸与重症医学科' },
      { id: 4, name: '消化内科' }
    ],
    appointmentDates: []
  },

  onLoad: function (options) {
    this.setData({
      departmentId: options.departmentId,
      departmentName: options.departmentName,
      areaName: options.areaName
    });
    
    // 生成模拟的预约日期数据
    this.generateAppointmentDates();
  },

  // 生成模拟的预约日期数据
  generateAppointmentDates: function () {
    const dates = [];
    const today = new Date('2026-01-13');
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const periods = ['上午', '下午'];
    
    // 生成未来7天的预约数据
    for (let i = 0; i < 7; i++) {
      for (const period of periods) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const dateStr = date.toISOString().split('T')[0];
        const week = weekDays[date.getDay()];
        
        dates.push({
          date: dateStr,
          week: week,
          period: period,
          price: 4.5,
          status: '可约'
        });
      }
    }
    
    this.setData({
      appointmentDates: dates
    });
  },

  // 切换关注状态
  toggleFollow: function () {
    this.setData({
      isFollowed: !this.data.isFollowed
    });
  },

  // 切换筛选标签
  switchTab: function (e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      activeTab: id
    });
  }
});