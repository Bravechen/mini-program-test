const util = require('./util');
//===========================================
let showing = false;
let currentId = null;

/**
 * 显示loading
 * @param {*} opt 
 */
function showLoading(opt){
    if(!opt || showing || !wx || typeof wx.showLoading !== 'function'){
        return;
    }
    showing = true;
    currentId = util.getSysId();
    wx.showLoading(opt);
    return currentId;
}
/**
 * 隐藏loading
 * @param {*} id 
 */
function hideLoading(id){
    if(!id || !showing || currentId !== id){
        return;
    }
    showing = false;
    currentId = null;
    wx.hideLoading();
}
/**
 * 强制关闭loading
 */
function shutDown(){
    if(!showing || !wx || typeof wx.hideLoading !== 'function' ){
        return;
    }
    wx.hideLoading();
    showing = false;
    currentId = null;
}

//======================================================
module.exports = {
    show:showLoading,
    hide:hideLoading,
    shutDown,
};