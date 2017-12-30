import Redux from './ReduxLite';
import WM from './WatchManager';
//===================================================
let _store;
let _getters;
//===================================================
/**
 * @public
 * 
 * 创建一个store实例
 * @param {Object} opt 
 */
function createStore(opt){
    if(_store){
        return _store;
    }
    let [allReducers,getters] = handleModules({},{},opt.modules);
    let state = opt.state || {};
    let reducer = Redux.combineReducers(allReducers);
    _store = new Redux.createStore(reducer,state);
    
    _store.dispatch({});//考虑一下
    console.log("============>>>",_store,_store.getState());
    _getters = getters;
    return _store;
}
/**
 * @public
 * 
 * 添加对一些state属性的观察
 * 用于包装器，请直接使用`vmp.watch()`
 * @param {Array} list 
 */
function watch(list){

}
/**
 * @public
 * 
 * 接触一个属性的观察
 * 用于包装器，请直接使用`vmp.unwatch()`
 * @param {*} prop 
 */
function unwatch(prop){

}
//=======================================================
/**
 * @private
 * 
 * 创建reducer函数的通用函数
 * 主要用来创建state分支的reducer
 * @param {Object} _state [necessary] 原始的state对象 
 * @param {Object} reducers [necessary] 分支reducer集合对象
 * 
 * @return {Function} reducer函数 
 */
function createReducer(_state={},reducers){

    return function(state=_state,action){
        let fn = reducers[action.type];
        if(typeof fn === 'function'){
            return Object.assign({},state,fn.call(null,state,action.data));
        }

        return state;
    }
}

/**
 * @private
 * 
 * 创建分支getters
 * 将生成的get函数挂载在传入的backGetters参数上
 * 
 * @param {Object} backGetters [necessary] 挂载的对象 
 * @param {String} branch [necessary] 分支名 
 * @param {Object} getters [necessary] 原始的getters集合对象
 * 
 * @return {Function} 按照分支和get函数集合，生成每个属性的getter函数 
 */
function createGetters(backGetters={},branch,getters){

    return function(_branch=branch,_getters=getters){
        let keys = Object.keys(_getters);
        let props = {};
        for(let value of keys){
            props[value] = {
                get(){
                    return _getters[value](_store.getState()[_branch]);
                }
            };
        }
        Object.defineProperties(backGetters,props);
    }    
}

/**
 * @private
 * 
 * 处理模块数据
 * @param {Object} allReducers [necessary] 最后导出的包含所有分支reducer的对象 
 * @param {Object} getters [necessary] 最后导出的包含所有分支的get函数的对象
 * @param {Object} modules [necessary] 模块对象
 * 
 * @return {Array} [allReducers,getters] 
 */
function handleModules(allReducers,getters,modules){
    if(!modules){
        return allReducers;
    }
    let keys = Object.keys(modules);
    if(keys.length<=0){
        return allReducers;
    }

    let state,reducers,m;
    for(let value of keys){
        m = modules[value];
        state = m.state;
        reducers = m.reducers;
        if(!state || !reducers){
            continue;
        }
        allReducers[value] = createReducer(state,reducers);
        handleGetters(getters,value,m.getters);
    }
    return [allReducers,getters];
}

/**
 * @private
 * 
 * 处理get函数集合
 * @param {Object} getters 给加工并最后导出的get函数集合对象
 * @param {String} branch 分支名称
 * @param {Object} branchGetters 分支的get函数集合 
 */
function handleGetters(getters,branch,branchGetters){
    if(!branchGetters){
        return;
    }
    createGetters(getters,branch,branchGetters)();
    // console.log("@@@===========>>>",branch,getters);
}

//=======================================================
export default {
    /**
     * @public
     * 系统创建的唯一store
     */
    get store(){
        return _store;
    },
    /**
     * @public
     * 可以通过getters访问state上的属性
     */
    get getters(){
        return _getters;
    },
    /**
     * @internal
     * 包装器，用于为VMP实例添加功能
     * @param {Object} vmp VMP的实例,
     * 在方法使用参数vmp前，begoina已经对vmp进行了验证。
     * 所以不必再重复验证。
     */
    decorator(vmp){
        Object.defineProperty(vmp,'$store',{
            get(){
                return _store;
            }
        });

        if(typeof vmp.watch === 'undefined'){
            vmp.watch = watch;
        }else{
            console.error("In bex,when do decorate vmp,there is same key of watch in vmp already,please check.");
            return;
        }

        if(typeof vmp.unwatch === 'undefined'){
            vmp.unwatch = unwatch;
        }else{
            console.error("In bex,when do decorate vmp,there is same key of unwatch in vmp already,please check.");
            return;
        }
        
    },
    /**
     * @internal
     * 启动bex
     * 由begoina主动调用
     * 不用手动调用
     */
    setup(){
        
    },
    /**
     * @public
     * 创建一个store实例
     * 注意当一个store实例创建时，将会成为单例。
     * 如果下次再调用该方法，仍然会返回上一次创建的实例。
     * 
     * @param {Object} opt [necessary] store的配置对象
     */
    createStore,
};