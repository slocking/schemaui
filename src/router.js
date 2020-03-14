import Vue from 'vue';
import VueRouter from 'vue-router';
import Collection from './pages/Collection';
import RootPage from './pages/RootPage'

Vue.use(VueRouter);

export default new VueRouter({
    mode: 'history',
    base: 'schemaui',
    routes: [
        { path: '/collection/:collection', component: Collection },
        { path: '*', component: RootPage }
    ]
});