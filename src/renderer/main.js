import Vue from 'vue'

import App from './App'
import router from './router'
import store from './store'

import cloudinary from 'cloudinary'
import 'font-awesome-webpack'

import 'bulma/css/bulma.css'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

cloudinary.config({
  cloud_name: 'alsnuff',
  api_key: '572887781728817',
  api_secret: '12j_t3fV9FubalsBkyQ5i3zXhZ0'
})

// const hugo = require('child_process').execFile
// const cwd = require('cwd')
// const path = require('path')

// hugo(path.join(cwd(), 'hugo.exe'), ['serve', '-s', 'alsnuff', '-D'], function (err, data) {
//   if (err) {
//     console.error(err)
//     return
//   }

//   console.log(data.toString())
// })

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
