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
    pagelinks: {
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
      const handler = e.currentTarget.dataset.handler;
      this.triggerEvent("navigate", { handler });
    },
  },
});
