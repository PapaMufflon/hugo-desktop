<template>
    <div class="navbar-item has-dropdown is-hoverable">
        <a class="navbar-link  is-active">
            Posts
        </a>
        <div class="navbar-dropdown is-boxed">
            <a v-for="post in posts" :key="post.filepath" class="navbar-item" @click="openPost(post)">
                {{ post.title }}
            </a>
            <hr class="navbar-divider">
            <div class="navbar-item">
                <div>
                    <a @click="newPost">New Post</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import hugoDesktopDate from './../../../hugo-desktop-date.js'

const path = require('path')
const fs = require('fs')

export default {
  name: 'posts-menu-item',
  props: ['posts'],
  methods: {
    newPost: function () {
      const template = `---
title: "New post"
date: ${hugoDesktopDate.toShortDate(new Date())}
draft: true
---
`

      const postsPath = path.join(this.$store.state.BlogCollection.currentBlogPath, 'content', 'posts')
      const newPostPath = path.join(postsPath, 'new-post.md')

      fs.writeFile(newPostPath, template, (err) => {
        if (err) {
          alert('An error ocurred creating the file ' + err.message)
        }

        var newPost = {
          title: 'New post',
          filepath: newPostPath
        }

        this.$emit('new-post', newPost)
      })
    },
    openPost: function (post) {
      this.$emit('open-post', post)
    }
  }
}
</script>

<style>

</style>