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
    props: ['content', 'selection-start', 'selection-end'],
    data: function () {
      return {
        lastUsedHeader: 1
      }
    },
    methods: {
      header: function (level) {
        if (level === 0) {
          level = this.lastUsedHeader
        }

        this.lastUsedHeader = level

        let positionForHeader = this.content.lastIndexOf('\n', this.selectionStart - 1) + 1

        let currentHeaderFormat = this.content.substring(positionForHeader, positionForHeader + 5)
        let currentHeaderLevel = 0

        while (currentHeaderFormat.startsWith('#')) {
          currentHeaderLevel++
          currentHeaderFormat = currentHeaderFormat.slice(1)
        }

        if (currentHeaderLevel === level) {
          return
        }

        let newContent = this.content

        if (currentHeaderLevel > level) {
          newContent = this.content.slice(0, positionForHeader) + this.content.slice(positionForHeader + currentHeaderLevel - level)
        } else {
          let headerToInsert = '#'.repeat(level - currentHeaderLevel)

          if (currentHeaderLevel === 0) {
            headerToInsert += ' '
          }

          newContent = this.content.slice(0, positionForHeader) + headerToInsert + this.content.slice(positionForHeader)
        }

        this.$emit('update:content', newContent)
      }
    }
  }
</script>

<style>

</style>