<template>
  <div>
    <div class="container">
      <nav class="navbar is-transparent">
        <div class="navbar-brand">
          <a class="navbar-item" href="https://github.com/PapaMufflon/hugo-desktop">
            hugo-desktop
          </a>
        </div>
        
        <div id="navMenu" class="navbar-menu">
          <div class="navbar-start">
              
          </div>

          <div class="navbar-end">
            <a class="navbar-item" @click="togglePublishedFilter">
              <span class="icon" style="color: #333;">
                <font-awesome-layers>
                  <font-awesome-icon :icon="['fas', 'file']" v-bind:class="{ isNearlyTransparent: filterPublished }" />
                  <font-awesome-icon v-if="filterPublished" :icon="['fas', 'ban']" />
                </font-awesome-layers>
              </span>
            </a>

            <a class="navbar-item" @click="toggleDraftFilter">
              <span class="icon" style="color: #333;">
                <font-awesome-layers>
                  <font-awesome-icon :icon="['fab', 'firstdraft']" v-bind:class="{ isNearlyTransparent: filterDrafts }" />
                  <font-awesome-icon v-if="filterDrafts" :icon="['fas', 'ban']" />
                </font-awesome-layers>
              </span>
            </a>
          </div>
        </div>
      </nav>
    </div>
    <section class="section">
      <h1 class="title">Posts</h1>
      <div class="columns is-multiline">

        <div
          class="column is-12"
          v-for="post in posts"
          :key="post.title"
          v-if="!(filterDrafts && post.draft) && !(filterPublished && !post.draft)">
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
  </div>
</template>

<script>
  export default {
    name: 'editor',
    data: function () {
      return {
        filterPublished: false,
        filterDrafts: false
      }
    },
    computed: {
      posts () {
        return this.$store.getters.sortedPosts
      }
    },
    methods: {
      openPost: function (post) {
        this.$router.push({
          path: '/editor',
          query: {
            post: post
          }
        })
      },
      togglePublishedFilter: function () {
        this.filterPublished = !this.filterPublished
      },
      toggleDraftFilter: function () {
        this.filterDrafts = !this.filterDrafts
      }
    }
  }
</script>

<style scoped>
.blog-tags {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.isNearlyTransparent {
  opacity: 0.2;
}
</style>
