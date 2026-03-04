Component({
  properties: {
    speaker: {
      type: String,
      value: "user",
    },
    options: {
      type: Array,
      value: [],
    },
    navigations: {
      type: Array,
      value: [],
    },
  },
  methods: {
    onOptionTap(e) {
      const option = e.currentTarget.dataset.option;
      this.triggerEvent("selectoption", { option });
    },
    onActionTap(e) {
      const url = e.currentTarget.dataset.url;
      if (url) {
        wx.navigateTo({ url });
      }
    },
  },
});
