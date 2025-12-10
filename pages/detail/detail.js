//detail.js
Page({
  data: {
    mode: 'add', // 'add' 或 'edit'
    id: '',
    bill: {
      title: '',
      amount: '',
      type: '支出',
      remark: ''
    }
  },

  onLoad(options) {
    const { mode, id } = options
    this.setData({
      mode: mode || 'add',
      id: id || ''
    })

    if (mode === 'edit' && id) {
      this.loadBill(id)
    }
  },

  loadBill(id) {
    // 调用云函数获取账单详情
    wx.cloud.callFunction({
      name: 'getBillDetail',
      data: { id },
      success: res => {
        console.log('账单详情:', res.result)
        if (res.result.data) {
          this.setData({
            bill: res.result.data
          })
        }
      },
      fail: err => {
        console.error('获取账单详情失败:', err)
        // 云函数调用失败时使用本地模拟数据
        this.setData({
          bill: {
            title: '模拟账单',
            amount: '50.00',
            type: '支出',
            remark: '这是一个模拟的账单数据'
          }
        })
      }
    })
  },

  onTitleInput(e) {
    this.setData({
      'bill.title': e.detail.value
    })
  },

  onAmountInput(e) {
    this.setData({
      'bill.amount': e.detail.value
    })
  },

  onRemarkInput(e) {
    this.setData({
      'bill.remark': e.detail.value
    })
  },

  onTypeChange(e) {
    this.setData({
      'bill.type': e.detail.value
    })
  },

  onSubmit(e) {
    const bill = this.data.bill
    
    // 表单验证
    if (!bill.title.trim()) {
      wx.showToast({
        title: '请输入标题',
        icon: 'none'
      })
      return
    }

    if (!bill.amount || parseFloat(bill.amount) <= 0) {
      wx.showToast({
        title: '请输入正确金额',
        icon: 'none'
      })
      return
    }

    const billData = {
      title: bill.title,
      amount: parseFloat(bill.amount).toFixed(2),
      type: bill.type,
      remark: bill.remark
    }

    if (this.data.mode === 'add') {
      this.addBill(billData)
    } else {
      this.updateBill(billData)
    }
  },

  addBill(billData) {
    wx.showLoading({
      title: '添加中...'
    })

    console.log('准备添加的账单数据:', billData)

    // 调用云函数添加账单
    wx.cloud.callFunction({
      name: 'addBill',
      data: billData,
      success: res => {
        console.log('云函数调用成功:', res)
        console.log('添加成功:', res.result)
        wx.hideLoading()
        
        if (res.result && res.result.success) {
          wx.showToast({
            title: '添加成功',
            icon: 'success'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        } else {
          wx.showToast({
            title: res.result.message || '添加失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('云函数调用失败:', err)
        wx.hideLoading()
        wx.showModal({
          title: '添加失败',
          content: '错误信息: ' + err.errMsg + '\n\n请检查:\n1. 云函数是否已上传\n2. 数据库是否已创建\n3. 环境ID是否正确',
          showCancel: false
        })
      }
    })
  },

  updateBill(billData) {
    wx.showLoading({
      title: '更新中...'
    })

    // 调用云函数更新账单
    wx.cloud.callFunction({
      name: 'updateBill',
      data: {
        id: this.data.id,
        ...billData
      },
      success: res => {
        console.log('更新成功:', res.result)
        wx.hideLoading()
        wx.showToast({
          title: '更新成功',
          icon: 'success'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      },
      fail: err => {
        console.error('更新失败:', err)
        wx.hideLoading()
        wx.showToast({
          title: '更新失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  onDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条账单吗？',
      success: (res) => {
        if (res.confirm) {
          this.deleteBill()
        }
      }
    })
  },

  deleteBill() {
    wx.showLoading({
      title: '删除中...'
    })

    // 调用云函数删除账单
    wx.cloud.callFunction({
      name: 'deleteBill',
      data: { id: this.data.id },
      success: res => {
        console.log('删除成功:', res.result)
        wx.hideLoading()
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      },
      fail: err => {
        console.error('删除失败:', err)
        wx.hideLoading()
        wx.showToast({
          title: '删除失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  onCancel() {
    wx.navigateBack()
  }
})