//index.js
const app = getApp()

Page({
  data: {
    motto: '简单记账本',
    hasUserInfo: false,
    todayExpense: '0.00',
    todayIncome: '0.00',
    netIncome: '0.00',
    updateTime: '',
    lastUpdateTime: 0
  },

  onLoad() {
    console.log('页面加载，检查用户授权状态...')
    
    // 检查用户是否已经授权
    this.checkUserAuth()
    
    // 初始化统计数据
    this.getTodayStats()
    
    // 设置定时器，每30秒自动更新统计
    this.updateTimer = setInterval(() => {
      this.getTodayStats()
    }, 30000)
  },

  checkUserAuth() {
    wx.getSetting({
      success: (res) => {
        console.log('用户授权状态:', res.authSetting)
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以使用 open-data 组件
          this.setData({
            hasUserInfo: true
          })
          console.log('用户已授权，可以使用 open-data 组件')
        } else {
          // 未授权，等待用户授权
          this.setData({
            hasUserInfo: false
          })
          console.log('用户未授权，需要点击按钮获取授权')
        }
      },
      fail: (err) => {
        console.error('检查授权状态失败:', err)
        this.setData({
          hasUserInfo: false
        })
      }
    })
  },

  getUserInfo(e) {
    console.log('获取用户信息:', e)
    
    // 检查是否获取到了用户信息
    if (e.detail && e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
      
      console.log('用户信息获取成功:', e.detail.userInfo)
      wx.showToast({
        title: '获取成功',
        icon: 'success'
      })
    } else {
      console.log('用户信息获取失败:', e)
      wx.showToast({
        title: '获取失败，请重试',
        icon: 'none'
      })
    }
  },

  // 简化的获取用户信息方式
  getUserProfile() {
    console.log('尝试获取用户信息...')
    
    wx.getUserProfile({
      desc: '用于完善会员资料，展示头像昵称',
      success: (res) => {
        console.log('getUserProfile 成功:', res.userInfo)
        
        if (res.userInfo && res.userInfo.nickName) {
          // 简化数据，只保存基本信息
          const userInfo = {
            nickName: res.userInfo.nickName,
            avatarUrl: res.userInfo.avatarUrl
          }
          
          app.globalData.userInfo = userInfo
          this.setData({
            userInfo: userInfo,
            hasUserInfo: true,
            showManualInput: false
          })
          
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          })
          
          // 保存到本地存储
          wx.setStorageSync('userInfo', userInfo)
        } else {
          wx.showToast({
            title: '获取信息不完整',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.log('getUserProfile 失败:', err)
        
        // 简化错误处理
        if (err.errMsg.includes('cancel')) {
          wx.showToast({
            title: '已取消授权',
            icon: 'none'
          })
        } else {
          wx.showModal({
            title: '需要登录',
            content: '请先登录以获得完整体验',
            confirmText: '重新尝试',
            cancelText: '手动设置',
            success: (modalRes) => {
              if (modalRes.confirm) {
                this.getUserProfile()
              } else {
                this.toggleManualInput()
              }
            }
          })
        }
      }
    })
  },

  // 手动输入昵称
  toggleManualInput() {
    this.setData({
      showManualInput: !this.data.showManualInput
    })
  },

  onNicknameInput(e) {
    this.setData({
      tempNickname: e.detail.value
    })
  },

  confirmNickname() {
    const nickname = this.data.tempNickname.trim()
    if (!nickname) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      })
      return
    }

    const userInfo = {
      nickName: nickname,
      avatarUrl: '', // 没有头像URL
      country: '',
      province: '',
      city: ''
    }

    app.globalData.userInfo = userInfo
    this.setData({
      userInfo: userInfo,
      hasUserInfo: true,
      showManualInput: false,
      tempNickname: ''
    })

    // 保存到本地存储
    wx.setStorageSync('userInfo', userInfo)

    wx.showToast({
      title: '设置成功',
      icon: 'success'
    })
  },

  // 头像加载失败处理
  onImageError(e) {
    console.log('头像加载失败:', e)
    // 设置一个默认的userInfo，隐藏图片
    this.setData({
      'userInfo.avatarUrl': ''
    })
  },

  getTodayStats() {
    // 调用云函数获取今日统计
    wx.cloud.callFunction({
      name: 'getTodayStats',
      success: res => {
        console.log('今日统计:', res.result)
        if (res.result.success) {
          this.setData({
            todayExpense: res.result.totalExpense || '0.00',
            todayIncome: res.result.totalIncome || '0.00',
            netIncome: res.result.netIncome || '0.00',
            updateTime: res.result.updateTime || new Date().toLocaleTimeString(),
            lastUpdateTime: Date.now()
          })
        } else {
          // 云函数返回失败，使用模拟数据
          this.setMockStats()
        }
      },
      fail: err => {
        console.error('获取今日统计失败:', err)
        // 云函数调用失败时的本地模拟数据
        this.setMockStats()
      }
    })
  },

  setMockStats() {
    const mockExpense = (Math.random() * 200).toFixed(2)
    const mockIncome = (Math.random() * 1000).toFixed(2)
    const mockNet = (mockIncome - mockExpense).toFixed(2)
    
    this.setData({
      todayExpense: mockExpense,
      todayIncome: mockIncome,
      netIncome: mockNet,
      updateTime: new Date().toLocaleTimeString(),
      lastUpdateTime: Date.now()
    })
  },

  goToList() {
    wx.navigateTo({
      url: '../list/list'
    })
  },

  goToAdd() {
    wx.navigateTo({
      url: '../detail/detail?mode=add'
    })
  },

  bindViewTap() {
    // 点击头像时，显示用户信息或跳转到设置页面
    if (this.data.hasUserInfo) {
      wx.showActionSheet({
        itemList: ['查看个人信息', '刷新统计', '关于应用', '查看日志'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              this.showUserInfo()
              break
            case 1:
              this.refreshStats()
              break
            case 2:
              this.showAbout()
              break
            case 3:
              wx.navigateTo({
                url: '../logs/logs'
              })
              break
          }
        }
      })
    } else {
      this.getUserProfile()
    }
  },

  showUserInfo() {
    const userInfo = this.data.userInfo
    wx.showModal({
      title: '个人信息',
      content: `昵称: ${userInfo.nickName || '未设置'}\n地区: ${userInfo.country || ''} ${userInfo.city || ''}`,
      showCancel: false
    })
  },

  showAbout() {
    wx.showModal({
      title: '关于简单记账本',
      content: '这是一个学习小程序开发的教学项目\n展示前后端数据交互的完整流程',
      showCancel: false
    })
  },

  onShow() {
    // 每次显示页面时更新统计
    this.getTodayStats()
  },

  onHide() {
    // 页面隐藏时清除定时器，节省资源
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
    }
  },

  onUnload() {
    // 页面卸载时清除定时器
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
    }
  },

  // 手动刷新统计
  refreshStats() {
    wx.showLoading({
      title: '刷新中...'
    })
    this.getTodayStats()
    setTimeout(() => {
      wx.hideLoading()
    }, 1000)
  }
})