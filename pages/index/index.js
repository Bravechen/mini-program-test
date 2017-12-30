//index.js
//获取应用实例
const app = getApp()
import BE from '../../common/begoina';


Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  vmp:null,

  onLoad: function () {
    this.vmp = BE.getProxy(this);
    console.log(this.vmp,this.vmp.$store,this.vmp.$store.getState());
    console.log("groupList=====>>",this.vmp.$getters.groupList);
    this.vmp.$actions.getGroupList('10');
    this.vmp.$actions.getSubjectList('1885');
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
})
