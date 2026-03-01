Page({
  data: {
    records: [],
    isEmpty: false
  },

  onLoad: function () {
    this.loadRecords();
  },

  onShow: function () {
    this.loadRecords();
  },

  loadRecords() {
    const records = wx.getStorageSync('bookingRecords') || [];
    this.setData({
      records: records,
      isEmpty: records.length === 0
    });
  },

  // 去预约
  goToBooking() {
    wx.navigateBack();
  },

  // 查看详情
  viewDetail(e) {
    const index = e.currentTarget.dataset.index;
    const record = this.data.records[index];
    const recordStr = JSON.stringify(record);
    wx.navigateTo({
      url: `/pages/bookingDetail/bookingDetail?record=${encodeURIComponent(recordStr)}`
    });
  },

  // 取消预约
  cancelBooking(e) {
    const index = e.currentTarget.dataset.index;
    const record = this.data.records[index];

    wx.showModal({
      title: '取消预约',
      content: `确定要取消${record.date}的预约吗？`,
      confirmText: '确定取消',
      cancelText: '暂不取消',
      success: (res) => {
        if (res.confirm) {
          this.doCancel(index);
        }
      }
    });
  },

  doCancel(index) {
    let records = this.data.records;
    records[index].status = '已取消';
    records[index].cancelTime = new Date().toLocaleString();

    wx.setStorageSync('bookingRecords', records);

    this.setData({
      records: records
    });

    wx.showToast({
      title: '预约已取消',
      icon: 'success'
    });
  },

  // 刷新
  onPullDownRefresh() {
    this.loadRecords();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});
