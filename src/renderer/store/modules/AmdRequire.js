import { SET_AMD_REQUIRE } from './../mutation-types'

const state = {
  amdRequire: {}
}

const getters = {
}

const mutations = {
  [SET_AMD_REQUIRE] (state, amdRequire) {
    state.amdRequire = amdRequire
  }
}

const actions = {
}

export default {
  state,
  getters,
  mutations,
  actions
}
