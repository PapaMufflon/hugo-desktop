import { CHANGE_CURRENT_BLOG } from './../mutation-types'

const state = {
  currentBlogPath: ''
}

const mutations = {
  [CHANGE_CURRENT_BLOG] (state, newBlogPath) {
    state.currentBlogPath = newBlogPath
  }
}

const actions = {
}

export default {
  state,
  mutations,
  actions
}
