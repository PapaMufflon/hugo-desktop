<template>
  <section class="section">
    <h1 class="title">Posts</h1>
    <div class="columns is-multiline">

      <div class="column is-12-tablet is-6-desktop is-4-widescreen" v-for="post in posts" :key="post.title">
        <article class="box">
          <div class="media">
            <aside class="media-left has-text-centered">
              <img src="file://C:/src/hugo-desktop/alsnuff/static/images/Wasserfall-Val-d-Efra.jpg" width="80">
              <br>
              <span class="tag is-warning">Draft</span>
            </aside>
            <div class="media-content">
              <p class="title is-5 is-marginless">
                <a @click="openPost(post)">{{post.title}}</a>
              </p>
              <div class="subtitle is-marginless">
                <span class="tag is-primary">Bergwandern</span>
              </div>
              <div class="blog-tags">
                <span class="tag">Tessin</span>
                <span class="tag">leicht-mittel</span>
              </div>
              <p class="content is-small">
                <a @click="openPost(post)">Edit</a>
                <span>·</span>
                <a>Delete</a>
                <span class="is-pulled-right">Last edited 20.04.2018</span>
              </p>
            </div>
          </div>
        </article>
      </div>

    </div>
  </section>
</template>

<script>
  const path = require('path')
  const fs = require('fs')

  export default {
    name: 'editor',
    data: function () {
      return {
        posts: []
      }
    },
    computed: {
      blogPostsPath () {
        return path.join(this.$store.state.BlogCollection.currentBlogPath, 'content', 'posts')
      }
    },
    created: function () {
      fs.readdir(this.blogPostsPath, (err, files) => {
        if (err) {
          alert('An error ocurred reading the posts' + err.message)
          console.log(err)
          return
        }

        this.posts = files.map(f => {
          return {
            title: path.basename(f, path.extname(f)),
            filepath: path.join(this.blogPostsPath, f)
          }
        })

        this.currentPost = this.posts[0]
      })
    },
    methods: {
      openPost: function (post) {
        this.$router.push({path: '/editor', query: { post: post }})
      }
    }
  }
</script>

<style>
.blog-tags {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}
</style>
