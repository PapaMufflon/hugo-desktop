import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      // name: 'editor',
      name: 'landing-page',
      // component: require('@/components/Editor').default
      component: require('@/components/LandingPage').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
