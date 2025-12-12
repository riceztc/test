// 座位表生成器页面逻辑
Page({
  data: {
    rows: 25,
    cols: 10,
    names: '1|2|3|4|5|6|7|8|9|10|11|12|13|14',
    showSeatTable: false,
    seatMatrix: []
  },

  onLoad() {
    this.generateSeats()
  },

  // 输入变化处理
  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    this.setData({
      [field]: value
    })
  },

  // 居中排序函数
  centerOrder(arr, size) {
    let result = Array(size).fill('')
    let mid = Math.floor(size / 2)
    let idx = 0
    
    // 中间位置先安排
    result[mid] = arr[idx++] || ''
    let left = mid - 1, right = mid + 1
    let toggle = true
    
    // 交替向左右安排
    while (idx < arr.length) {
      if (toggle) {
        if (left >= 0) {
          result[left--] = arr[idx++] || ''
        }
      } else {
        if (right < size) {
          result[right++] = arr[idx++] || ''
        }
      }
      toggle = !toggle
    }
    
    return result
  },

  // 生成座位表
  generateSeats() {
    const { rows, cols, names } = this.data
    
    // 解析姓名列表
    const nameList = names.split('|')
                     .map(name => name.trim())
                     .filter(name => name !== '')
    
    let seatMatrix = []
    let nameIdx = 0
    
    // 逐行生成座位
    for (let r = 0; r < rows; r++) {
      // 获取当前行的姓名
      const rowNames = nameList.slice(nameIdx, nameIdx + cols)
      const rowSeats = this.centerOrder(rowNames, cols)
      seatMatrix.push(rowSeats)
      nameIdx += cols
    }
    
    this.setData({
      seatMatrix,
      showSeatTable: true
    })
    
    console.log('生成座位表:', seatMatrix)
  },

  // 清空数据
  clearData() {
    this.setData({
      rows: 25,
      cols: 10,
      names: '',
      showSeatTable: false,
      seatMatrix: []
    })
  },

  // 导出数据
  exportData() {
    const { seatMatrix } = this.data
    
    if (!seatMatrix || seatMatrix.length === 0) {
      wx.showToast({
        title: '请先生成座位表',
        icon: 'none'
      })
      return
    }

    // 转换为CSV格式
    let csvContent = seatMatrix.map(row => 
      row.map(cell => cell || '').join(',')
    ).join('\n')
    
    // 保存到本地文件
    const fileName = `座位表_${new Date().toLocaleDateString()}.csv`
    
    wx.showModal({
      title: '导出成功',
      content: `座位表数据已准备，可手动复制到Excel中`,
      showCancel: false,
      success: () => {
        // 复制到剪贴板
        wx.setClipboardData({
          data: csvContent,
          success: () => {
            wx.showToast({
              title: '已复制到剪贴板',
              icon: 'success'
            })
          }
        })
      }
    })
  },

  // 复制到剪贴板
  copyToClipboard() {
    const { seatMatrix } = this.data
    
    if (!seatMatrix || seatMatrix.length === 0) {
      wx.showToast({
        title: '请先生成座位表',
        icon: 'none'
      })
      return
    }

    // 转换为制表符分隔的文本
    let textContent = seatMatrix.map(row => 
      row.map(cell => cell || '').join('\t')
    ).join('\n')
    
    wx.setClipboardData({
      data: textContent,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        })
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'error'
        })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '座位表生成器 - 万能小工具助手',
      path: '/pages/seat/seat'
    }
  }
})