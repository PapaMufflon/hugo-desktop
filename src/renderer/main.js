import Vue from 'vue'

import App from './App'
import router from './router'
import store from './store'

import cloudinary from 'cloudinary'

import fontawesome from '@fortawesome/fontawesome'
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import solid from '@fortawesome/fontawesome-free-solid'
import regular from '@fortawesome/fontawesome-free-regular'
import brands from '@fortawesome/fontawesome-free-brands'

import 'bulma/css/bulma.css'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

cloudinary.config({
  cloud_name: 'alsnuff',
  api_key: '572887781728817',
  api_secret: '12j_t3fV9FubalsBkyQ5i3zXhZ0'
})

fontawesome.library.add(solid, regular, brands)
Vue.component('font-awesome-icon', FontAwesomeIcon)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
