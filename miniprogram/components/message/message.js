Component({
  properties: {
    speaker: {
      type: String,
      value: 'user' // 'ai' 或 'user'
    },
    options: {
      type: Array,
      value: []
    },
    actions: {
      type: Array,
      value: [] // 格式：[{ label: '图文报告', url: '/pages/report/report' }, ...]
    }
  },
  methods: {
    onOptionTap(e) {
      const option = e.currentTarget.dataset.option;
      this.triggerEvent('selectoption', { option });
    },
    onActionTap(e) {
      const url = e.currentTarget.dataset.url;
      if (url) {
        wx.navigateTo({ url });
      }
    }
  }
});