const GET_GROUPLIST = 'getGroupList';

module.exports = {
    state:{
        groupList:[],
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