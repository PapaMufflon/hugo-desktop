<template>
  <a class="button is-primary" v-on:click="openBlog">
    {{ buttonText }}
  </a>
</template>

<script>
  import { CHANGE_CURRENT_BLOG } from './../../store/mutation-types'

  const hugo = require('child_process').spawn
  const path = require('path')
  const cwd = require('cwd')
  // const electron = require('electron')
  // const ipcRenderer = electron.ipcRenderer

  function startHugo (blogPath) {
    console.log('starting serving ' + blogPath)

    hugo(path.join(cwd(), 'hugo.exe'), ['serve', '-s', blogPath, '-D'])
  }

  export default {
    name: 'open-blog-button',
    props: ['blogPath', 'buttonText'],
    // beforeDestroy: function () {
    //   this.hugoProcess.kill('SIGINT')
    // },
    methods: {
      async openBlog () {
        startHugo(this.blogPath)

        this.$store.commit(CHANGE_CURRENT_BLOG, this.blogPath)
        this.$router.push({path: '/content'})
      }
    }
  }
</script>

<style>
</style>