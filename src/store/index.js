import Vue from 'vue'
import Vuex from 'vuex'
import axios from '../axios-auth'

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
    login({commit}, authData) {
      axios.post('/accounts:signInWithPassword?key=API KEY', {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true,
      }).then( response => {
        commit('updateIdToken', response.data.idToken)
      });
    },
    register({commit}, authData) {
      axios.post('/accounts:signUp?key=API KEY', {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true,
      }).then( response => {
        commit('updateIdToken', response.data.idToken)
      });
    }
  }
})