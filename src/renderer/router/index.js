import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: require('@/components/LandingPage').default,
      children: [
        {
          path: '',
          name: 'landing-page',
          component: require('@/components/LandingPage/Home').default
        },
        {
          path: 'create',
          component: require('@/components/LandingPage/Create').default
        },
        {
          path: 'open',
          component: require('@/components/LandingPage/Open').default
        }
      ]
    },
    {
      path: '/editor',
      component: require('@/components/Editor').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
