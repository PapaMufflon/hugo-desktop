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

  const Store = require('electron-store')
  const store = new Store()

  export default {
    name: 'recent-blogs',
    data: function () {
      return {
        recentBlogs: []
      }
    },
    created: function () {
      var x = store.get('recent-blogs')

      if (x !== undefined) {
        this.recentBlogs = x.reverse().slice(0, 3)
      }
    },
    methods: {
      openBlog: function (blog) {
        this.$store.commit(CHANGE_CURRENT_BLOG, blog.path)
        this.$router.push({path: '/editor'})
      }
    }
  }
</script>

<style>

</style>