// pages/dailyDetail/dailyDetail.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        openid:"",
        isLogin:false,
        showMonth:'',
        showDay:'',
        baseData:[]

    },

    isShowDayDetail:function(e){
        let date = e.currentTarget.dataset.day;
        let month = e.currentTarget.dataset.month;
        if(date){
            let showDay = this.data.showDay;
            if(showDay == date){
                showDay=''
            }
            else{
                showDay=date
            }
            this.setData({
                showDay
            })
        }
        else if(month){
            let showMonth = this.data.showMonth;
            let showDay = this.data.showDay;
            if(showMonth == month){
                showMonth=''
                showDay = ''
            }
            else{
                showMonth = month;
                showDay = ''
            }
            this.setData({
                showMonth,showDay
            })
        }
        

    },

    // 处理数据
    dealYearData:function(baseData) {
        let expenseAmount=0,incomeAmount = 0;
        let allObj = {};
        for(let i in baseData){
            let eamount = baseData[i].expense.totalAmount;
            let iamount = baseData[i].income.totalAmount;
            expenseAmount =  parseFloat((expenseAmount + eamount).toFixed(2));
            incomeAmount =  parseFloat((incomeAmount + iamount).toFixed(2));
            let index = Number(baseData[i].date.slice(5,7));
            if(allObj[index]){
                allObj[index].arr.push(baseData[i])
                allObj[index].monthExpense = parseFloat((allObj[index].monthExpense + eamount).toFixed(2))
                allObj[index].monthIncome = parseFloat((allObj[index].monthIncome + iamount).toFixed(2))
            }
            else{
                allObj[index] = {
                    monthExpense:eamount,
                    monthIncome:iamount,
                    arr:[baseData[i]]
                }
            }
        }
        console.log('index',allObj);
        this.setData({
            incomeAmount,expenseAmount,allObj
        })
    },
    

    // 日期切换
    bindDateChange: function(e) {
        let {openid,date} = this.data;
        let value = e.detail.value;
        console.log('picker发送选择改变，携带值为', value)
        if(date != value){
            this.setData({
                date:value,
                showMonth:'',
                showDay:''
            })
            wx.showLoading({
              title: '加载中',
            })
            this.getFullYearData(openid,value)
            setTimeout(res=>wx.hideLoading(),700)
        }  
    },

    /** 默认设置当前日期 */
    setNowDate: function () {
        let date = new Date()
        let year = date.getFullYear()
        // console.log(date)
        this.setData({
            date:year
        })
    },

    // 获取整年的记录
    getFullYearData: function(openid,year){
        wx.cloud.callFunction({
            name:'getBaseData',
            data:{
                openid:openid,
                year:year,
            }
        })
        .then(res => {
            let baseData = res.result.data;
            console.log(baseData)
            this.setData({
                baseData
            })
            this.dealYearData(baseData)
        })
        .catch(err => {
            console.log(err)
            this.setData({
                incomeAmount:0,
                expenseAmount:0,
                allObj:{}
            })
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setNowDate()
        try {
            let openid = wx.getStorageSync('openid')
            let isLogin = wx.getStorageSync('isLogin')
            let expense = wx.getStorageSync('expense')
            let income = wx.getStorageSync('income')
            // console.log("keepAmount onload",openid)
            if (openid && isLogin) {
                this.setData({
                    openid,isLogin,expense,income
                })
                this.getFullYearData(openid,this.data.date)
            }
            else{                
                console.log("dailyDetail",typeof openid)                
            }
        } catch (e) {
            console.log("dailyDetail onload err",e)            
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        let {openid,date} = this.data;
        this.getFullYearData(openid,date)
    }

})

