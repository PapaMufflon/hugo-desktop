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
    props: ['content', 'selection-start', 'selection-end'],
    methods: {
      insertLink: function () {
        let newPosition = this.selectionEnd + 3
        let newContent = this.content.slice(0, this.selectionStart) +
                             '[' +
                             this.content.slice(this.selectionStart, this.selectionEnd) +
                             ']()' +
                             this.content.slice(this.selectionEnd)

        this.$emit('update:content', newContent)
        this.$emit('change-caret-position', newPosition)
        this.$emit('text-area-focus-wtf')
      }
    }
  }
</script>

<style>

</style>