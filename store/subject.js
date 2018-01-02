const GET_SUBJECTS = 'getSubjects';

module.exports = {
    state:{
        subjectList:[],
    },
    getters:{
        subjectList:state => state.subjectList,
    },
    actions:{
        getSubjectList(store,groupId){
            store.dispatch({
                type:GET_SUBJECTS,
                payload:groupId,
            });
        }
    },
    reducers:{
        [GET_SUBJECTS](state,action){
            console.log('In subject==========>state',state,action);
            state.subjectList = [{id:'chinese',name:'语文',className:''}];
        }
    },
};