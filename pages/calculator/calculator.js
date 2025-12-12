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
    
    // 输出屏幕和容器尺寸信息
    this.logDimensions()
  },

  // 自定义表达式计算器
  evaluateExpression(expression) {
    console.log('开始计算表达式:', expression)
    
    // 移除所有空格
    expression = expression.replace(/\s+/g, '')
    
    // 如果表达式为空，返回0
    if (!expression) return 0
    
    // 简单的加法计算（先实现基本功能）
    const parts = expression.split('+')
    if (parts.length === 2) {
      const num1 = parseFloat(parts[0])
      const num2 = parseFloat(parts[1])
      
      if (!isNaN(num1) && !isNaN(num2)) {
        console.log('执行加法:', num1, '+', num2, '=', num1 + num2)
        return num1 + num2
      }
    }
    
    // 简单的减法计算
    const subParts = expression.split('-')
    if (subParts.length === 2 && expression.indexOf('-') > 0) {
      const num1 = parseFloat(subParts[0])
      const num2 = parseFloat(subParts[1])
      
      if (!isNaN(num1) && !isNaN(num2)) {
        console.log('执行减法:', num1, '-', num2, '=', num1 - num2)
        return num1 - num2
      }
    }
    
    // 简单的乘法计算
    const mulParts = expression.split('*')
    if (mulParts.length === 2) {
      const num1 = parseFloat(mulParts[0])
      const num2 = parseFloat(mulParts[1])
      
      if (!isNaN(num1) && !isNaN(num2)) {
        console.log('执行乘法:', num1, '*', num2, '=', num1 * num2)
        return num1 * num2
      }
    }
    
    // 简单的除法计算
    const divParts = expression.split('/')
    if (divParts.length === 2) {
      const num1 = parseFloat(divParts[0])
      const num2 = parseFloat(divParts[1])
      
      if (!isNaN(num1) && !isNaN(num2) && num2 !== 0) {
        console.log('执行除法:', num1, '/', num2, '=', num1 / num2)
        return num1 / num2
      } else if (num2 === 0) {
        throw new Error('除数不能为零')
      }
    }
    
    // 如果是单个数字，直接返回
    const singleNum = parseFloat(expression)
    if (!isNaN(singleNum)) {
      console.log('单个数字:', singleNum)
      return singleNum
    }
    
    throw new Error('无法解析的表达式: ' + expression)
  },

  // 输出屏幕和容器尺寸
  logDimensions() {
    // 获取屏幕信息
    const systemInfo = wx.getSystemInfoSync()
    console.log('=== 屏幕尺寸信息 ===')
    console.log('屏幕宽度:', systemInfo.screenWidth + 'px')
    console.log('屏幕高度:', systemInfo.screenHeight + 'px')
    console.log('可用窗口宽度:', systemInfo.windowWidth + 'px')  
    console.log('可用窗口高度:', systemInfo.windowHeight + 'px')
    console.log('像素比:', systemInfo.pixelRatio)
    
    // 获取容器尺寸（需要等页面渲染完成后）
    setTimeout(() => {
      const query = wx.createSelectorQuery()
      
      // 获取容器尺寸
      query.select('.container').boundingClientRect((rect) => {
        if (rect) {
          console.log('=== 容器尺寸信息 ===')
          console.log('Container 宽度:', rect.width + 'px')
          console.log('Container 高度:', rect.height + 'px')
          console.log('Container 左边距:', rect.left + 'px')
          console.log('Container 顶部边距:', rect.top + 'px')
        }
      }).exec()
      
      // 获取计算器尺寸
      query.select('.calculator').boundingClientRect((rect) => {
        if (rect) {
          console.log('=== 计算器容器尺寸信息 ===')
          console.log('Calculator 宽度:', rect.width + 'px')
          console.log('Calculator 高度:', rect.height + 'px')
          console.log('Calculator 左边距:', rect.left + 'px')
          console.log('Calculator 顶部边距:', rect.top + 'px')
        }
      }).exec()
      
      // 获取按钮区域尺寸
      query.select('.buttons').boundingClientRect((rect) => {
        if (rect) {
          console.log('=== 按钮区域尺寸信息 ===')
          console.log('Buttons 宽度:', rect.width + 'px')
          console.log('Buttons 高度:', rect.height + 'px')
          console.log('Buttons 左边距:', rect.left + 'px')
          console.log('Buttons 顶部边距:', rect.top + 'px')
        }
      }).exec()
      
      // 获取单个按钮尺寸
      query.select('.btn').boundingClientRect((rect) => {
        if (rect) {
          console.log('=== 单个按钮尺寸信息 ===')
          console.log('按钮 宽度:', rect.width + 'px')
          console.log('按钮 高度:', rect.height + 'px')
        }
      }).exec()
      
    }, 1000) // 延迟1秒确保页面完全渲染
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
    const { result, waitingForOperand, expression } = this.data

    console.log('添加数字:', num)
    console.log('当前状态 - 结果:', result, '等待操作数:', waitingForOperand, '表达式:', expression)

    if (waitingForOperand) {
      const newExpression = expression + num
      console.log('等待操作数状态 - 新表达式:', newExpression)
      this.setData({
        result: String(num),
        expression: newExpression,
        waitingForOperand: false
      })
    } else {
      const newResult = result === '0' ? String(num) : result + num
      const newExpression = expression + num
      console.log('正常状态 - 新结果:', newResult, '新表达式:', newExpression)
      this.setData({
        result: newResult,
        expression: newExpression
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

  // 退格删除
  backspace() {
    const { result, expression, waitingForOperand } = this.data
    
    if (result.length > 1) {
      const newResult = result.slice(0, -1)
      const newExpression = expression.slice(0, -1)
      
      this.setData({
        result: newResult === '' ? '0' : newResult,
        expression: newExpression,
        waitingForOperand: false
      })
    } else {
      this.setData({
        result: '0',
        expression: expression.slice(0, -1),
        waitingForOperand: false
      })
    }
  },

  // 添加运算符
  appendOperator(e) {
    const op = e.currentTarget.dataset.op
    const { result, expression, waitingForOperand } = this.data

    console.log('添加运算符:', op)
    console.log('当前表达式:', expression)
    console.log('当前结果:', result)
    console.log('等待操作数:', waitingForOperand)

    if (waitingForOperand) {
      // 替换前一个运算符
      const newExpression = expression.slice(0, -1) + op
      console.log('替换运算符后的表达式:', newExpression)
      this.setData({
        expression: newExpression,
        lastOperator: op
      })
    } else {
      // 添加新运算符
      const newExpression = expression + op
      console.log('添加运算符后的表达式:', newExpression)
      this.setData({
        expression: newExpression,
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
    
    console.log('计算表达式:', expression)
    console.log('当前结果:', this.data.result)
    
    if (!expression) {
      console.log('表达式为空，无法计算')
      return
    }

    try {
      // 创建安全的计算表达式
      let safeExpression = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/±/g, '')
        .replace(/%/g, '/100')
        .replace(/=/g, '') // 移除可能存在的等号
      
      // 清理表达式中的多余字符
      safeExpression = safeExpression.replace(/\s+/g, '').trim()
      
      console.log('处理后的安全表达式:', safeExpression)
      
      // 检查表达式是否有效
      if (!safeExpression || /^[\+\-\*\/\.\%]$/.test(safeExpression)) {
        throw new Error('表达式无效')
      }
      
      // 使用自定义计算器进行计算
      console.log('即将计算的表达式:', safeExpression)
      let result
      try {
        result = this.evaluateExpression(safeExpression)
        console.log('计算成功，结果:', result)
      } catch (calcError) {
        console.error('计算错误:', calcError)
        throw new Error('表达式计算失败: ' + calcError.message)
      }
      
      console.log('计算结果:', result)
      
      if (isFinite(result)) {
        const resultStr = result.toString()
        const expressionDisplay = expression + ' ='
        
        this.setData({
          expression: expressionDisplay,
          result: resultStr,
          waitingForOperand: true
        })
        
        // 保存到历史记录
        this.saveToHistory(expressionDisplay, resultStr)
      } else {
        throw new Error('计算结果无效')
      }
    } catch (error) {
      console.error('计算错误详情:', error)
      console.error('原始表达式:', expression)
      wx.showToast({
        title: '计算错误: ' + error.message,
        icon: 'none',
        duration: 2000
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