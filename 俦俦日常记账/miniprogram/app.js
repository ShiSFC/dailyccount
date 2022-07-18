// app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloud1-1g37kkf88b01cc86',
        traceUser: true,
      });
      let that = this;
      wx.cloud.callFunction({
        name: 'getOpenId',
        success(res){
          // console.log(res)
          that.globalData.openid = res.result.openid;
        },
        fail(err){
          console.log("获取用户openid失败",err)
        }
      })

      // const logs = wx.getStorageSync('key')


    }

    this.globalData = {
    };
  }
});
