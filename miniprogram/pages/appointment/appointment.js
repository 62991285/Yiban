Page({
  data: {
    selectedArea: 1,
    selectedMainDepartment: 1,
    areas: [
      { id: 1, name: '汉口院区' },
      { id: 2, name: '光谷院区' },
      { id: 3, name: '中法院区' },
      { id: 4, name: '军山医院' }
    ],
    mainDepartments: [
      { id: 1, name: '内科' },
      { id: 2, name: '外科' },
      { id: 3, name: '妇产科' },
      { id: 4, name: '儿科' },
      { id: 5, name: '眼科' },
      { id: 6, name: '耳鼻喉科' },
      { id: 7, name: '口腔科' },
      { id: 8, name: '皮肤科' }
    ],
    subDepartments: [
      { id: 101, name: '普通门诊' },
      { id: 102, name: '心血管内科' },
      { id: 103, name: '呼吸与重症医学科' },
      { id: 104, name: '消化内科' },
      { id: 105, name: '神经内科' },
      { id: 106, name: '内分泌科' },
      { id: 107, name: '血液内科' },
      { id: 108, name: '肾内科' }
    ]
  },

  onLoad: function () {
    // 页面加载时的初始化逻辑
  },

  // 选择院区
  selectArea: function (e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      selectedArea: id
    });
  },

  // 选择大科室
  selectMainDepartment: function (e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      selectedMainDepartment: id,
      // 根据选择的大科室更新子科室列表
      subDepartments: this.getSubDepartments(id)
    });
  },

  // 获取子科室列表
  getSubDepartments: function (mainDepartmentId) {
    // 这里可以根据不同的大科室返回不同的子科室
    // 实际项目中可能从服务器获取数据
    const departmentMap = {
      1: [ // 内科
        { id: 101, name: '普通门诊' },
        { id: 102, name: '心血管内科' },
        { id: 103, name: '呼吸与重症医学科' },
        { id: 104, name: '消化内科' },
        { id: 105, name: '神经内科' },
        { id: 106, name: '内分泌科' }
      ],
      2: [ // 外科
        { id: 201, name: '普通外科' },
        { id: 202, name: '骨科' },
        { id: 203, name: '心胸外科' },
        { id: 204, name: '泌尿外科' },
        { id: 205, name: '神经外科' }
      ],
      3: [ // 妇产科
        { id: 301, name: '妇科' },
        { id: 302, name: '产科' },
        { id: 303, name: '生殖医学中心' }
      ],
      4: [ // 儿科
        { id: 401, name: '儿科门诊' },
        { id: 402, name: '儿童保健科' },
        { id: 403, name: '新生儿科' }
      ]
    };

    return departmentMap[mainDepartmentId] || [];
  },

  // 进入科室详情页
  goToDepartmentDetail: function (e) {
    const departmentId = e.currentTarget.dataset.id;
    const departmentName = e.currentTarget.dataset.name;
    const selectedArea = this.data.selectedArea;
    const areaName = this.data.areas.find(area => area.id === selectedArea).name;

    wx.navigateTo({
      url: `/appointment/pages/departmentDetail/departmentDetail?departmentId=${departmentId}&departmentName=${departmentName}&areaName=${areaName}`
    });
  },

  // 进入我的预约
  goToMyAppointments: function () {
    wx.navigateTo({
      url: '/appointment/pages/appointment/myAppointments'
    });
  },

  // 进入我的医生
  goToMyDoctors: function () {
    wx.navigateTo({
      url: '/appointment/pages/appointment/myDoctors'
    });
  }
});