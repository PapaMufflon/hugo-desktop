<template>
  <a class="button is-primary" v-on:click="openBlog">
    {{ buttonText }}
  </a>
</template>

<script>
  import { CHANGE_CURRENT_BLOG } from './../../store/mutation-types'

  const electron = require('electron')
  const ipcRenderer = electron.ipcRenderer

  export default {
    name: 'open-blog-button',
    props: ['blogPath', 'buttonText'],
    methods: {
      async openBlog () {
        ipcRenderer.send('startServeBlog', this.blogPath)

        this.$store.commit(CHANGE_CURRENT_BLOG, this.blogPath)
        this.$router.push({path: '/content'})
      }
    }
  }
</script>

<style>
</style>