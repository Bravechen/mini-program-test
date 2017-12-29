const GET_SUBJECTS = 'getSubjects';

module.exports = {
    state:{
        subjectList:[],
    },
    getters:{
        subjectList:state => state.subjectList,
    },
    actions:{},
    reducers:{
        [GET_SUBJECTS](state,action){
            cosole.log('In subject==========>state',state,action);
            return state;
        }
    },
};