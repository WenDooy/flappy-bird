import Vue from 'vue'
import Router from 'vue-router'
import FlyBird from '../components/FlyBird'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'FlyBird',
      component: FlyBird
    }
  ]
})
