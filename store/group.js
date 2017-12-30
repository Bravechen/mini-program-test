const GET_GROUPLIST = 'getGroupList';

module.exports = {
    state:{
        groupList:['1885'],
    },
    getters:{
        groupList:state => state.groupList,
    },
    actions:{},
    reducers:{
        [GET_GROUPLIST]:function(state,action){

            return state;
        }
    },
};