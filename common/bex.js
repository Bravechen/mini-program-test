import Redux from './ReduxLite';
import WM from './WatchManager';
//===================================================
let _store;
let _getters;
//===================================================

function createStore(opt){
    let allReducers = {};
    [allReducers,getters] = handleModules(allReducers,{},opt.modules);
    let state = opt.state || {};
    let reducer = Redux.combineReducers(allReducers);
    _store = new Redux.createStore(reducer,state);
    
    _store.dispatch({});//考虑一下
    
    console.log("============>>>",_store,_store.getState());
    return _store;
}

function watch(list){

}

function unwatch(prop){

}
//=======================================================
function createReducer(_state={},reducers){

    return function(state=_state,action){
        let fn = reducers[action.type];
        if(typeof fn === 'function'){
            return Object.assign({},state,fn.call(null,state,action.data));
        }

        return state;
    }
}

function createGetters(branch,getters){

    return function(_branch=branch,_getters=getters){
        let obj = {};
        let keys = _getters;
        let props = {};
        for(let value of keys){
            props[value] = {
                get(){
                    return _getters[key](_store.getState()[_branch]);
                }
            };
        }
        Object.defineProperties(obj,props);
        return obj;
    }    
}

function handleModules(allReducers,getters,modules){
    if(!modules){
        return allReducers;
    }
    let keys = Object.keys(modules);
    if(keys.length<=0){
        return allReducers;
    }
    let state,reducers,tGetters,m;
    for(let value of keys){
        m = modules[value];
        state = m.state;
        reducers = m.reducers;
        tGetters = m.getters;
        if(!state || !reducers){
            continue;
        }
        allReducers[value] = createReducer(state,reducers);
        if(tGetters){
            Object.assign(getters,handleGetters(tGetters))
        }
    }
    return [allReducers,getters];
}

function handleGetters(getters={}){
    let obj = {};

    return obj;
}

//=======================================================
module.exports = {
    get store(){
        return _store;
    },
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
    setup(){
        
    },
    createStore,
};