// 权限
const UNPROMPTED = 0;
const UNAUTHORIZED = 1;
const AUTHORIZED = 2;
// 对应文字提示
const UNPROMPTED_TIPS = "点击获取当前位置";
const UNAUTHORIZED_TIPS = "点击开启位置权限";
const AUTHORIZED_TIPS = "";

const weatherMap = {
  "sunny": "晴天",
  "overcast": "阴天",
  "cloudy": "多云",
  "lightrain": "小雨",
  "heavyrain": "大雨",
  "snow": "雪"
}

const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

let QQMapWx = require("../../libs/qqmap-wx-jssdk.min.js");
let qqmapsdk;

Page({
  onShow() {
    console.log('show');
  },
  onReady() {
    console.log('ready');
  },
  onLoad() {
    console.log('load')
    this.getLocation();

    // 实例化地图API
    qqmapsdk = new QQMapWx({
      key: 'BMYBZ-MOMWQ-MSA5O-GRIFV-IS6H7-5QF36'
    })
  },
  onPullDownRefresh() {
    this.getWeather(()=>{
      wx.stopPullDownRefresh();
    });
  },
  data: {
    temperature: '--',
    weather: '--',
    img_src: '/images/sunny-bg.png',
    weatherFuture: [],
    today: {
      maxTemp: 0,
      minTemp: 0
    },
    city: '正在获取城市'
  },
  getWeather(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      method: 'GET',
      data: {
        city: this.data.city
      },
      success: (data) => {
        if (data.statusCode == 200) {
          let weather_now = data.data.result.now;
          let weatherFuture = data.data.result.forecast;
          let temperature = weather_now.temp;
          let weather = weatherMap[weather_now.weather];
          let img_src = `/images/${weather_now.weather}-bg.png`;

          let currentHour = this.getCurrentHour();
          for(let i=0;i<weatherFuture.length;i++){
            weatherFuture[i].img_src = `/images/${weatherFuture[i].weather}-icon.png`;
            weatherFuture[i].hour = i==0?'现在':(currentHour + i * 3)%24 + '时';
          }
          let today = data.data.result.today;
          this.setData({ weather, temperature, img_src });
          this.setData({ weatherFuture });
          this.setData({ today });
          wx.setNavigationBarColor({
            frontColor: '#000000',
            backgroundColor: weatherColorMap[weather_now.weather]
          });
        }
      },
      complete: ()=>{
        callback && callback();
      }
    })
  },
  getCurrentHour() {
    return new Date().getHours();
  },
  getLocation() {
    wx.getLocation({
      success: (res) => {
        this.getReverseGeocoder(res.latitude, res.longitude);
      },
      fail: (res) => {
        wx.showModal({
          title: '',
          content: '"天气预报家"需要使用您的地理位置信息，请在接下来的页面中授权使用，否则您可能无法正常使用该小程序的某些功能',
          success: (res) => {
            if(res.confirm){
              wx.openSetting({
                success: (res) => {
                  if (res.authSetting["scope.userLocation"]) {
                    this.getLocation();
                  }
                }
              })
            }
          }
        })
      }
    })
  },
  getReverseGeocoder(latitude, longitude) {
    console.log(latitude, longitude);
    qqmapsdk.reverseGeocoder({
      location: {
        latitude, longitude
      },
      success: (res) => {
        let city = res.result.address_component.city;
        this.setData({city});
        this.getWeather();
      },
      fail: (res) => {
        wx.showModal({title: res.message})
        this.setData({city: '获取失败'});
      }
    })
  },
  onTapWeatherToday() {
    wx.showToast();
    wx.navigateTo({
      url: `/pages/list/list?city=${this.data.city}`
    })
  }
})