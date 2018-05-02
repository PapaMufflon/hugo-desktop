import { OPEN_BLOG, ADD_POST, SET_BLOG_BASE_PATH, CHANGE_POST } from './../mutation-types'
import frontmatter from './../../frontmatter.js'

const path = require('path')
const fs = require('fs')

const state = {
  blogData: {
    basePath: '',
    posts: []
  }
}

function contentPath (basePath) {
  return path.join(basePath, 'content')
}

function postsPath (basePath) {
  return path.join(contentPath(basePath), 'posts')
}

const getters = {
  contentPath: (state) => {
    return contentPath(state.blogData.basePath)
  },
  postsPath: (state) => {
    return postsPath(state.blogData.basePath)
  },
  sortedPosts: (state) => {
    return [...state.blogData.posts].sort((a, b) => {
      return (b.date > a.date) - (b.date < a.date)
    })
  }
}

function readPostDetails (postsPath, commit) {
  fs.readdir(postsPath, (err, files) => {
    if (err) {
      alert('An error ocurred reading the posts' + err.message)
      console.log(err)
      return
    }

    files.forEach(f => {
      fs.readFile(path.join(postsPath, f), 'utf-8', (err, data) => {
        if (err) {
          alert('An error ocurred reading the file :' + err.message)
          return
        }

        const start = data.indexOf('---')
        const end = data.indexOf('---', start + 1)
        const details = frontmatter.parse(data.substring(start + 3, end))

        commit(ADD_POST, {
          title: details.title,
          date: details.date,
          draft: details.draft,
          categories: details.categories,
          tags: details.tags,
          titleImage: details.titleImage,
          filepath: path.join(postsPath, f)
        })
      })
    })
  })
}

const mutations = {
  [ADD_POST] (state, postData) {
    state.blogData.posts.push(postData)
  },
  [SET_BLOG_BASE_PATH] (state, blogBasePath) {
    state.blogData.basePath = blogBasePath
  },
  [CHANGE_POST] (state, post, newPostData) {
    for (var property in newPostData) {
      if (newPostData.hasOwnProperty(property)) {
        post[property] = newPostData[property]
      }
    }
  }
}

const actions = {
  [OPEN_BLOG] ({commit}, blogBasePath) {
    commit(SET_BLOG_BASE_PATH, blogBasePath)
    readPostDetails(postsPath(blogBasePath), commit)
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
