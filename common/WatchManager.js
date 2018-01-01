const util = require('../utils/util');

let watchList = {};

const cbList = {};
const WM_ID = 'wm_id';
const WM_SCOPE = 'wm_scope';
let subscribed = false;
let watcher;

const origin = {};
/*
  {
    vm_id:vmp
  }
*/
let vmList = {};
/*
  {
    propName:[watcher1,watcher2,...],
  }

 */
let watcherList = {};
let _store;
let _getters;
//===========================================
class Watcher{
  constructor(){
    this.vmp_id = '';   //用于调取vmp，然后应用属性值
    this.update = null; //fn，用于在最后提交到vmp进行处理前，进行更新的回调。this值，应该页面或组件的this
  }
}

class WatchProxy{
  constructor(){
  }
  /**
   * 观察一个属性
   * @param {*} propName 
   * @param {*} handler 
   */
  watch(vmp,propName){
    if(typeof propName !== 'string' || !vmp){
      return;
    }
    let list = watcherList[propName];
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
    
  }

  /**
   * 是否已在观察之列
   * @param {*} propName 
   * @param {*} handler 
   */
  hasWatched(propName,handler){
    
  }
}
//===========================================
function subscribeState(){
  _store.subscribe(stateUpdateHandler);
}

function stateUpdateHandler(){
  const state = _store.getState();

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

  watcherify(vm,list){

  },
  
  addWatchers(list){

  },
  /**
   * 获得一个watcher单例
   */
  // getWatchProxy(){
  //   if(!watcher){
  //     watcher = new WatchProxy();
  //   }
  //   return watcher;
  // },
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
let initialized = false;
//===========================================
export default {
  setup(store,getters){
    console.warn("===========>>>",store,getters);
    if(initialized){
      return;
    }
    _store = store;
    _getters = getters;
    initialized = true;
  },
  watcherify(vm,list){

  },  
  addWatchers(watchers){
    if(!initialized){
      console.warn("WatchManager is not be initialized.");
      return false;
    }
    let len = watchers.length;
    let watcher,prop,list;
    while(len--){
      watcher = watchers[len];
      list = watcherList[prop];
      if(!list){
        watcherList[prop] = list;
        origin[prop] = _getters[prop];
      }
      list[length] = watcher;
    }
  },
};