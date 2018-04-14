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
    props: ['editor', 'monaco'],
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
        const currentSelectedText = this.editor.getModel().getValueInRange(currentSelection)

        function getCurrentHeaderLevel (s) {
          let level = 0

          while (s.startsWith('#')) {
            s = s.slice(1)
            level++
          }

          return level
        }

        const currentHeaderLevel = getCurrentHeaderLevel(currentSelectedText)
        const headerTextStart = currentHeaderLevel === 0 ? 0 : currentHeaderLevel + 1
        const textWithoutHeaderFormat = currentSelectedText.slice(headerTextStart)
        const result = '#'.repeat(desiredLevel) + ' ' + textWithoutHeaderFormat

        this.editor.executeEdits('MarkdownHeader', [
          { range: currentSelection, text: result }
        ], [
          new this.monaco.Selection(
            currentSelection.selectionStartLineNumber + desiredLevel - headerTextStart,
            currentSelection.selectionStartColumn,
            currentSelection.positionLineNumber + desiredLevel - headerTextStart,
            currentSelection.positionColumn)
        ])
      }
    }
  }
</script>

<style>

</style>