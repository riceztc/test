// 倒计时页面逻辑
Page({
  data: {
    hours: '0',
    minutes: '0',
    seconds: '0',
    totalSeconds: 0,
    remainingSeconds: 0,
    displayTime: '00:00:00',
    isRunning: false,
    isPaused: false,
    progressDeg: 0,
    timer: null,
    presets: []
  },

  onLoad() {
    this.loadPresets()
  },

  onUnload() {
    this.clearTimer()
  },

  // 加载预设倒计时
  loadPresets() {
    try {
      const presets = wx.getStorageSync('timer_presets') || [
        { name: '番茄工作', time: 1500, display: '25分钟' },
        { name: '休息时间', time: 300, display: '5分钟' },
        { name: '煮鸡蛋', time: 600, display: '10分钟' },
        { name: '泡面', time: 180, display: '3分钟' }
      ]
      this.setData({ presets })
    } catch (err) {
      console.error('加载预设失败:', err)
    }
  },

  // 保存预设
  savePresets() {
    try {
      wx.setStorageSync('timer_presets', this.data.presets)
    } catch (err) {
      console.error('保存预设失败:', err)
    }
  },

  // 时钟输入处理
  onHoursInput(e) {
    const value = parseInt(e.detail.value) || 0
    this.setData({ hours: Math.min(value, 23).toString() })
  },

  onMinutesInput(e) {
    const value = parseInt(e.detail.value) || 0
    this.setData({ minutes: Math.min(value, 59).toString() })
  },

  onSecondsInput(e) {
    const value = parseInt(e.detail.value) || 0
    this.setData({ seconds: Math.min(value, 59).toString() })
  },

  // 设置快捷时间
  setQuickTime(e) {
    const time = e.currentTarget.dataset.time
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = time % 60
    
    this.setData({
      hours: hours.toString(),
      minutes: minutes.toString(),
      seconds: seconds.toString()
    })
  },

  // 格式化时间显示
  formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  },

  // 开始倒计时
  startTimer() {
    const hours = parseInt(this.data.hours) || 0
    const minutes = parseInt(this.data.minutes) || 0
    const seconds = parseInt(this.data.seconds) || 0
    
    if (hours === 0 && minutes === 0 && seconds === 0) {
      wx.showToast({
        title: '请设置倒计时时间',
        icon: 'none'
      })
      return
    }

    const totalSeconds = hours * 3600 + minutes * 60 + seconds
    
    this.setData({
      totalSeconds,
      remainingSeconds: totalSeconds,
      isRunning: true,
      isPaused: false,
      displayTime: this.formatTime(totalSeconds)
    })

    this.startCountdown()
  },

  // 开始倒计时循环
  startCountdown() {
    this.clearTimer()
    
    this.data.timer = setInterval(() => {
      let remainingSeconds = this.data.remainingSeconds - 1
      
      if (remainingSeconds <= 0) {
        remainingSeconds = 0
        this.onTimerComplete()
      }
      
      const progress = ((this.data.totalSeconds - remainingSeconds) / this.data.totalSeconds) * 360
      const progressDeg = progress - 90 // 从顶部开始
      
      this.setData({
        remainingSeconds,
        displayTime: this.formatTime(remainingSeconds),
        progressDeg
      })
    }, 1000)
  },

  // 倒计时完成
  onTimerComplete() {
    this.clearTimer()
    this.setData({
      isRunning: false,
      isPaused: false
    })
    
    // 播放提示音
    wx.playBackgroundAudio({
      dataUrl: '',
      title: '倒计时结束',
      fail: () => {
        // 如果无法播放音频，使用震动
        wx.vibrateShort({
          type: 'heavy'
        })
      }
    })
    
    // 震动提醒
    wx.vibrateShort({
      type: 'heavy'
    })
    
    // 显示通知
    wx.showModal({
      title: '倒计时结束',
      content: '您设置的倒计时已经结束！',
      confirmText: '知道了',
      showCancel: false
    })
  },

  // 暂停倒计时
  pauseTimer() {
    this.clearTimer()
    this.setData({
      isPaused: true,
      isRunning: false
    })
  },

  // 停止倒计时
  stopTimer() {
    this.clearTimer()
    this.setData({
      isRunning: false,
      isPaused: false,
      remainingSeconds: 0,
      displayTime: '00:00:00',
      progressDeg: 0
    })
  },

  // 重置倒计时
  resetTimer() {
    this.setData({
      remainingSeconds: this.data.totalSeconds,
      displayTime: this.formatTime(this.data.totalSeconds),
      progressDeg: 0
    })
  },

  // 清除定时器
  clearTimer() {
    if (this.data.timer) {
      clearInterval(this.data.timer)
      this.setData({ timer: null })
    }
  },

  // 使用预设
  usePreset(e) {
    const time = e.currentTarget.dataset.time
    this.setQuickTime({ currentTarget: { dataset: { time } } })
  },

  // 显示添加预设对话框
  showAddPreset() {
    const totalSeconds = this.getTotalSeconds()
    if (totalSeconds === 0) {
      wx.showToast({
        title: '请先设置时间',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '保存预设',
      editable: true,
      placeholderText: '输入预设名称',
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          const newPreset = {
            name: res.content.trim(),
            time: totalSeconds,
            display: this.formatTime(totalSeconds)
          }
          
          const presets = [...this.data.presets, newPreset]
          this.setData({ presets })
          this.savePresets()
          
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 删除预设
  deletePreset(e) {
    const index = e.currentTarget.dataset.index
    
    wx.showModal({
      title: '删除预设',
      content: '确定要删除这个预设吗？',
      success: (res) => {
        if (res.confirm) {
          const presets = this.data.presets.filter((_, i) => i !== index)
          this.setData({ presets })
          this.savePresets()
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 获取总秒数
  getTotalSeconds() {
    const hours = parseInt(this.data.hours) || 0
    const minutes = parseInt(this.data.minutes) || 0
    const seconds = parseInt(this.data.seconds) || 0
    return hours * 3600 + minutes * 60 + seconds
  },

  onShareAppMessage() {
    return {
      title: '倒计时器 - 万能小工具助手',
      path: '/pages/timer/timer'
    }
  }
})