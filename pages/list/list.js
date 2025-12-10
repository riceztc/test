//list.js
Page({
  data: {
    bills: [],
    types: ['全部', '收入', '支出'],
    typeIndex: 0
  },

  onLoad() {
    this.loadBills()
  },

  onShow() {
    // 每次显示页面时重新加载数据
    this.loadBills()
  },

  loadBills() {
    // 调用云函数获取账单列表
    wx.cloud.callFunction({
      name: 'getBills',
      data: {
        type: this.data.types[this.data.typeIndex] === '全部' ? '' : this.data.types[this.data.typeIndex]
      },
      success: res => {
        console.log('账单列表:', res.result)
        this.setData({
          bills: res.result.data || this.getMockBills()
        })
      },
      fail: err => {
        console.error('获取账单列表失败:', err)
        // 云函数调用失败时使用本地模拟数据
        this.setData({
          bills: this.getMockBills()
        })
      }
    })
  },

  getMockBills() {
    return [
      {
        id: '1',
        title: '午餐',
        amount: '25.00',
        type: '支出',
        date: '2025-12-08 12:30'
      },
      {
        id: '2', 
        title: '工资',
        amount: '5000.00',
        type: '收入',
        date: '2025-12-01 09:00'
      },
      {
        id: '3',
        title: '地铁',
        amount: '4.00',
        type: '支出', 
        date: '2025-12-08 08:15'
      }
    ]
  },

  onTypeChange(e) {
    this.setData({
      typeIndex: parseInt(e.detail.value)
    })
    this.loadBills()
  },

  goToAdd() {
    wx.navigateTo({
      url: '../detail/detail?mode=add'
    })
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `../detail/detail?mode=edit&id=${id}`
    })
  }
})