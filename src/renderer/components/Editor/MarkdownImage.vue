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
  props: ['currentPost', 'editor'],
  methods: {
    insertImage: function () {
      const cloudinaryUpload = util.promisify(cloudinary.v2.uploader.upload)

      const basepath =
        path.basename(this.$store.state.ActiveBlog.blogData.basePath).replace(/ /g, '-') + '/' +
        this.currentPost.title + '/'

      const placeholder = `### image url is getting fetched, don't change this ###`
      const currentSelection = this.editor.getSelection()
      const currentSelectedText = this.editor.getModel().getValueInRange(currentSelection)
      const newContent =
        '![alt text](' +
        placeholder +
        ' "' +
        currentSelectedText +
        '")'

      dialog.showOpenDialog(async (fileNames) => {
        if (fileNames === undefined) {
          console.log('No file selected')
          return
        }

        this.editor.executeEdits('MarkdownImage', [
          { range: currentSelection, text: newContent }
        ], [
          {
            selectionStartLineNumber: currentSelection.startLineNumber,
            selectionStartColumn: currentSelection.startColumn + 2,
            positionLineNumber: currentSelection.endLineNumber,
            positionColumn: currentSelection.startColumn + 10
          }
        ])

        this.editor.focus()

        const fileName = fileNames[0]
        const publicId = basepath + path.basename(fileName, path.extname(fileName)).replace(/ /g, '-')

        const uploadResult = await cloudinaryUpload(fileName, {public_id: publicId})
        const placeholderRange = this.editor.getModel().findMatches(placeholder)[0].range

        this.editor.executeEdits('MarkdownImage', [
          { range: placeholderRange, text: uploadResult.secure_url }
        ])
      })
    }
  }
}
</script>

<style>

</style>