import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '../components/Login.vue'
const Login = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Login.vue')
// import Home from '../components/Home.vue'
const Home = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Home.vue')
// import Welcome from '../components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Welcome.vue')
// import User from '../components/user/User.vue'
const User = () => import(/* webpackChunkName: "User_Right_Role" */ '../components/user/User.vue')
// import Right from '../components/right/Right.vue'
const Right = () => import(/* webpackChunkName: "User_Right_Role" */ '../components/right/Right.vue')
// import Role from '../components/right/Role.vue'
const Role = () => import(/* webpackChunkName: "User_Right_Role" */ '../components/right/Role.vue')
// import Category from '../components/good/Category.vue'
const Category = () => import(/* webpackChunkName: "Category_List_Params" */ '../components/good/Category.vue')
// import Params from '../components/good/Params.vue'
const Params = () => import(/* webpackChunkName: "Category_List_Params" */ '../components/good/Params.vue')
// import List from '../components/good/List.vue'
const List = () => import(/* webpackChunkName: "Category_List_Params" */ '../components/good/List.vue')
// import Add from '../components/good/Add.vue'
const Add = () => import(/* webpackChunkName: "Add_Order_Report" */ '../components/good/Add.vue')
// import Order from '../components/order/Order.vue'
const Order = () => import(/* webpackChunkName: "Add_Order_Report" */ '../components/order/Order.vue')
// import Report from '../components/report/Report.vue'
const Report = () => import(/* webpackChunkName: "Add_Order_Report" */ '../components/report/Report.vue')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [{ path: '/welcome', component: Welcome },
      { path: '/users', component: User },
      { path: '/rights', component: Right },
      { path: '/roles', component: Role },
      { path: '/categories', component: Category },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }]
  }
]

const router = new VueRouter({
  routes
})
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) {
    return next('/login')
  } else {
    next()
  }
})
export default router
