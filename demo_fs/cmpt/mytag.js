// cmpt/mytag.js
Component({

  behaviors: [],

  // 属性定义（详情参见下文）
  properties: {
    myProperty: { // 属性名
      type: String,
      value: 'default myProperty'
    },
    textColor: { // 属性名
      type: String,
      value: '#ffffff'
    }
  },

  data: {
    testdata: 'defaulttestdata'
  }, // 私有数据，可用于模板渲染

  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () {
      console.log('lifetimes attached')
    },
    moved: function () {
      console.log('lifetimes moved')
    },
    detached: function () {
      console.log('lifetimes detached')
    },
  },

  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  attached: function () {
    console.log('attached')
    console.log(this.myProperty);
  }, // 此处attached的声明会被lifetimes字段中的声明覆盖
  ready: function () {
    console.log('ready')
  },

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () {
      console.log('pageLifetimes show')
    },
    hide: function () {
      console.log('pageLifetimes hide')
    },
    resize: function () {
      console.log('pageLifetimes resize')
    },
  },

  methods: {
    onMyButtonTap: function () {
      this.setData({
        // 更新属性和数据的方法与更新页面数据的方法类似
      })
    },
    // 内部方法建议以下划线开头
    _myPrivateMethod: function () {
      // 这里将 data.A[0].B 设为 'myPrivateData'
      this.setData({
        'A[0].B': 'myPrivateData'
      })
    },
    _propertyChange: function (newVal, oldVal) {

    }
  }
})
