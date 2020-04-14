import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import router from './router';
import store from './store';
import DocumentEdit from './components/DocumentEdit';
import DynamicField from "./components/DynamicField";

Vue.config.productionTip = false;
Vue.component('document-edit', DocumentEdit);
Vue.component('dynamic-field', DynamicField);

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app');