import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import router from './router'
import store from './store/index'

Vue.config.productionTip = false

axios.defaults.baseURL = "https://firestore.googleapis.com/v1/projects/bulletin-board-d6b40/databases/(default)/documents"


const interceptorsRequest = axios.interceptors.request.use(
  config => {
    console.log('interceptorsRequest');
    return config;
  },
  error => {
    return Promise.reject(error) //catchに行くようにする
  }
)// getやpostをする前にこの処理を行う

const interceptorsResponse = axios.interceptors.response.use(
  response => {
    console.log('interceptorsResponse');
    return response;
  },
  error => {
    return Promise.reject(error) //catchに行くようにする
  }
)// thenの前に処理を行う(中身はgetした後だったりのresponseの内容)

axios.interceptors.request.eject(interceptorsRequest) //requestの処理を取り消し
axios.interceptors.response.eject(interceptorsResponse);

store.dispatch('autologin').then(() => {  //最初にautologinが呼ばれる
  new Vue({
    router,
    store,
    render: h => h(App),
  }).$mount('#app')
});