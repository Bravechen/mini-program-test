const Log = require('../services/LogService');
/**
 * 关闭所有页面，重启某个页面
 * 包装方法
 * @param {*} path 
 */
function reLaunch(path){
    if(!path || reLaunch.currentPath === path){
        return;
    }
    reLaunch.currentPath = path;
    const that = this;
    wx.reLaunch({
        url:path,
        success:function(res){
            reLaunch.currentPath = null;
        },
        error:function(error){
            Log.error("In NavigateUtil reLaunch(),relaunch failed==>",path,error);
            reLaunch.currentPath = null;
        },
    });
}
/**
 * 导航到某个页面
 * 包装方法
 * @param {*} path 
 */
function navigateTo(path){
    wx.navigateTo({
        url:path,
        success:function(res){},
        error:function(error){
            Log.error("In NavigateUtil navigateTo(),navigate to failed==>",path,error);
        },
    });
}
/**
 * 重定向到某个页面
 * @param {*} path 
 */
function redirectTo(path){
    wx.redirectTo({
        url:path,
        success:function(){},
        fail:function(error){
            Log.error("In NavigateUtil redirectTo(),redirect to failed==>",path,error);
        }
    });
}

function switchTab(path){
    wx.switchTab({
        url:path,
        success:function(){},
        fail:function(error){
            Log.error("In NavigateUtil switchTab(),redirect to failed==>",path,error);
        }
    });
}

/**
 * 获取当前页面的对象
 */
function checkCurrentPage(){
    let page,list;
    try{
      list = getCurrentPages();
      if(!list || !list.length>0){
        return;
      }
      page = list[list.length-1];
    }catch(error){
      return;
    }
    return page;
}

module.exports = {
  /**
   * 关闭所有页面，重启某个页面
   * 包装方法
   * @param {*} path 
   */  
  reLaunch,
  /**
   * 导航到某个页面
   * 包装方法
   * @param {*} path 
   */
  navigateTo,
  /**
   * 重定向到某个页面
   * @param {*} path 
   */
  redirectTo,
  switchTab,
  /**
   * 获取当前页面的对象
   */
  checkCurrentPage,
};