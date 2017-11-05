<template>
    <a class="navbar-item" @click="insertImage">
        <span class="icon" style="color: #333;">
            <i class="fa fa-lg fa-image"></i>
        </span>
    </a>
</template>

<script>
const {dialog} = require('electron').remote
const path = require('path')
const cloudinary = require('cloudinary')

export default {
  name: 'markdown-image',
  props: ['currentPost', 'content', 'selection-start', 'selection-end'],
  methods: {
    insertImage: function () {
      dialog.showOpenDialog((fileNames) => {
        if (fileNames === undefined) {
          console.log('No file selected')
          return
        }

        let fileName = fileNames[0]
        let publicId = this.currentPost.title + '/' + path.basename(fileName, path.extname(fileName))

        cloudinary.v2.uploader.upload(fileName, {public_id: publicId}, (error, result) => {
          if (error) {
            alert('An error ocurred reading the posts' + error.message)
            console.log(error)
            return
          }
          let selection = this.selectionStart !== this.selectionEnd ? this.content.slice(this.selectionStart, this.selectionEnd) : ''

          let newContent = this.content.slice(0, this.selectionStart) +
                                     '![' +
                                     selection +
                                     '](' +
                                     result.secure_url +
                                     ' "")'

          let newPosition = this.selectionStart !== this.selectionEnd
            ? this.selectionEnd + result.secure_url.length + 6
            : this.selectionStart + 2

          this.$emit('update:content', newContent)
          this.$emit('change-caret-position', newPosition)
          this.$emit('text-area-focus-wtf')
        })
      })
    }
  }
}
</script>

<style>

</style>