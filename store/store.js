import BE from '../common/begoina';
import bex from '../common/bex';

import group from './group';
import subject from './subject';

BE.use(bex);

let store = bex.createStore({
    modules:{
        group,
        subject,
    },
    debug:true,
});