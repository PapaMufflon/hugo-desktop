<template>
    <div class="tile is-parent is-vertical">
        <a v-for="blog in recentBlogs" :key="blog.title" @click="openBlog(blog)">
            <article class="tile is-child notification is-primary">
                <p class="title">{{blog.title}}</p>
                <p class="subtitle">{{blog.subtitle}}</p>
            </article>
        </a>
    </div>
</template>

<script>
  import { CHANGE_CURRENT_BLOG } from './../../store/mutation-types'

  export default {
    name: 'recent-blogs',
    data: function () {
      return {
        recentBlogs: []
      }
    },
    created: function () {
      this.recentBlogs = this.$store.getters.recentBlogs(3)
    },
    methods: {
      openBlog: function (blog) {
        this.$store.commit(CHANGE_CURRENT_BLOG, blog.path)
        this.$router.push({path: '/content'})
      }
    }
  }
</script>

<style>

</style>