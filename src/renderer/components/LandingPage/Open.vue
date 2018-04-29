<template>
    <section class="section">
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
          <open-blog-button
            buttonText="Open"
            :blogPath="directory">
          </open-blog-button>
        </p>
      </div>
    </section>
</template>

<script>
  import OpenBlogButton from './OpenBlogButton'

  const electron = require('electron')
  const ipcRenderer = electron.ipcRenderer

  export default {
    name: 'open',
    components: { OpenBlogButton },
    data: function () {
      return {
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
      }
    }
  }
</script>

<style>
</style>