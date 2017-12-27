/**
 * 缓存管理
 * @author Brave Chan on 2017.8.23
 */
//=====================================================
const util = require('../utils/util');
const Log = require('../services/LogService');
//=====================================================
const SALT = '|*&@_@&*|';
const FOREVER = 'forever';
let currentSize = 0;
let limitSize = 10240;   //10240kb
let storageKeys = [];
let limitChecking = false;
let storageList = {};       //缓存对象集合
//=====================================================
/**
 * 缓存对象基类
 * 每一个缓存对象管理了一群以masterKey为后缀的缓存数据
 */
class StorageInfo{
    constructor(invalidateTime=0,masterKey=''){
        this.invalidateTime = invalidateTime;
        this.forever = invalidateTime === FOREVER;
        
        this.masterKey = masterKey;
        addStorageInstance(this.masterKey,this);
    }

    /**
     * 存储数据
     * @param {*} obj 
     */
    save(obj){
        const canUse = obj && obj.params;
        if(!canUse){
            const errorFn = obj && typeof obj.fail === 'function'?obj.fail:util.noop;
            return errorFn({
                message:`In save(),the params are error====>obj:${obj}`,
                detail:'',
            });
        }
        const params = obj.params;
        //合并产生键名
        const key = params.concat([this.masterKey]).join(':');

        //合并产生数据值
        let saveData = obj.value;
        if(saveData && typeof saveData === 'object'){
            try{
               saveData = JSON.stringify(saveData);
            }catch(error){
                Log.error('In LS save(),save value stringify json happen error.',error);
            }
        }
        const value = saveData + SALT + (this.forever?FOREVER:(new Date()).getTime());
        const successFn = obj.success || util.noop;
        const failFn = obj.fail || util.noop;

        //容量检测
        if(limitSize - currentSize<=2){
            return failFn({
                message:'The storage is full.',
                detail:`limitSize:${limitSize},currentSize:${currentSize}`,
            });
        }

        //执行存储
        saveItem(key,value,successFn,failFn);
    }

    /**
     * 读取数据
     * @param {*} obj 
     */
    read(obj){
        const canUse = obj && obj.params;
        if(!canUse){
            const errorFn = obj && typeof obj.fail === 'function'?obj.fail:util.noop;
            return errorFn({
                message:`In read(),the params are error====>obj:${obj}`,
                detail:'',
            });
        }
        const params = obj.params;
        //合并产生键名
        const key = params.concat([this.masterKey]).join(':');
        
        const successFn = obj.success || util.noop;
        const failFn = obj.fail || util.noop;
        
        const that = this;
        
        //执行读取
        readItem(key,function(res){
            let value = res.data;
            if(!value){
                failFn({
                    message:'Value is undefined',
                    detail:res.data,
                });
                return;
            }

            let valueAry = value.split(SALT);

            //检测过期时间
            let time = valueAry[1];
            if(time !== FOREVER){
                let now = new Date().getTime();
                if(now - time>that.invalidateTime){
                    failFn({
                        message:'Value has invalidated',
                        detail:`now:${now},save time:${time},invalidateTime:${that.invalidateTime}`,
                    });
                    that.clear(key);
                    return;
                }
            }            
            
            //解析数据
            let result;
            try{
                result = JSON.parse(valueAry[0]);
            }catch(error){
                failFn({
                    message:'Parse json error',
                    detail:error,
                });
                return;
            }

            successFn(result);
        },function(error){
            failFn({
                message:`Read ${obj} error`,
                detail:error,
            });
        });
    }
    /**
     * 清除管理数据
     * @param {*} obj 
     */
    clear(obj){
        const canUse = obj && obj.params && obj.params.length>0;
        if(!canUse){
            const errorFn = obj && typeof obj.fail === 'function'?obj.fail:util.noop;
            return errorFn({
                message:'In clear(),the params are wrong.',
                detail:`obj:${obj}`,
            });
        }
        const key = obj.params.concat([this.masterKey]).join(':');
        removeItem(key,util.noop,util.noop);
    }
    /**
     * 检查某一条缓存是否过期，过期的将会被删掉
     * @param {*} storageKey 
     */
    check(storageKey){
        if(!storageKey){
            return;
        }
        let value = readItemSync(storageKey);
        let valueAry = value.split(SALT);
        
        //检测过期时间
        let time = valueAry[1];
        if(time !== FOREVER){
            let now = new Date().getTime();
            if(now - time>this.invalidateTime){
                removeItem(storageKey);
            }
        }  
    }
    /**
     * 摧毁缓存对象，以备回收
     */
    destory(){
        removeStorageInstance(this.masterKey);
        this.invalidateTime = null;
        this.masterKey = null;
    }
}
//================================================================


/**
 * @public
 * 检查并删除所有过期数据
 */
function checkInvalidate(){
    let len = storageKeys.length;
    while(len--){
        let list = storageKeys[len].split(':');
        let masterKey = list[list.length-1];
        let storage,
            doCheck = (storage = storageList[masterKey]) instanceof StorageInfo;
        if(doCheck){
            storage.check(storageKeys[len]);
        }
    }
    getLimit();
}

/**
 * @public
 * 删除某一个masterKey下的所有缓存数据
 * 不论是否过期
 * @param {*} masterKey 
 */
function deleteDataByMasterKey(masterKey){
    if(!masterKey){
        return;
    }
    storageKeys.forEach(function(item,index){
        let list = item.split(':');
        let mk = list[list.length-1];
        if(masterKey === mk){
            removeItem(mk);
        }
    });
    getLimit();
}
//================================================================
/**
 * @private
 * 添加一个缓存对象
 * @param {*} masterKey 
 * @param {*} storageInfo 
 */
function addStorageInstance(masterKey,storageInfo){
    if(!masterKey || !storageInfo instanceof StorageInfo || typeof storageInfo.check!=='function'){
        return;
    }
    storageList[masterKey] = storageInfo;
}

/**
 * @private
 * 删除某一个materKey对应的存储对象
 * @param {*} masterKey 
 */
function removeStorageInstance(masterKey){
    if(!masterKey || !storageList[masterKey]){
        return;
    }
    storageList[masterKey] = null;
}
//================================================================

/**
 * @private
 * 执行存储数据
 * @param {*} key 
 * @param {*} value 
 * @param {*} successFn 
 * @param {*} errorFn 
 */
function saveItem(key,value,successFn,errorFn){
    wx.setStorage({
        key:key,
        data:value,
        success:function(){
            successFn();
            getLimit();
        },
        fail:errorFn,
    });
}

/**
 * @private
 * 执行读取数据
 * @param {*} key 
 * @param {*} value 
 * @param {*} successFn 
 * @param {*} errorFn 
 */
function readItem(key,successFn,errorFn){
    wx.getStorage({
        key:key,
        success:successFn,
        fail:errorFn,
    });
}

/**
 * @private
 * @param {*} key 
 */
function readItemSync(key){
    let value;
    try{
        value = wx.getStorageSync(key);
    }catch(error){
        Log.error("In LS readItemSync(),read storage sync failed====>",key);
    }
    return value;
}

/**
 * @private
 * 执行删除数据
 * @param {*} key 
 * @param {*} value 
 * @param {*} successFn 
 * @param {*} errorFn 
 */
function removeItem(key,successFn,errorFn){
    try{
        wx.removeStorageSync(key);
    }catch(error){
        Log.error("In LS removeItem(),catch an error===>",error);
    }
}

/**
 * @private
 * 保留必要数据，清除所有非必要数据
 */
function clearAllUnnecessary(){
     
}
//============================================================
/**
 * @private
 * 获取系统缓存详情
 */
function getLimit(){
    if(limitChecking){
        return;
    }
    limitChecking = true;
    wx.getStorageInfo({
        success:function(res){
            limitChecking = false;
            storageKeys = res.keys || [];
            currentSize = res.currentSize;
            limitSize = res.limitSize;
        },
        fail:function(error){
            limitChecking = false;
            Log.error('In LS getLimit(),get system storage info failed',error);
        },
    });
}

//最初执行一次
getLimit();

//================================================================
module.exports = {
    StorageInfo,    
    checkInvalidate,
    deleteDataByMasterKey,
};