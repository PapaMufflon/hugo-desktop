import { CHANGE_CURRENT_BLOG, BLOG_OPENED } from './../mutation-types'

const Store = require('electron-store')
const store = new Store()

function removeDuplicateBlogData (blogDatas) {
  for (let i = 0; i < blogDatas.length; i++) {
    const a = blogDatas[i]

    for (let j = i + 1; j < blogDatas.length; j++) {
      const b = blogDatas[j]

      if (a.path === b.path) {
        blogDatas.splice(j, 1)
        j--
      }
    }
  }
}

function loadRecentBlogs () {
  let blogDatas = store.get('recent-blogs') || []
  removeDuplicateBlogData(blogDatas)
  return blogDatas
}

const state = {
  currentBlogPath: '',
  recentBlogs: loadRecentBlogs()
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
    removeDuplicateBlogData(state.recentBlogs)

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
