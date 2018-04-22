<template>
  <section class="section">
    <h1 class="title">Posts</h1>
    <div class="columns is-multiline">

      <div class="column is-12" v-for="post in posts" :key="post.title">
        <article class="box">
          <div class="media">
            <aside class="media-left has-text-centered">
              <img :src="post.titleImage" width="80">
              <br>
              <span class="tag is-warning" v-if="post.draft">Draft</span>
            </aside>
            <div class="media-content">
              <p class="title is-5 is-marginless">
                <a @click="openPost(post)">{{post.title}}</a>
              </p>
              <div class="subtitle is-marginless">
                <span class="tag is-primary" v-for="category in post.categories" :key="category">{{category}}</span>
              </div>
              <div class="blog-tags">
                <span class="tag" v-for="tag in post.tags" :key="tag">{{tag}}</span>
              </div>
              <p class="content is-small">
                <a @click="openPost(post)">Edit</a>
                <span>·</span>
                <a>Delete</a>
                <span class="is-pulled-right" v-if="post.draft">Last edited {{post.date.toLocaleDateString()}}</span>
                <span class="is-pulled-right" v-if="!post.draft">Published {{post.date.toLocaleDateString()}}</span>
              </p>
            </div>
          </div>
        </article>
      </div>

    </div>
  </section>
</template>

<script>
  import frontmatter from './../frontmatter.js'

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

        files.forEach(f => {
          fs.readFile(path.join(this.blogPostsPath, f), 'utf-8', (err, data) => {
            if (err) {
              alert('An error ocurred reading the file :' + err.message)
              return
            }

            const start = data.indexOf('---')
            const end = data.indexOf('---', start + 1)
            const details = frontmatter.parse(data.substring(start + 3, end))

            this.posts.push({
              title: details.title,
              date: details.date,
              draft: details.draft,
              categories: details.categories,
              tags: details.tags,
              titleImage: details.titleImage,
              filepath: path.join(this.blogPostsPath, f)
            })

            this.posts = this.posts.sort((a, b) => {
              return (b.date > a.date) - (b.date < a.date)
            })
          })
        })
      })
    },
    methods: {
      openPost: function (post) {
        this.$router.push({
          path: '/editor',
          query: {
            post: post,
            posts: this.posts
          }
        })
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
