Page({
  data: {
    logs: []
  },

  onLoad: function() {
    console.log('logs页面加载')
    this.setData({
      logs: [
        {time: new Date().toLocaleString(), action: '页面加载'},
        {time: new Date().toLocaleString(), action: '初始化完成'}
      ]
    })
  },

  goBack: function() {
    wx.navigateBack()
  }
})