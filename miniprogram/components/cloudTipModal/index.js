Component({

  /**
   * 页面的初始数据
   */
  data: {
    showTip: false,
  },
  properties: {
    showTipProps: Boolean,
    title:String,
    content:String,
    modalType: String // 弹出方式：'bottom' 底部弹出, 'center' 居中弹出
  },
  observers: {
    showTipProps: function(showTipProps) {
      this.setData({
        showTip: showTipProps
      });
    }
  },
  methods: {
    onClose(){
      this.setData({
        showTip: !this.data.showTip
      });
      this.triggerEvent('close');
    },
  }
});
