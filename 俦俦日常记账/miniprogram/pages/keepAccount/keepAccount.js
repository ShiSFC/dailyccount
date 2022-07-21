const db = wx.cloud.database()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        err:"",
        isLogin:false,
        openid:"",
        date:"",
        accountData:{},
        category:"cater",
        categoryDetail:"breakfast",
        account:[],
        totalAmount:0,
        show_item:true,//默认显示支出记账页面
    },

    // 类别切换，获取对应的渲染数据
    
    changeAccount: function(){
        let {show_item,category,categoryDetail,account,totalAccount} = this.data
        let itemName = show_item?"expense":"income"
        
        let items = totalAccount[itemName]
        for(let item in items){
            if(item == category){
                let details = items[item]
                for(let detail in details){
                    if(detail == categoryDetail){
                        this.setData({
                            account: details[detail]
                        })
                        this.addItem()
                        return
                        // account = details[detail]
                    }
                }
            }
        }
        this.setData({
            account:[]
        })
        // console.log(account)
        this.addItem()
    },

    updateSelect: function(){
        let data = this.data.show_item?this.data.expense:this.data.income
        let category = ""
        let categoryDetail = ""
        for(let i in data){
            if(data[i].checked){
                category = i
                let details = data[i].details
                for(let j in details){
                    if(details[j].checked){
                        categoryDetail = j
                    }
                }
            }
        }
        this.setData({
            category,
            categoryDetail
        })
    },

    /**
     * 收入、支出切换
     */
    checkHeader: function (e) {
        // console.log(e)
        let check = e.currentTarget.dataset.check;
        let {show_item,totalAmount,totalAccount} = this.data;
        if(check == "income"){
            show_item = false;
            // category = "salary";
            // categoryDetail = "salary";
            totalAmount = totalAccount.income.totalAmount;
        }
        else if(check == "expense"){
            show_item = true;
            // category = "cater";
            // categoryDetail = "breakfast";
            totalAmount = totalAccount.expense.totalAmount
        }
        // console.log('show_item,totalAmount',show_item,totalAmount)
        this.setData({
            show_item,totalAmount
        })
        this.updateSelect()
        this.changeAccount()
    },

    /**
     * 类别切换
     */
    categoryTap: function(e){
        // console.log(e)
        let data = this.data.show_item?this.data.expense:this.data.income
        let category = e.currentTarget.dataset.category
        let categoryDetail = ""
        for(let i in data){
            if(i == category){
                data[i].checked = true
                // data.category = i
                let details = data[i].details
                for(let j in details){
                    if(details[j].checked){
                        categoryDetail = j
                    }
                }
            }
            else{
                data[i].checked = false
            }          
        }
        if(this.data.show_item){
            this.setData({
                category,
                categoryDetail,
                expense:data
            })
        }
        else{
            this.setData({
                category,
                categoryDetail,
                income:data
            })
        }
        this.changeAccount()
    },

    /**
     * detail 切换
     */
    detailTap:function(e){
        // console.log(e)
        let data = this.data.show_item?this.data.expense:this.data.income
        let detail = e.currentTarget.dataset.detail
        let category = this.data.category
        let details = data[category].details
        let categoryDetail = ""
        for(let i in details){
            if(i === detail){
                details[i].checked = true
                categoryDetail = i 
            }
            else{
                details[i].checked = false
            }          
        }
        if(this.data.show_item){
            this.setData({
                categoryDetail,
                expense:data
            })
        }
        else{
            this.setData({
                categoryDetail,
                income:data
            })
        }
        this.changeAccount()
    }, 

    // 日期切换
    bindDateChange: function(e) {        
        this.updateBaseData()
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
          date: e.detail.value
        })
        this.initAccount()
    },
    
    /** 格式化日期 yyyy-mm-dd */   
    formatDate: function (n) {
        n = n.toString()
        return n[1]?n:'0'+n
    },

    /** 默认设置当前日期 */
    setNowDate: function () {
        let date = new Date()
        let year = date.getFullYear()
        let month = date.getMonth()+1
        let day = date.getDate()
        date = [year, month, day].map(this.formatDate).join('-')
        // console.log(date)
        this.setData({
            date
        })
    },
    
    /** 
     * 异步的数据获取 doc().get() 
     *   initAccount() 获取数据库的数据渲染页面
     */
    getBaseData: function(id) {        
        return db.collection('accountBook').doc(id).get()
    },

    // 更新数据库的数据
    updateBaseData: function(){
        let {date,openid,totalAccount} = this.data
        let id = openid+'_'+date
        if(!totalAccount){
            return
        }
        let {expense,income} = totalAccount
        db.collection('accountBook').doc(id).update({
            data: {
                expense,
                income
            },
        })    
    },

    // 将输入的数据写入totalAccount
    updateAccount: function(){
        let {show_item,category,categoryDetail,account,totalAccount,totalAmount} = this.data
        let itemName = show_item?"expense":"income"
        totalAccount[itemName]['totalAmount'] = totalAmount

        if(typeof totalAccount[itemName][category] == 'undefined'){
            let obj = {}
            obj[categoryDetail] = account
            totalAccount[itemName][category] = obj
        }
        else{
            totalAccount[itemName][category][categoryDetail] = account
        }
        this.setData({
            totalAccount
        })
        wx.setStorageSync('totalAccount', totalAccount)
    },

    bindReplaceInput: function(event){
        let value = event.detail.value
        let flag = value.indexOf('.')
        if(flag != '-1' && flag<(value.length-3)){
            value = value.slice(0,value.length-1)
        }
        // console.log(value)
        return value
    },

    /**
     *  备注、金额的数据获取，修改
     */
    bindKeyInput: function (e) {
        let totalAmount = parseFloat(this.data.totalAmount)
        let account = this.data.account
        let value = e.detail.value
        let index = Number(e.currentTarget.dataset.index)
        let type = e.currentTarget.dataset.type
        console.log('bindKeyInput的value,index,type',value,index,type)
        if(type == "remarks"){
            let remarks = account[index].remarks
            if(value == remarks || (!remarks && value=="")){
                console.log("不修改remarks")
                return
            }
            else{
                account[index].remarks = value
            }
        }
        else if(type == "fund"){
            let fund = account[index].fund
            // console.log('typeof fund',typeof fund,typeof value)
            if(value == fund){
                console.log("不修改fund")
                return
            }
            if(value == ""){
                value = 0
            }
            else if(isNaN(value)){
                console.log('输入值无效')
                return
            }            
            if(typeof fund === 'undefined'|| fund == ""){
                // console.log('undefined_fund2',fund)
                fund = 0
            }
            // console.log('fund2',fund)
            value = parseFloat(Number(value).toFixed(2))
            account[index].fund = value
            totalAmount = parseFloat((Number(totalAmount)+Number(value)-Number(fund)).toFixed(2))
            // console.log("totalAmount1",totalAmount)
            
        }
        this.setData({
          account,totalAmount
        })
        this.addItem()
        this.updateAccount()
    },

    /**
     * 填充页面 渲染
     * 获取数据库里的数据 初始化
     */
    initAccount: function(){
        let id = this.data.openid+'_'+this.data.date
        console.log("initAccount start id",id)
        this.getBaseData(id)
        .then(res=>{
            console.log('res',res)
            let {expense,income} = res.data
            this.setData({
                totalAccount:{
                    expense,
                    income
                }
            })
            let account = this.data.show_item?expense:income
            let {category,categoryDetail} = this.data
            // console.log('test',category,categoryDetail,account)
            let totalAmount = Number(account.totalAmount)
            let data = []
            for(let key in account){
                if(key == category){
                    let items = account[key]
                    for(let item in items){
                        if(item == categoryDetail){
                            data=items[item]
                        }
                    }
                }
            }
            this.setData({
                totalAmount,account:data
            })
            this.addItem()
        })
        .catch(err=>{
            // console.log('initAccount err',err)
            // 无当前选择的对应记录
            if(err.errMsg && err.errMsg.slice(0,17) == "document.get:fail"){
                let date = this.data.date                
                // let id = openid+'_'+date
                db.collection('accountBook').add({
                    data:{
                        _id:id,
                        date:date,
                        formatDate:new Date(date),
                        expense:{totalAmount:0},
                        income:{totalAmount:0}
                    }
                }).then(res=>{
                    this.setData({
                        account:[],
                        totalAccount:{
                            expense:{totalAmount:0},
                            income:{totalAmount:0}
                        },
                        totalAmount:0
                    })
                    this.addItem()
                    // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
                    console.log("没有对应记录，新建成功",res)
                }).catch(error=>{
                    console.log('add error',error)
                })
            }
            else if(err.errMsg && err.errMsg.slice(0,37) == '[LimitExceeded.OutOfReadRequestQuota]'){
                this.setData({
                    otherErr:'今日已达上限'
                })
                wx.hideTabBar()
                // console.log('m')
            }
            else{
                console.log('initAccount err',err)
            }
        })
    },

    // 添加空输入框
    addItem: function(){
        let oldAccount = this.data.account
        let account = []
        console.log("additem oldAccount",oldAccount)
        for(let i=0; i<oldAccount.length; i++){
            let item = oldAccount[i]
            if(item.remarks == "" && (item.fund == 0 || item.fund == "")){
                continue
            }
            account.push(item)
        }
        account[account.length]={remarks:"",fund:""}
        this.setData({
            account
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // let maxyear = (Number('2022')+1).toString()
        // console.log('maxyear',new Date(maxyear+'/1/1 00:00:00'))
        this.setNowDate()
        try {
            let openid = wx.getStorageSync('openid')
            let isLogin = wx.getStorageSync('isLogin')
            // console.log("keepAmount onload",openid)
            if (openid && isLogin) {
                let expense = wx.getStorageSync('expense')
                let income = wx.getStorageSync('income')
                this.setData({
                    openid,isLogin,income,expense
                })
                this.initAccount()
            }
            else{
                // wx.hideTabBar()
                console.log("not login, openid:",isLogin,openid)
                setTimeout(()=> {
                    wx.reLaunch({
                    url: '../login/login',
                       })
                    }, 1000);            
            }
        } catch (e) {
            console.log("keepAmount onload err",e)            
        }
        // this.getOpenid()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        // console.log('监听页面隐藏')
        this.updateBaseData()
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})