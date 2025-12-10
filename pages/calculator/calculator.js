// 计算器页面逻辑
Page({
  data: {
    expression: '',
    result: '0',
    history: [],
    lastOperator: null,
    waitingForOperand: false
  },

  onLoad() {
    // 从本地存储加载历史记录
    this.loadHistory()
  },

  // 加载历史记录
  loadHistory() {
    try {
      const history = wx.getStorageSync('calculator_history') || []
      this.setData({ history: history.slice(0, 10) }) // 只保留最近10条
    } catch (err) {
      console.error('加载历史记录失败:', err)
    }
  },

  // 保存历史记录
  saveToHistory(expression, result) {
    try {
      let history = wx.getStorageSync('calculator_history') || []
      
      // 避免重复的记录
      const existingIndex = history.findIndex(item => 
        item.expression === expression && item.result === result
      )
      
      if (existingIndex > -1) {
        history.splice(existingIndex, 1)
      }
      
      // 添加新记录到开头
      history.unshift({ expression, result, time: new Date().toISOString() })
      
      // 最多保留20条记录
      history = history.slice(0, 20)
      
      wx.setStorageSync('calculator_history', history)
      this.setData({ history: history.slice(0, 10) })
    } catch (err) {
      console.error('保存历史记录失败:', err)
    }
  },

  // 添加数字
  appendNumber(e) {
    const num = e.currentTarget.dataset.num
    const { result, waitingForOperand } = this.data

    if (waitingForOperand) {
      this.setData({
        result: String(num),
        expression: this.data.expression + num,
        waitingForOperand: false
      })
    } else {
      this.setData({
        result: result === '0' ? String(num) : result + num,
        expression: this.data.expression + num
      })
    }
  },

  // 添加小数点
  appendDecimal() {
    const { result, waitingForOperand } = this.data

    if (waitingForOperand) {
      this.setData({
        result: '0.',
        expression: this.data.expression + '0.',
        waitingForOperand: false
      })
    } else if (result.indexOf('.') === -1) {
      this.setData({
        result: result + '.',
        expression: this.data.expression + '.'
      })
    }
  },

  // 添加运算符
  appendOperator(e) {
    const op = e.currentTarget.dataset.op
    const { result, expression, waitingForOperand } = this.data

    if (waitingForOperand) {
      this.setData({
        expression: expression.slice(0, -1) + op,
        lastOperator: op
      })
    } else {
      this.setData({
        expression: expression + op,
        lastOperator: op,
        waitingForOperand: true
      })
    }
  },

  // 清除
  clear() {
    this.setData({
      expression: '',
      result: '0',
      lastOperator: null,
      waitingForOperand: false
    })
  },

  // 切换正负号
  toggleSign() {
    const { result, waitingForOperand } = this.data
    
    if (result !== '0') {
      const newResult = result.startsWith('-') ? result.slice(1) : '-' + result
      const newExpression = this.data.expression + ' +/-'
      
      this.setData({
        result: newResult,
        expression: newExpression
      })
    }
  },

  // 百分比
  percentage() {
    const { result } = this.data
    const value = parseFloat(result)
    
    if (!isNaN(value)) {
      const newResult = (value / 100).toString()
      const newExpression = this.data.expression + ' %'
      
      this.setData({
        result: newResult,
        expression: newExpression
      })
    }
  },

  // 计算结果
  calculate() {
    const { expression } = this.data
    
    if (!expression) return

    try {
      // 创建安全的计算表达式
      const safeExpression = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/±/g, '')
        .replace(/%/g, '/100')
      
      // 使用Function构造函数进行安全计算
      const calculate = new Function('return ' + safeExpression)
      const result = calculate()
      
      if (isFinite(result)) {
        const resultStr = result.toString()
        const expressionDisplay = expression + ' ='
        
        this.setData({
          expression: expressionDisplay,
          result: resultStr
        })
        
        // 保存到历史记录
        this.saveToHistory(expressionDisplay, resultStr)
      } else {
        throw new Error('计算结果无效')
      }
    } catch (error) {
      console.error('计算错误:', error)
      wx.showToast({
        title: '计算错误',
        icon: 'none'
      })
    }
  },

  // 清空历史记录
  clearHistory() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有历史记录吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.removeStorageSync('calculator_history')
            this.setData({ history: [] })
            wx.showToast({
              title: '已清空',
              icon: 'success'
            })
          } catch (err) {
            console.error('清空历史记录失败:', err)
          }
        }
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '科学计算器 - 万能小工具助手',
      path: '/pages/calculator/calculator'
    }
  }
})