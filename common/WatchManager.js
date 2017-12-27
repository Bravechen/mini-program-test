const util = require('../utils/util');
let _store;
const watchList = {};
const origin = {};
const cbList = {};
const WM_ID = 'wm_id';
const WM_SCOPE = 'wm_scope';
let subscribed = false;
let watcher;
let getter;
//===========================================
class WatchProxy{
  constructor(){
  }
  /**
   * 观察一个属性
   * @param {*} propName 
   * @param {*} handler 
   */
  watch(propName,handler,scope=null){
    if(typeof propName !== 'string' || typeof handler !== 'function'){
      return;
    }
    let list = watchList[propName];
    if(!list){
      list = [];
      watchList[propName] = list;
      origin[propName] = getter[propName];
    }

    //为回调函数加个id
    if(typeof handler[WM_ID]!=='string'){
      handler[WM_ID] = util.getSysId();
      handler[WM_SCOPE] = scope;
    }
    const id = handler[WM_ID];
    const index = list.indexOf(id);       
    
    if(index === -1){
      cbList[id] = handler;
      list[list.length] = id;
    }else{
      return;
    }
    if(!subscribed){
      subscribeState();
    }
  }
  /**
   * 解除对属性的一个观察
   * @param {*} propName 
   * @param {*} handler 
   */
  unwatch(propName,handler){
    if(typeof propName !== 'string' || typeof handler !== 'function'){
      return;
    }
    const list = watchList[propName];
    if(!list || typeof handler[WM_ID] !== 'string'){
      return;
    }
    const id = handler[WM_ID];
    const index = list.indexOf(id);
    if(index>=0){
      list.splice(index,1);
      delete handler[WM_ID];
      delete handler[WM_SCOPE];
      delete cbList[id];
    }else{
      return;
    }
    if(list && list.length<=0){
      delete watchList[propName];
      delete origin[propName];
    }
  }

  /**
   * 是否已在观察之列
   * @param {*} propName 
   * @param {*} handler 
   */
  hasWatched(propName,handler){
    if(typeof propName !== 'string' || typeof handler !== 'function' || typeof handler[WM_ID] !== 'string'){
      return false;
    }
    const list = watchList[propName];
    if(!list){
      return false;
    }
    return list.indexOf(handler[WM_ID])>=0;
  }
}
//===========================================
function subscribeState(){
  if(subscribed){
    return;
  }
  subscribed = true;
  _store.subscribe(stateUpdateHandler);
}

function stateUpdateHandler(){
  const state = _store.state;

  // console.info("Now,the state refreshed=====>");
  // console.dir(state);
  // console.dir(watchList);
  // console.log("<=======================>");
  
  const keys = Object.keys(watchList);
  let len = keys.length;
  while(len--){
    let key = keys[len];
    let list = watchList[key];
    
    if(list && list.length>0 && origin[key] !== getter[key]){
      // console.log(`Now,the ${key} will updata in WatchManager=======>`,origin[key],getter[key]);
      origin[key] = getter[key];
      let len2 = list.length;
      while(len2--){
        let fn = cbList[list[len2]];
        fn.call(fn[WM_SCOPE]);
      }
    }
  }
}

//===========================================
const exportObj = {
  set store(value){
    _store = value;
  },
  get store(){
    return _store;
  },
  watcherify(vm,list){},
  addWatchers(){},
  /**
   * 获得一个watcher单例
   */
  getWatchProxy(){
    if(!watcher){
      watcher = new WatchProxy();
    }
    return watcher;
  },
  /**
   * 合并监控常量
   * @param {*} propNames  
   */
  watchState(interfaceObj,propNames){
    if(!propNames || !interfaceObj){
      return;
    }
    getter = interfaceObj;
    Object.assign(this,propNames);
    
    // console.log("wm init================>",this,getter);
  }
};
//===========================================
  module.exports = exportObj;