//index.js - 基于微信官方文档的头像昵称填写功能
const app = getApp()

Page({
  data: {
    motto: '简单记账本',
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    todayExpense: '0.00',
    todayIncome: '0.00',
    netIncome: '0.00',
    updateTime: '',
    lastUpdateTime: 0
  },

  onLoad() {
    console.log('页面加载，检查getUserProfile支持情况...')
    
    // 检查是否支持getUserProfile
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
      console.log('支持getUserProfile接口')
    } else {
      console.log('不支持getUserProfile接口，请升级微信版本')
    }
    
    // 检查本地缓存的用户信息
    this.checkCachedUserInfo()
    
    // 初始化统计数据
    this.getTodayStats()
    
    // 设置定时器，每30秒自动更新统计
    this.updateTimer = setInterval(() => {
      this.getTodayStats()
    }, 30000)
  },

  checkCachedUserInfo() {
    // 检查本地缓存的用户信息
    try {
      const cachedUserInfo = wx.getStorageSync('userInfo')
      if (cachedUserInfo && cachedUserInfo.avatarUrl && cachedUserInfo.nickName) {
        console.log('找到缓存的用户信息:', cachedUserInfo)
        this.setData({
          userInfo: cachedUserInfo,
          hasUserInfo: true
        })
      } else {
        console.log('没有找到缓存的用户信息')
        this.setData({
          hasUserInfo: false
        })
      }
    } catch (err) {
      console.error('检查缓存用户信息失败:', err)
      this.setData({
        hasUserInfo: false
      })
    }
  },

  // 微信官方推荐的用户信息获取方式
  getUserProfile() {
    console.log('用户点击获取头像昵称...')
    
    if (!wx.getUserProfile) {
      wx.showToast({
        title: '请升级微信版本',
        icon: 'none'
      })
      return
    }
    
    wx.getUserProfile({
      desc: '用于完善会员资料，展示头像昵称', // 声明获取用户个人信息后的用途，后续会展示在弹窗中
      success: (res) => {
        console.log('getUserProfile 成功:', res.userInfo)
        
        if (res.userInfo && res.userInfo.avatarUrl && res.userInfo.nickName) {
          // 获取用户信息成功，保存到页面数据
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
          
          // 将用户信息保存到本地缓存，避免重复弹窗
          try {
            wx.setStorageSync('userInfo', res.userInfo)
            console.log('用户信息已缓存')
          } catch (err) {
            console.error('缓存用户信息失败:', err)
          }
          
          wx.showToast({
            title: '授权成功',
            icon: 'success'
          })
          
          console.log('用户授权成功，头像和昵称已保存')
        } else {
          wx.showToast({
            title: '获取信息不完整',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.log('getUserProfile 失败:', err)
        
        if (err.errMsg.includes('cancel')) {
          wx.showToast({
            title: '已取消授权',
            icon: 'none'
          })
        } else {
          wx.showModal({
            title: '需要授权',
            content: '获取头像昵称需要您的授权，授权后即可显示您的微信头像和昵称',
            confirmText: '重新授权',
            cancelText: '稍后再说',
            success: (modalRes) => {
              if (modalRes.confirm) {
                this.getUserProfile()
              }
            }
          })
        }
      }
    })
  },

  // 兼容旧版本的getUserInfo方法（已不推荐）
  getUserInfo(e) {
    console.log('使用旧版getUserInfo:', e.detail.userInfo)
    
    if (e.detail.userInfo && e.detail.userInfo.avatarUrl && e.detail.userInfo.nickName) {
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
      
      // 缓存用户信息
      try {
        wx.setStorageSync('userInfo', e.detail.userInfo)
      } catch (err) {
        console.error('缓存用户信息失败:', err)
      }
      
      wx.showToast({
        title: '获取成功',
        icon: 'success'
      })
    } else {
      wx.showToast({
        title: '获取失败',
        icon: 'none'
      })
    }
  },

  getTodayStats() {
    // 调用云函数获取今日统计
    wx.cloud.callFunction({
      name: 'getTodayStats',
      success: res => {
        console.log('今日统计结果:', res.result)
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
    // 头像点击后不执行任何操作，仅作为装饰
    if (!this.data.hasUserInfo) {
      this.getUserProfile()
    }
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