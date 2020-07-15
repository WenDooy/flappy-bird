import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    birdScore: 0
  },
  getters: {
    birdScore: state => {
      return state.birdScore;
    }
  },
  mutations: {
    birdRecord(state, score) {
      if (state.birdScore < score) {
        state.birdScore = score;
      }
    }
  },
  actions: {
    //读取sessionStorge中的store状态
  }
})

export default store;
