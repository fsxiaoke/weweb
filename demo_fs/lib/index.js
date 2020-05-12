const duration = 2000
class Http {
  request (config) {
    wx.request({
      url: `https://httpbin.org/post`,
      method: 'POST',
      data: {
        noncestr: Date.now()
      },
      success: function (result) {
        wx.showToast({
          title: '请求成功',
          icon: 'success',
          mask: true,
          duration: duration
        })

        console.log('request success', result)
      },

      fail: function ({ errMsg }) {
        console.log('request fail', errMsg)
      }
    })
  }
}

export default new Http()
