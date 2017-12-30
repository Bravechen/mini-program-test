import Redux from './ReduxLite';
import WM from './WatchManager';
//===================================================
let _store;
let _getters;
let _actions;
let debug = true;
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
    debug = opt.debug;
    let [allReducers,getters,actions] = handleModules({},{},{},opt.modules);
    _actions = actions;
    let state = opt.state || {};
    let reducer = Redux.combineReducers(allReducers);
    _store = new Redux.createStore(reducer,state);
    
    _store.dispatch({});//考虑一下
    // console.log("============>>>",_store,_store.getState());
    _getters = getters;
    
    return _store;
}

function mapActions(list){

    return [];
}

// function mapGetters(list){

//     return [];
// }

//=========================================================
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
            return Object.assign({},state,fn.call(null,state,action) || state);
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
 * 创建actions的函数
 * 此actions函数仅是由模块文件中actions字段产生的函数包装函数。
 * 并不是redux中的action
 */
function createAction(fn){
    
    return function(action){
      let list = [_store,action];
      fn.apply(this,list);        
    }
}

/**
 * @private
 * 
 * 处理模块数据
 * @param {Object} allReducers [necessary] 最后导出的包含所有分支reducer的对象 
 * @param {Object} getters [necessary] 最后导出的包含所有分支的get函数的对象
 * @param {Object} actions [necessary] 最后导出的包含所有actions函数的集合
 * @param {Object} modules [necessary] 模块对象
 * 
 * @return {Array} [allReducers,getters] 
 */
function handleModules(allReducers,getters,actions,modules){
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
        handleActions(actions,m.actions);
    }
    return [allReducers,getters,actions];
}

/**
 * @private
 * 
 * 处理get函数集合
 * @param {Object} getters [neccessary] 加工并最后导出的get函数集合对象
 * @param {String} branch [neccessary] 分支名称
 * @param {Object} branchGetters [neccessary] 分支的get函数集合 
 */
function handleGetters(getters,branch,branchGetters){
    if(!branchGetters){
        return;
    }
    createGetters(getters,branch,branchGetters)();
    // console.log("@@@===========>>>",branch,getters);
}

/**
 * @private
 * 
 * 处理action函数集合
 * @param {Object} actions [neccessary] 加工并最后导出的actions函数集合
 * @param {Object} branchActions [neccessary] 模块中的actions函数集合 
 */
function handleActions(actions,branchActions){
    if(!branchActions){
        return;
    }
    let keys = Object.keys(branchActions);
    if(keys.length<=0){
        return;
    }

    for(let value of keys){
        actions[value] = createAction(branchActions[value]);
    }
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
     * @public
     * 可以通过actions访问state上的属性
     */
    get actions(){
        return _actions;
    },
    /**
     * @internal
     * 包装器，用于为VMP实例添加功能
     * @param {Object} vmp VMP的实例,
     * 在方法使用参数vmp前，begoina已经对vmp进行了验证。
     * 所以不必再重复验证。
     */
    decorator(vmp){
        Object.defineProperties(vmp,{
            '$store':{
                get(){
                    return _store;
                }
            },
            '$getters':{
                get(){
                    return _getters;
                }
            },
            '$actions':{
                get(){
                    return _actions;
                }
            },      
        });

        if(typeof vmp.watch === 'undefined'){
            vmp.watch = watch;
        }else{
            if(debug){
                console.error("In bex,when do decorate vmp,there is same key of watch in vmp already,please check.");
            }            
            return;
        }

        if(typeof vmp.unwatch === 'undefined'){
            vmp.unwatch = unwatch;
        }else{
            if(debug){
                console.error("In bex,when do decorate vmp,there is same key of unwatch in vmp already,please check.");
            }            
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