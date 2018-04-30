<template>
  <div class="field is-grouped">
    <p class="control is-expanded">
      <input
        class="input"
        type="folder"
        placeholder="Blog root directory"
        v-model="directory">
    </p>
    <div class="control">
      <a class="button is-info" v-on:click="chooseFolder">
        Select
      </a>
    </div>
  </div>
</template>

<script>
  import electron from 'electron'

  export default {
    name: 'select-blog-root-directory',
    data: function () {
      return {
        directory: ''
      }
    },
    watch: {
      directory: function (val, oldVal) {
        this.$emit('directory-selected', this.directory)
      }
    },
    methods: {
      chooseFolder: function () {
        const ipcRenderer = electron.ipcRenderer

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