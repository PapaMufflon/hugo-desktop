<template>
    <a class="navbar-item" @click="insertLink">
        <span class="icon" style="color: #333;">
            <font-awesome-icon :icon="['fas', 'link']" />
        </span>
    </a>
</template>

<script>
  export default {
    name: 'markdown-link',
    props: ['editor'],
    methods: {
      insertLink: function () {
        const currentSelection = this.editor.getSelection()
        const currentSelectedText = this.editor.getModel().getValueInRange(currentSelection)
        const newContent = '[' + currentSelectedText + ']()'

        this.editor.executeEdits('MarkdownImage', [
          { range: currentSelection, text: newContent }
        ], [
          {
            selectionStartLineNumber: currentSelection.selectionStartLineNumber,
            selectionStartColumn: currentSelection.selectionStartColumn + 1,
            positionLineNumber: currentSelection.positionLineNumber,
            positionColumn: currentSelection.positionColumn + 1
          }
        ])

        this.editor.focus()
      }
    }
  }
</script>

<style>

</style>