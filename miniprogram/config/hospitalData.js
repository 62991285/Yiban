module.exports = {
  areas: [
    {
      id: 1,
      name: '汉口院区',
      address: '武汉市江汉区解放大道1095号',
      phone: '027-85726668'
    },
    {
      id: 2,
      name: '光谷院区',
      address: '武汉市洪山区光谷大道3号',
      phone: '027-87651888'
    },
    {
      id: 3,
      name: '中法院区',
      address: '武汉市蔡甸区东风大道8号',
      phone: '027-69378888'
    },
    {
      id: 4,
      name: '军山医院',
      address: '武汉经济技术开发区军山街',
      phone: '027-84895555'
    }
  ],
  departments: [
    {
      id: 1,
      name: '内科',
      icon: '🩺',
      subDepartments: [
        { id: 101, name: '普通门诊', description: '常见疾病诊治' },
        { id: 102, name: '心血管内科', description: '高血压、冠心病等' },
        { id: 103, name: '呼吸与重症医学科', description: '哮喘、肺炎等' },
        { id: 104, name: '消化内科', description: '胃肠疾病诊治' },
        { id: 105, name: '神经内科', description: '脑血管疾病' },
        { id: 106, name: '内分泌科', description: '糖尿病、甲亢等' },
        { id: 107, name: '血液内科', description: '贫血、白血病等' },
        { id: 108, name: '肾内科', description: '肾炎、肾衰等' }
      ]
    },
    {
      id: 2,
      name: '外科',
      icon: '🏥',
      subDepartments: [
        { id: 201, name: '普通外科', description: '阑尾炎、疝气等' },
        { id: 202, name: '骨科', description: '骨折、关节病等' },
        { id: 203, name: '心胸外科', description: '心脏、胸部手术' },
        { id: 204, name: '泌尿外科', description: '肾结石、前列腺等' },
        { id: 205, name: '神经外科', description: '颅脑疾病' }
      ]
    },
    {
      id: 3,
      name: '妇产科',
      icon: '👶',
      subDepartments: [
        { id: 301, name: '妇科', description: '妇科疾病诊治' },
        { id: 302, name: '产科', description: '产检、分娩等' },
        { id: 303, name: '生殖医学中心', description: '不孕不育诊治' }
      ]
    },
    {
      id: 4,
      name: '儿科',
      icon: '🧸',
      subDepartments: [
        { id: 401, name: '儿科门诊', description: '儿童常见病' },
        { id: 402, name: '儿童保健科', description: '儿童体检、疫苗接种' },
        { id: 403, name: '新生儿科', description: '新生儿疾病诊治' }
      ]
    },
    {
      id: 5,
      name: '眼科',
      icon: '👁️',
      subDepartments: [
        { id: 501, name: '眼科门诊', description: '近视、白内障等' },
        { id: 502, name: '视光中心', description: '配镜、视力矫正' }
      ]
    },
    {
      id: 6,
      name: '耳鼻喉科',
      icon: '👂',
      subDepartments: [
        { id: 601, name: '耳鼻喉门诊', description: '中耳炎、鼻炎等' },
        { id: 602, name: '听力中心', description: '听力检查、助听器' }
      ]
    },
    {
      id: 7,
      name: '口腔科',
      icon: '🦷',
      subDepartments: [
        { id: 701, name: '口腔门诊', description: '拔牙、补牙等' },
        { id: 702, name: '正畸科', description: '牙齿矫正' }
      ]
    },
    {
      id: 8,
      name: '皮肤科',
      icon: '🧴',
      subDepartments: [
        { id: 801, name: '皮肤科门诊', description: '皮炎、湿疹等' },
        { id: 802, name: '美容科', description: '皮肤美容、激光治疗' }
      ]
    }
  ],
  timeSlots: [
    {
      id: 1,
      name: '上午',
      value: 'morning',
      periods: [
        { id: '0800', name: '08:00' },
        { id: '0830', name: '08:30' },
        { id: '0900', name: '09:00' },
        { id: '0930', name: '09:30' },
        { id: '1000', name: '10:00' },
        { id: '1030', name: '10:30' },
        { id: '1100', name: '11:00' },
        { id: '1130', name: '11:30' }
      ]
    },
    {
      id: 2,
      name: '下午',
      value: 'afternoon',
      periods: [
        { id: '1400', name: '14:00' },
        { id: '1430', name: '14:30' },
        { id: '1500', name: '15:00' },
        { id: '1530', name: '15:30' },
        { id: '1600', name: '16:00' },
        { id: '1630', name: '16:30' },
        { id: '1700', name: '17:00' }
      ]
    },
    {
      id: 3,
      name: '晚上',
      value: 'evening',
      periods: [
        { id: '1800', name: '18:00' },
        { id: '1830', name: '18:30' },
        { id: '1900', name: '19:00' },
        { id: '1930', name: '19:30' },
        { id: '2000', name: '20:00' }
      ]
    }
  ]
};
