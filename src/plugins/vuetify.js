import Vue from 'vue';
import global from '../store/modules/global';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        dark: global.state.dark
    }
});
