const GET_GROUPLIST = 'getGroupList';

module.exports = {
    state:{
        groupList:['1885'],
    },
    getters:{
        groupList:state => {
            console.warn("@@@@@@@@@@@@@@@@",state);
            return state.groupList;
        },
    },
    actions:{
        getGroupList(store,userId){
            store.dispatch({
                type:GET_GROUPLIST,
                payload:userId,
            });
        }
    },
    reducers:{
        [GET_GROUPLIST]:function(state,action){
            console.log('In group==========>state',state,action);
            // state = Object.assign({},state,{groupList:['1885','1886']});
            state.groupList = ['1885','1886'];
            return state;
        }
    },
};