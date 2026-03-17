import {
  getAppointmentRecords,
  saveAppointmentRecords,
} from "../../utils/userInfoManager.js";
import { gotoAppointmentPage } from "../../utils/pageNavigation.js";

Page({
  data: {
    records: [],
    isEmpty: false,
  },

  onLoad: function () {
    this.loadRecords();
  },

  onShow: function () {
    this.loadRecords();
  },

  loadRecords() {
    const records = getAppointmentRecords() || [];
    const activeCount = records.filter(r => r.status === '已预约').length;
    const cancelledCount = records.filter(r => r.status === '已取消').length;
    this.setData({
      records: records,
      isEmpty: records.length === 0,
      activeCount: activeCount,
      cancelledCount: cancelledCount,
    });
  },

  // 去预约
  goToBooking() {
    gotoAppointmentPage();
  },

  // 查看详情
  viewDetail(e) {
    const index = e.currentTarget.dataset.index;
    const record = this.data.records[index];

    const statusText = record.status === "已预约" ? "已预约" : "已取消";
    const content = `预约号：${record.bookingNo}\n\n院区：${record.area.name}\n科室：${record.department.name} - ${record.subDepartment.name}\n日期：${record.date}\n时段：${record.timeSlot.name} ${record.period.name}\n状态：${statusText}${record.cancelTime ? `\n取消时间：${record.cancelTime}` : ""}`;

    wx.showModal({
      title: "预约详情",
      content: content,
      showCancel: false,
    });
  },

  // 取消预约
  cancelBooking(e) {
    const index = e.currentTarget.dataset.index;
    const record = this.data.records[index];

    if (record.status === "已取消") {
      wx.showToast({
        title: "该预约已取消",
        icon: "none",
      });
      return;
    }

    wx.showModal({
      title: "取消预约",
      content: `确定要取消${record.area.name} ${record.department.name} - ${record.subDepartment.name}的预约吗？`,
      confirmText: "确定取消",
      cancelText: "暂不取消",
      success: (res) => {
        if (res.confirm) {
          this.doCancel(index);
        }
      },
    });
  },

  doCancel(index) {
    let records = this.data.records;
    records[index].status = "已取消";
    records[index].cancelTime = new Date().toLocaleString();

    saveAppointmentRecords(records);

    this.setData({
      records: records,
    });

    wx.showToast({
      title: "预约已取消",
      icon: "success",
    });
  },

  // 刷新
  onPullDownRefresh() {
    this.loadRecords();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },
});
