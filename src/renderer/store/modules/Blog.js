import { CHANGE_BLOG_PATH } from './../mutation-types'

const state = {
  blogPath: ''
}

const mutations = {
  [CHANGE_BLOG_PATH] (state, newBlogPath) {
    state.blogPath = newBlogPath
  }
}

const actions = {
}

export default {
  state,
  mutations,
  actions
}
