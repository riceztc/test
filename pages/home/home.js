// 万能小工具助手首页逻辑
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false
  },

  onLoad() {
    console.log('万能小工具助手启动')
    
    // 检查是否支持getUserProfile
    if (wx.getUserProfile) {
      console.log('支持getUserProfile')
      this.setData({ canIUseGetUserProfile: true })
    } else {
      console.log('不支持getUserProfile，版本过低')
    }
    
    // 检查本地缓存的用户信息
    this.checkCachedUserInfo()
  },

  onShow() {
    // 每次显示页面时更新用户信息
    this.checkCachedUserInfo()
  },

  // 检查缓存的用户信息
  checkCachedUserInfo() {
    try {
      const cachedUserInfo = wx.getStorageSync('userInfo')
      if (cachedUserInfo && cachedUserInfo.avatarUrl && cachedUserInfo.nickName) {
        console.log('找到缓存的用户信息:', cachedUserInfo)
        this.setData({
          userInfo: cachedUserInfo,
          hasUserInfo: true
        })
      } else {
        this.setData({
          hasUserInfo: false,
          userInfo: {}
        })
      }
    } catch (err) {
      console.error('检查缓存用户信息失败:', err)
      this.setData({
        hasUserInfo: false,
        userInfo: {}
      })
    }
  },

  // 获取用户信息
  getUserProfile() {
    if (!wx.getUserProfile) {
      wx.showToast({
        title: '请升级微信版本',
        icon: 'none'
      })
      return
    }
    
    wx.getUserProfile({
      desc: '用于完善会员资料，展示头像昵称',
      success: (res) => {
        console.log('getUserProfile 成功:', res.userInfo)
        
        if (res.userInfo && res.userInfo.avatarUrl && res.userInfo.nickName) {
          // 检查是否为默认昵称
          if (res.userInfo.nickName === '微信用户' || !res.userInfo.nickName.trim()) {
            console.log('检测到默认昵称，提示用户自定义')
            wx.showModal({
              title: '使用默认昵称？',
              content: '检测到您使用了默认昵称"微信用户"，是否要自定义昵称？',
              confirmText: '自定义昵称',
              cancelText: '使用默认',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  this.showManualInput()
                } else {
                  this.saveUserInfo(res.userInfo)
                }
              }
            })
          } else {
            this.saveUserInfo(res.userInfo)
          }
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

  // 手动输入昵称
  showManualInput() {
    wx.showModal({
      title: '输入昵称',
      editable: true,
      placeholderText: '请输入您的昵称',
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          const nickname = res.content.trim()
          const userInfo = {
            nickName: nickname,
            avatarUrl: '/images/default-avatar.png',
            isCustomNickName: true
          }
          
          // 如果之前获取过微信头像，可以复用
          try {
            const cachedInfo = wx.getStorageSync('userInfo')
            if (cachedInfo && cachedInfo.avatarUrl && cachedInfo.avatarUrl !== '/images/default-avatar.png') {
              userInfo.avatarUrl = cachedInfo.avatarUrl
            }
          } catch (err) {
            console.log('获取缓存的头像失败:', err)
          }
          
          this.saveUserInfo(userInfo)
        }
      }
    })
  },

  // 保存用户信息
  saveUserInfo(userInfo) {
    console.log('保存用户信息:', userInfo)
    
    this.setData({
      userInfo: userInfo,
      hasUserInfo: true
    })
    
    try {
      wx.setStorageSync('userInfo', userInfo)
      console.log('用户信息已缓存')
    } catch (err) {
      console.error('缓存用户信息失败:', err)
    }
    
    wx.showToast({
      title: '授权成功',
      icon: 'success'
    })
  },

  // 导航到工具页面
  navigateToTool(e) {
    const path = e.currentTarget.dataset.path
    console.log('导航到工具:', path)
    
    // 检查用户授权状态（对于某些需要用户信息的工具）
    if (!this.data.hasUserInfo && path.includes('index/index')) {
      wx.showModal({
        title: '需要授权',
        content: '记账本需要您授权获取头像昵称，是否现在授权？',
        confirmText: '立即授权',
        cancelText: '稍后再说',
        success: (res) => {
          if (res.confirm) {
            this.getUserProfile()
          } else {
            // 仍然可以访问工具，只是不显示用户信息
            this.navigateTo(path)
          }
        }
      })
    } else {
      this.navigateTo(path)
    }
  },

  // 执行导航
  navigateTo(path) {
    // 构建完整的页面路径
    let fullUrl = ''
    
    // 处理不同的路径格式
    if (path.includes('index/index')) {
      fullUrl = '/pages/index/index'  // 记账本
    } else if (path.includes('calculator/index')) {
      fullUrl = '/pages/calculator/calculator'  // 计算器
    } else if (path.includes('timer/index')) {
      fullUrl = '/pages/timer/timer'  // 倒计时
    } else {
      fullUrl = `/${path}`  // 其他页面使用原始路径
    }
    
    try {
      console.log('尝试跳转到:', fullUrl)
      wx.navigateTo({
        url: fullUrl,
        fail: (err) => {
          console.error('页面跳转失败:', err, '路径:', fullUrl)
          wx.showToast({
            title: '该功能正在开发中',
            icon: 'none'
          })
        }
      })
    } catch (err) {
      console.error('导航异常:', err)
      wx.showToast({
        title: '页面开发中...',
        icon: 'none'
      })
    }
  },

  // 显示更多工具
  showMoreTools() {
    wx.showModal({
      title: '更多工具',
      content: '更多实用工具正在开发中，敬请期待！\n\n即将上线：\n• 文件管理器\n• 密码生成器\n• 随机数生成器\n• 字符串工具',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '万能小工具助手 - 生活更便捷，工作更高效',
      path: '/pages/home/home',
      imageUrl: '/images/share-cover.png'
    }
  },

  onShareTimeline() {
    return {
      title: '万能小工具助手 - 您的实用工具集合',
      query: '',
      imageUrl: '/images/share-cover.png'
    }
  }
})