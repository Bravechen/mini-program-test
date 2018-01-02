//index.js
//获取应用实例
const app = getApp();
import BE from '../../begonia/begoina';

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
    // this.vmp.$actions.getGroupList('10');
    // this.vmp.$actions.getSubjectList('1885');

    this.vmp.watch([
      'groupList',
      {
        prop:'subjectList',
        update(value){
          console.warn("In page,update subjectList===>",this,value);
          console.warn("compare reference====>value === getter.subjectList",value === this.vmp.$getters.subjectList);
          return value;
        }
      }
    ]);

    const that = this;
    setTimeout(function(){
      that.vmp.$actions.getGroupList('10');
      console.log("now current state====>>>",that.vmp.$store.getState());
    },2000);

    setTimeout(function(){
      that.vmp.$actions.getSubjectList('1885');
      console.log("now current state====>>>",that.vmp.$store.getState());
    },5000);
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
})
