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
              @new-post="newPost">
            </navbar-new-post-button>
        </div>
    </div>
</template>

<script>
import NavbarNewPostButton from './../Shared/NavbarNewPostButton'

export default {
  name: 'posts-menu-item',
  props: ['posts'],
  components: { NavbarNewPostButton },
  methods: {
    newPost: function (newPost) {
      this.posts.push(newPost)
      this.$emit('open-post', newPost)
    },
    openPost: function (post) {
      this.$emit('open-post', post)
    }
  }
}
</script>

<style>

</style>