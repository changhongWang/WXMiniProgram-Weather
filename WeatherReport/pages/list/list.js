// pages/list/list.js
const weatherMap = {
  "sunny": "晴天",
  "overcast": "阴天",
  "cloudy": "多云",
  "lightrain": "小雨",
  "heavyrain": "大雨",
  "snow": "雪"
}

const weekDay = {
  1: '星期一',
  2: '星期二',
  3: '星期三',
  4: '星期四',
  5: '星期五',
  6: '星期六',
  0: '星期日',
}

Page({

  onLoad: function(options) {
    this.getFutureWeather(options.city);
  },
  data: {
    futureDetail: []
  },

  getFutureWeather: function(city) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/future',
      data: {
        city,
        time: new Date().getTime()
      },
      success: (data) => {
        console.log(data.data.result);
        let day = this.getCurrentDay();
        if(data.statusCode == 200) {
          let results = data.data.result;
          for (let i=0;i<results.length;i++){
            results[i].weatherName = weatherMap[results[i].weather];
            results[i].weekDay = weekDay[(day+i)%7];
          }
          this.setData({futureDetail: results});
        }
      }
    })
  },

  getCurrentDay() {
    return new Date().getDay();
  }
})