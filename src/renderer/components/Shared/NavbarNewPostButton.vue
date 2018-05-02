<template>
  <div class="navbar-item">
    <div>
      <a @click="newPost">New Post</a>
    </div>
  </div>
</template>

<script>
import hugoDesktopDate from './../../../hugo-desktop-date.js'
import { ADD_POST } from './../../store/mutation-types'

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

      const newPostPath = path.join(this.$store.getters.postsPath, 'New-post.md')

      fs.writeFile(newPostPath, template, (err) => {
        if (err) {
          alert('An error ocurred creating the file ' + err.message)
        }

        var newPost = {
          title: 'New post',
          date: new Date(),
          draft: true,
          categories: [],
          tags: [],
          titleImage: '',
          filepath: newPostPath
        }

        this.$store.commit(ADD_POST, newPost)
        this.$emit('new-post', newPost)
      })
    }
  }
}
</script>

<style>

</style>