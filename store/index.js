const state = () => {
  return {
    title: undefined,
    userInfo: undefined,
  }
}

const mutations = {
  SET_TITLE (state, title) {
    state.title = title
  },
  SET_USERINFO (state, userInfo) {
    state.userInfo = userInfo
  }
}

const actions = {
  async updateUser ({ commit }) {
    let resp = await this.$axios.$get('/api/scraft/userinfo.php')
    commit('SET_USERINFO', resp)
  }
}

const getters = {
  loginState: state => {
    let info = state.userInfo
    if (!!info) {
      return info.logged_in ? 1 : 0
    }
    return -1
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
