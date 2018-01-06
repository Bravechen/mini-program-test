/**
 * 网络状态相关服务
 * @author Brave Chan on 2017.8.24
 */
//===============================================
let _debug = false;
//===============================================
const prompt = {
    '2g':function(goodFn,badFn){
        wx.showModal({
            title:'网络不畅',
            content:'您当前的网络环境为2G，加载数据可能会比较慢，请您耐心等候，或者更换到较好的网络环境。',
            showCancel:false,
            confirmText:'知道了',
        });
        if(typeof goodFn === 'function'){
            goodFn();
        }
    },
    'none':function(goodFn,badFn){
        wx.showModal({
            title:'网络有问题',
            content:'您当前网络环境可能出现了问题，数据完全加载不了，请您检查网络连接是否正常，谢谢。',
            showCancel:false,
            confirmText:'知道了'
        });
        if(typeof badFn === 'function'){
            badFn();
        }
    },
    'wifi':function(goodFn,badFn){
        if(typeof goodFn === 'function'){
            goodFn();
        }
    },
    '3g':function(goodFn,badFn){
        if(typeof goodFn === 'function'){
            goodFn();
        }
    },
    '4g':function(goodFn,badFn){
        if(typeof goodFn === 'function'){
            goodFn();
        }
    },
    'unknow':function(goodFn,badFn){
        wx.showModal({
            title:'网络环境不明',
            content:'无法检测您当前所在网络环境类型，如果数据加载出现问题，请您切换到较好的网络环境再使用。',
            showCancel:false,
            confirmText:'知道了'
        });
        if(typeof goodFn === 'function'){
            goodFn();
        }
    },
};
let _changeToGoodFn,_changeToBadFn;
let netChangeBad = false;
//================================================
/**
 * @public
 * 
 * 监控网络状态
 * @param {Function} changeToGoodFn 网络变好时的回调 
 * @param {Function} changeToBadFn 网络变差是的回调
 */
function watchNet(changeToGoodFn,changeToBadFn){
    _changeToGoodFn = changeToGoodFn;
    _changeToBadFn = changeToBadFn;
    if (wx.onNetworkStatusChange) {
        wx.onNetworkStatusChange(function(res){
            if(!res.isConnected){
                netChangeBad = true;
                return prompt['none'](null,_changeToBadFn);
            }
            if(netChangeBad){
                netChangeBad = false;
            }
            let fn = prompt[res.networkType];
            if(typeof fn === 'function'){
                fn(_changeToGoodFn,_changeToBadFn);
            }            
        });
    } else {
        // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
        wx.showModal({
            title: '提示',
            content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
            showCancel:false,
        });
    }    
}

/**
 * @public
 * 
 * 检测网络状态
 * @param {Function} goodFn [optional] 网络情况好时调用该回调
 * @param {Function} badFn [optional] 网络情况不好时调用该回调
 */
function checkNet(goodFn,badFn){
    wx.getNetworkType({
        success:function(res){
            // 返回网络类型, 有效值：
            // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
            //res.networkType
            let fn = prompt[res.networkType];
            if(typeof fn === 'function'){
                fn(goodFn,badFn);
            }
        },
        fail:function(error){
            if(_debug){
                console.error("In NetService checkNet(), Call wx net api error,can not check net type.====>",error);
            }            
        },
    });
}
//===========================================



//============================================
module.exports = {
    set debug(value){
        _debug = value;
    },
    get debug(){
        return _debug;
    },
    /**
     * @public
     * 
     * 监控网络状态
     * @param {Function} changeToGoodFn 网络变好时的回调 
     * @param {Function} changeToBadFn 网络变差是的回调
     */
    checkNet,
    /**
     * @public
     * 
     * 检测网络状态
     * @param {Function} goodFn [optional] 网络情况好时调用该回调
     * @param {Function} badFn [optional] 网络情况不好时调用该回调
     */
    watchNet,
};