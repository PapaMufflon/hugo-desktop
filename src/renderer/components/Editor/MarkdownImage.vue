<template>
    <a class="navbar-item" @click="insertImage">
        <span class="icon" style="color: #333;">
            <font-awesome-icon :icon="['fas', 'image']" />
        </span>
    </a>
</template>

<script>
const {dialog} = require('electron').remote
const path = require('path')
const cloudinary = require('cloudinary')
const util = require('util')

export default {
  name: 'markdown-image',
  props: ['currentPost', 'content', 'selection-start', 'selection-end'],
  methods: {
    insertImage: function () {
      const cloudinaryUpload = util.promisify(cloudinary.v2.uploader.upload)

      const basepath =
        path.basename(this.$store.state.BlogCollection.currentBlogPath).replace(/ /g, '-') + '/' +
        this.currentPost.title + '/'

      const placeholder = `### image url is getting fetched, don't change this ###`
      const selection = this.selectionStart !== this.selectionEnd ? this.content.slice(this.selectionStart, this.selectionEnd) : ''
      const newContent =
        this.content.slice(0, this.selectionStart) +
        '![alt text](' +
        placeholder +
        ' "' +
        selection +
        '")' +
        this.content.slice(this.selectionEnd, this.content.length)

      dialog.showOpenDialog(async (fileNames) => {
        if (fileNames === undefined) {
          console.log('No file selected')
          return
        }

        this.$emit('update:content', newContent)
        this.$emit('change-caret-position', this.selectionStart + 2)

        const fileName = fileNames[0]
        const publicId = basepath + path.basename(fileName, path.extname(fileName)).replace(/ /g, '-')

        await cloudinaryUpload(fileName, {public_id: publicId})
          .then(uploadResult => {
            const placeholderIndex = this.content.indexOf(placeholder)
            const placeholderReplacedContent =
              this.content.slice(0, placeholderIndex) +
              uploadResult.secure_url +
              this.content.slice(placeholderIndex + placeholder.length, this.content.length)

            this.$emit('update:content', placeholderReplacedContent)
            this.$emit('text-area-focus-wtf')
          })
          .catch(error => {
            alert('An error ocurred reading the posts' + error.message)
            console.log(error)
          })
      })
    }
  }
}
</script>

<style>

</style>