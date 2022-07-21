// pages/login/login.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        income:{
            salary:{name: '工资', checked: true, details: {
                salary:{name: '基本工资', checked: true},
                Commission:{name: '提成'},
                other:{name: '其他'}
            }},
            revenue:{name: '收益', details: {
                stablerevenue:{name: '定期', checked: true},
                revenue:{name: '基金'},
                fleece:{name: '薅羊毛'},
                other:{name: '其他'}
            }},
            contact:{name: '社交', details: {
                redenvelopes:{name: '红包', checked: true},
                favor:{name:'人情'},
                other:{name: '其他'}
            }},
            other:{name: '其他', details: {
                other:{name: '其他', checked: true},
            }},
        },
        expense:{
            cater:{name: '餐饮', checked: true, details: {
                breakfast:{name: '早餐', checked: true},
                lunch:{name: '午餐'},
                dinner:{name: '晚餐'},
                drink:{name: '饮料'},
                snacks:{name: '零食'},
                fruits:{name: '水果'},
                Vegetables:{name: '蔬菜'},
                other:{name: '其他'}
                }
            },
            daily:{name: '日常', details: {
                clothes:{name: '服装', checked: true},
                dailyNecessities:{name: '日用品'},
                expressDelivery:{name: '快递'},
                phoneBill:{name: '话费'},
                other:{name: '其他'}
                }
            },
            traffic:{name: '交通', details: {
                bus:{name: '公交', checked: true},
                subway:{name: '地铁'},
                car:{name: '汽车'},
                plane:{name: '飞机'},
                ship:{name: '船'},
                other:{name: '其他'}
                }
            },
            housing: {name: '住房', details: {
                car:{name: '房租', checked: true},
                water:{name: '水费'},
                electric:{name: '电费'},
                gas:{name: '气费'},
                Property:{name: '物业'},
                other:{name: '其他'}
                }
            },
            contact: {name: '社交', details: {
                gift:{name: '礼物', checked: true},
                travel:{name: '旅游'},
                redenvelopes:{name: '红包'},
                circulate:{name: '借还'},
                favor:{name: '人情'},
                other:{name: '其他'}
                }
            },
            medical: {name: '医疗', details: {
                register:{name: '挂号', checked: true},
                inspect:{name: '检查'},
                medicine:{name: '药'},
                other:{name: '其他'}
                }
            },
            education:{name: '教育', details: {
                exam:{name: '考试', checked: true},
                book:{name: '书籍'},
                course:{name: '课程'},
                other:{name: '其他'}
                }
            },
            other:{name: '其他', details: {other:{name: '其他',checked:true}}},
        }
    },

     // 登录
     login() {
        wx.getUserProfile({
            desc: '用于完善会员资料', 
            success: (res) => {
                this.getOpenid()
                wx.setStorageSync('user', res.userInfo)
                wx.setStorageSync('isLogin', true)
                wx.setStorageSync('expense', this.data.expense)
                wx.setStorageSync('income', this.data.income)
                // wx.showTabBar()
                setTimeout(()=> {
                    wx.reLaunch({
                    url: '../keepAccount/keepAccount',
                       })
                    }, 500);
            },
            fail: (err) =>{
                this.setData({
                    err:"授权才能进入俦俦日记账本"
                })
            }
        })
    },

    // 获取openid
    getOpenid(){
        wx.cloud.callFunction({
            name:'getOpenId',
            complete: res=>{
                wx.setStorageSync('openid', res.result.openid)
                // this.setData({
                //     openid: res.result.openid
                // })
                // this.initAccount()
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

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
        wx.hideHomeButton()
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

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