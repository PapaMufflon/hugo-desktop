<template>
  <div class="tile is-parent is-vertical">
    <open-blog-button
      v-for="blog in recentBlogs"
      :key="blog.title"
      :buttonText="blog.title"
      :blogPath="blog.path">
    </open-blog-button>
  </div>
</template>

<script>
  import OpenBlogButton from './OpenBlogButton'

  export default {
    name: 'recent-blogs',
    components: { OpenBlogButton },
    data: function () {
      return {
        recentBlogs: []
      }
    },
    created: function () {
      this.recentBlogs = this.$store.getters.recentBlogs(3)
    }
  }
</script>

<style>

</style>