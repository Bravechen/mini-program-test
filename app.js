import BE from './begonia/begoina';
import './store/store';

// import TodoService from './services/TodoService';
import UserService from './services/UserService';

//app.js
App({
  onLaunch: function (option) {    
    UserService.setupLogin();
  },
  onHide:function(){

  },
  onShow:function(option){

  },
  onError:function(error){

  },
  globalData: {
    userInfo: null
  }
})