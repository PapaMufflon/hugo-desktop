<template>
    <section class="section">
      <div class="field">
        <label class="label">Give us the name of your new blog and the location where it should be stored.</label>
        <div class="control">
          <input class="input" type="text" placeholder="Blog title" v-model="blogName">
        </div>
      </div>

      <div class="field is-grouped">
        <p class="control is-expanded">
          <input class="input" type="folder" placeholder="Local destination folder" v-model="directory">
        </p>
        <div class="control">
          <a class="button is-info" v-on:click="chooseFolder">
            Select
          </a>
        </div>
      </div>

      <div class="field is-grouped is-grouped-right">
        <p class="control">
          <a class="button is-primary" v-on:click="createBlog">
            Create
          </a>
        </p>
      </div>
    </section>
</template>

<script>
  import { CHANGE_CURRENT_BLOG } from './../../store/mutation-types'

  const electron = require('electron')
  const ipcRenderer = electron.ipcRenderer

  export default {
    name: 'create',
    data: function () {
      return {
        blogName: '',
        directory: ''
      }
    },
    methods: {
      chooseFolder: function () {
        let that = this

        ipcRenderer.on('directory', function (event, message) {
          that.directory = message[0]
        })

        ipcRenderer.send('selectDirectory')
      },
      async createBlog () {
        ipcRenderer.on('blogCreated', (event, blogPath) => {
          this.$store.commit(CHANGE_CURRENT_BLOG, blogPath)
          this.$router.push({path: '/editor'})
        })

        ipcRenderer.send('createBlog', { directory: this.directory, name: this.blogName })
      }
    }
  }
</script>

<style>
</style>