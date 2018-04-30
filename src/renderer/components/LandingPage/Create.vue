<template>
    <section class="section">
      <div class="field">
        <label class="label">Give us the name of your new blog and the location where it should be stored.</label>
        <div class="control">
          <input class="input" type="text" placeholder="Blog title" v-model="blogName">
        </div>
      </div>

      <select-blog-root-directory
        v-on:directory-selected="directory = $event">
      </select-blog-root-directory>

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
  import SelectBlogRootDirectory from './SelectBlogRootDirectory'
  import { CHANGE_CURRENT_BLOG } from './../../store/mutation-types'

  const electron = require('electron')
  const ipcRenderer = electron.ipcRenderer

  export default {
    name: 'create',
    components: { SelectBlogRootDirectory },
    data: function () {
      return {
        blogName: '',
        directory: ''
      }
    },
    methods: {
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