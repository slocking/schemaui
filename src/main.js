import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import router from './router';
import store from './store';
import DocumentEdit from './components/DocumentEdit';
import DynamicField from "./components/DynamicField";
import EmbeddedField from "./components/EmbeddedField";
import VJsonEditor from 'v-jsoneditor';

Vue.config.productionTip = false;
Vue.component('document-edit', DocumentEdit);
Vue.component('dynamic-field', DynamicField);
Vue.component('embedded-field', EmbeddedField);
Vue.use(VJsonEditor);

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app');