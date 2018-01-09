/**
 * 观察者管理
 * @version 0.2.0
 * @author Brave Chan on 2017.12
 */
//===========================================================
import util from '../util';
import be_const from './beconst';
//============================================================
let _debug = false;
//监控state属性引用和值集合
let origin = {};
/*
  {
    vm_id:vmp
  }
*/
//代理集合
let vmpList = {};
/*
  {
    propName:[watcher1,watcher2,...],
  }
 */
//属性观察者集合
let watcherList = {};
//当前需要进行更新的属性
let updateList = [];

let _store;
let _getters;
let unsubscribeStateUpadte;
//===========================================
/**
 * @private
 * 订阅state树变动
 */
function subscribeState(){
  unsubscribeStateUpadte = _store.subscribe(stateUpdateHandler);
}

/**
 * @private
 * state更新处理器
 */
function stateUpdateHandler(){  

  if(_debug){
    _outputStateRefresh();
  }
  
  updateWatcher();
  
}
/**
 * @private
 * 更新监控属性变化的观察者们
 */
function updateWatcher(){
  if(updateList.length<=0){
    return;
  }
  let len = updateList.length;
  let list;
  for(let i=0,item;(item=updateList[i])!=null;i++){
    list = watcherList[item];
    if(!list || list.length===0){
      continue;
    }
    let newValue = _getters[item];
    //比较引用或值
    if(origin[item] !== newValue){

      if(_debug){
        console.warn(`Now,the ${item} will updata in WatchManager=======>`,_getters[item]);
      } 
           
      //存储新值的引用
      origin[item] = newValue;

      //更新观察者
      let len = list.length;
      while(len--){
        let watcher = list[len];
        let value = newValue;
        let vmp = vmpList[watcher[be_const.VM_ID]];
        if(typeof watcher.update === 'function' ){
          let t = watcher.update.call(vmp._vm.principal,newValue);
          if(t){
            value = t;
          }
        }
        if(_debug){
          console.log("will call vmp.commit",item,value,vmp._vm);
        }   
        //do vmp commit
        vmp.commit(item,value);
      }
    }
  }
  updateList = [];
}

//only for debug
function _outputStateRefresh(){
  const state = _store.getState();
  console.info("Now,the state refreshed=====>");
  console.dir(state);
  // console.dir(watcherList,updateList);
  // console.log("<=======================>");
}

//===========================================
//初始化标识
let initialized = false;
/*
{
  vmo_id$:vmpId,    //用于调取vmp，然后应用属性值
  update:updateFn,  //fn，用于在最后提交到vmp进行处理前，进行更新的回调。this值，应该页面或组件的this
}
*/
/**
 * @private
 * 内部使用的watcher化函数
 * @param {*} vmpId 
 * @param {*} updateFn 
 */
function be_watcherify(vmpId,updateFn){
  let watcher = {};
  watcher[be_const.VM_ID] = vmpId;
  if(typeof updateFn === 'function'){
    watcher.update = updateFn;
  }
  return watcher;
}

//===========================================
module.exports = {
  /**
   * @public
   * 开启/关闭 debug模式
   */
  set debug(value){
    _debug = value;
  },
  get debug(){
    return _debug;
  },
  /**
   * @public
   * 
   * 启动WM
   * @param {Object} store [necessary] store对象
   * @param {Object} getters [necessary] getters对象
   */
  setup(store,getters){
    if(initialized){
      return;
    }

    _store = store;
    _getters = getters;
    
    //监听state树变化
    subscribeState();
    
    if(_debug){
      _outputStateRefresh();
    }

    initialized = true;
  },
  /*
    {
      vmp:vmp,
      prop:'groupList',
      update:function(){},
    }
  */
  /**
   * @public
   * 
   * watcher化函数，
   * 可以将属性等参数转化为watcher对象
   * @param {Object} vmp ViewModuleProxy
   * @param {Array} list 属性集合
   */
  watcherify(vmp,list){
    let len = list.length;
    let item;
    let back = [];
    while(len--){
      item = list[len];
      if(!item){
        if(_debug){
          console.error('In WatchManager watcherify(),the element in list is error',len,item);
        }        
        continue;
      }

      if(util.isObject(item)){
        back[len] = {
          vmp:vmp,
          prop:item.prop,
          update:item.update,
        };
      }else if(typeof item === 'string'){
        back[len] = {
          vmp:vmp,
          prop:item,
        };
      }
    }
    return back;
  },  
  /**
   * @public
   * 
   * 添加观察者
   * @param {Array} watchers [necessary] 观察者集合
   */
  addWatchers(...watchers){
    if(!initialized){
      console.warn("WatchManager is not be initialized.");
      return false;
    }
    const VM_ID = be_const.VM_ID;
    let len = watchers.length;
    let watcher,prop,list,vmp;
    while(len--){
      watcher = watchers[len];
      vmp = watcher.vmp;
      prop = watcher.prop;
      list = watcherList[prop];
      if(!list){
        list = [];
        watcherList[prop] = list;
        origin[prop] = _getters[prop];
      }
      vmpList[vmp[VM_ID]] = vmp;
      list[list.length] = be_watcherify(watcher.vmp[be_const.VM_ID],watcher.update);
    }
    if(_debug){
      console.warn('after add watchers,the watcher list is====>',watcherList);
      console.warn('after add vmp the vmpList is====>',vmpList);
    }
    
  },
  /**
   * @public
   * 
   * 移除观察者
   * @param {Object} vmp [necessary] 移除对vmp提交的属性监控 
   * @param {String} propName [necessary] 属性名称
   */
  removeWatcher(vmp,propName){
    if(vmpList.length>0){
      vmpList = vmpList.filter(function(item,index){
        return item === vmp[be_const.VM_ID];
      });
    }

    let list = watcherList[propName];
    if(list && list.length>0){
      list = list.filter(function(item,index){
        return item[be_const.VM_ID] === vmp[be_const.VM_ID];
      });
    }
  },
  /**
   * @public
   * 
   * 移除所有和此vmp实例有关的观察者
   * @param {ViewModleProxy} vmp 
   */
  removeAllByVMP(vmp){
    const VM_ID = be_const.VM_ID;
    if(!vmp || !vmpList[vmp[VM_ID]]){
      return;
    }
    let keys = Object.keys(watcherList);
    let len = keys.length;
    while(len--){
      this.removeWatcher(vmp,keys[len]);
    }
  },
  /**
   * @public
   * 
   * 提交属性变动
   * 当state树发生变化，将发生变化的属性键名提交
   * wm会组成变化集合数组，然后逐一更新观察者们
   * 
   * @param {String} propName [necessary] 属性名 
   */
  commit(propName){
    if(typeof propName !== 'string' || updateList.indexOf(propName)!==-1){
      return;
    }
    let list = watcherList[propName];
    if(!list || list.length<=0){
      return;
    }
    updateList[updateList.length] = propName;
  },
  /**
   * WM进行销毁操作
   * 销毁不同于重置，
   * 是达到完全解除引用，完全不能再用的状态。
   */
  destroy(){
    //解除对state树的订阅
    unsubscribeStateUpadte();
    //去除相关属性引用
    _store = null;
    _getters = null;
    origin = null;
    vmpList = null;
    watcherList = null;
    updateList = null;
    initialized = false;
  }
};