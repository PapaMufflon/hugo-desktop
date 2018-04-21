<template>
    <div class="navbar-item has-dropdown is-hoverable">
        <a class="navbar-link is-active" @click="header(0)">
            H{{ lastUsedHeader }}
        </a>
        <div class="navbar-dropdown is-boxed">
            <a v-for="level in 5" :key="level" class="navbar-item" @click="header(level)">
                H{{ level }}
            </a>
        </div>
    </div>
</template>

<script>
  export default {
    name: 'markdown-header',
    props: ['editor'],
    data: function () {
      return {
        lastUsedHeader: 1
      }
    },
    methods: {
      header: function (desiredLevel) {
        if (desiredLevel === 0) {
          desiredLevel = this.lastUsedHeader
        }

        const currentSelection = this.editor.getSelection()
        const currentLineText = this.editor.getModel().getLineContent(currentSelection.startLineNumber)

        function getCurrentHeaderLevel (s) {
          let level = 0

          while (s.startsWith('#')) {
            s = s.slice(1)
            level++
          }

          return level
        }

        const currentHeaderLevel = getCurrentHeaderLevel(currentLineText)
        const headerTextStart = currentHeaderLevel === 0 ? 0 : currentHeaderLevel + 1
        const textWithoutHeaderFormat = currentLineText.slice(headerTextStart)
        const result = '#'.repeat(desiredLevel) + ' ' + textWithoutHeaderFormat

        this.editor.executeEdits('MarkdownHeader', [
          {
            range: {
              startLineNumber: currentSelection.startLineNumber,
              startColumn: 0,
              endLineNumber: currentSelection.startLineNumber,
              endColumn: this.editor.getModel().getLineMaxColumn(currentSelection.startLineNumber)
            },
            text: result
          }
        ], [
          {
            selectionStartLineNumber: currentSelection.selectionStartLineNumber,
            selectionStartColumn: currentSelection.selectionStartColumn + desiredLevel - headerTextStart + 1,
            positionLineNumber: currentSelection.selectionStartLineNumber,
            positionColumn: currentSelection.positionColumn + desiredLevel - headerTextStart + 1
          }
        ])

        this.editor.focus()
      }
    }
  }
</script>

<style>

</style>