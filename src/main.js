import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import router from './router';
import DocumentEdit from './components/DocumentEdit';

Vue.config.productionTip = false;
Vue.component('document-edit', DocumentEdit);

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app');