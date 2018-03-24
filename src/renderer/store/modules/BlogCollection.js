import { CHANGE_CURRENT_BLOG, BLOG_OPENED } from './../mutation-types'

const Store = require('electron-store')
const store = new Store()

const state = {
  currentBlogPath: '',
  recentBlogs: store.get('recent-blogs')
}

const getters = {
  recentBlogs: (state) => (number) => {
    return state.recentBlogs.slice(0, number)
  }
}

const mutations = {
  [CHANGE_CURRENT_BLOG] (state, newBlogPath) {
    state.currentBlogPath = newBlogPath
  },
  [BLOG_OPENED] (state, blogData) {
    state.recentBlogs.unshift(blogData)
    store.set('recent-blogs', state.recentBlogs)
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
