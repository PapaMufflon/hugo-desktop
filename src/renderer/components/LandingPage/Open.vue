<template>
    <section class="section">
      <select-blog-root-directory
        v-on:directory-selected="directory = $event">
      </select-blog-root-directory>

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
  import SelectBlogRootDirectory from './SelectBlogRootDirectory'

  export default {
    name: 'open',
    components: { OpenBlogButton, SelectBlogRootDirectory },
    data: function () {
      return {
        directory: ''
      }
    }
  }
</script>

<style>
</style>