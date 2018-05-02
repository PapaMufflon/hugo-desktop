<template>
  <div class="navbar-item">
    <div>
      <a @click="newPost">New Post</a>
    </div>
  </div>
</template>

<script>
import hugoDesktopDate from './../../../hugo-desktop-date.js'

const path = require('path')
const fs = require('fs')

export default {
  name: 'navbar-new-post-button',
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
    }
  }
}
</script>

<style>

</style>