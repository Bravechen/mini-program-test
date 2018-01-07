import BE from '../begonia/begoina';
import bex from '../begonia/bex/bex';

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