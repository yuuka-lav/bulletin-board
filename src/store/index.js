import Vue from 'vue'
import Vuex from 'vuex'
import axios from '../axios-auth'
import router from '../router'
import axiosRefresh from '../axios-refresh'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    idToken: null
  },
  getters: {
    idToken: state => state.idToken
  },
  mutations: {
    updateIdToken(state, idToken) {
      state.idToken = idToken;
    }
  },
  actions: {
    // 1番始めに実行されてidTokenがlocalStorageに保存されていたら値がはいる
    async autologin({commit, dispatch}) {
      const idToken = localStorage.getItem('idToken');
      if(!idToken) return;
      const now = new Date();
      const expriryTimeMs = localStorage.getItem('expriryTimeMs');
      const isExpired = now.getTime() >= expriryTimeMs //期限ぎれ 
      const refreshToken = localStorage.getItem('refreshToken');

      if(isExpired) { //もし期限切れだったら
        await dispatch('refreshIdToken', refreshToken);
      }else{
        const expriresTimeMs = expriryTimeMs - now.getTime(); // 残り時間
        setTimeout(() => {
          dispatch('refreshIdToken', refreshToken )
        }, expriresTimeMs)
        commit('updateIdToken', idToken);
      }
    },

    login({dispatch}, authData) {
      axios.post('/accounts:signInWithPassword?key=API KEY', {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true,
      }).then( response => {
        dispatch('setAuthData', {
          idToken: response.data.idToken,
          expiresIn: response.data.expiresIn,
          refreshToken: response.data.refreshToken,
        })
        router.push('/')
      });
    },
    logout({commit}){
      commit('updateIdToken', null);
      localStorage.removeItem('idToken');
      localStorage.removeItem('expriryTimeMs');
      localStorage.removeItem('refreshToken');
      router.push('/login');
    },
    async refreshIdToken({dispatch}, refreshToken) {
      await axiosRefresh.post('/token?key=API KEY',{
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }).then( res => {
        dispatch('setAuthData', {
          idToken: res.data.id_token,
          expiresIn: res.data.expires_in,
          refreshToken: res.data.refresh_token,
        })
      })
    },
    register({dispatch}, authData) {
      axios.post('/accounts:signUp?key=API KEY', {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true,
      }).then( res => {
        dispatch('setAuthData', {
          idToken: res.data.idToken,
          expiresIn: res.data.expiresIn,
          refreshToken: res.data.refreshToken,
        })
        router.push('/')
      });
    },
    setAuthData({commit, dispatch}, authData) {
      const now = new Date();
      const expriryTimeMs = now.getTime() + authData.expiresIn * 1000
      commit('updateIdToken', authData.idToken);
      localStorage.setItem('idToken', authData.idToken);
      localStorage.setItem('expriryTimeMs', expriryTimeMs);
      localStorage.setItem('refreshToken', authData.refreshToken);
      setTimeout(() => {
        dispatch('refreshIdToken', authData.refreshToken ) 
      }, authData.expiresIn * 1000); //1時間後
    }
  }
})