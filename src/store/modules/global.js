import Vuetify from '../../plugins/vuetify';

import { global } from '../enum';
import { http } from '../../mixins/http';

const state = {
    version: '',
    dark: localStorage['app.dark'] ? 'true' === localStorage['app.dark'] : false,
};

const getters = {
    version: ({ version }) => version,
    dark: ({ dark }) => dark,
}

const actions = {
    updateGlobal: ({ commit }) => {
        http.methods.get('config')
            .then(newGlobal => commit(global.UPDATE_GLOBAL, newGlobal))
    },
    toggleDark: ({ commit }, isDark) => {
        localStorage['app.dark'] = isDark;
        Vuetify.framework.theme.dark = isDark;
        commit(global.UPDATE_DARK_MODE, isDark);
    },
}

const mutations = {
    [global.UPDATE_GLOBAL]: (state, newGlobal) => {
        Object.keys(newGlobal).forEach(key => {
            if (state.hasOwnProperty(key)) state[key] = newGlobal[key]
        })
    },
    [global.UPDATE_DARK_MODE]: (state, isDark) => {
        state.dark = isDark;
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}