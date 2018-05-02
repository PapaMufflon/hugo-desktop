<template>
    <div class="navbar-item has-dropdown is-hoverable">
        <a class="navbar-link  is-active">
            Posts
        </a>
        <div class="navbar-dropdown is-boxed">
            <a v-for="post in posts" :key="post.filepath" class="navbar-item" @click="openPost(post)">
                {{ post.title }}
            </a>
            <hr class="navbar-divider">
            <navbar-new-post-button
              :posts="posts"
              @new-post="openPost($event)">
            </navbar-new-post-button>
        </div>
    </div>
</template>

<script>
import NavbarNewPostButton from './../Shared/NavbarNewPostButton'

export default {
  name: 'posts-menu-item',
  computed: {
    posts () {
      return this.$store.getters.sortedPosts
    }
  },
  components: { NavbarNewPostButton },
  methods: {
    openPost: function (post) {
      this.$emit('open-post', post)
    }
  }
}
</script>

<style>

</style>