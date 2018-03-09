<template>
    <div class="tile is-ancestor">
      <div class="tile is-vertical is-8">
        <div class="tile">
          <div class="tile is-parent is-vertical">
            <recent-blogs />
          </div>
          <div class="tile is-parent">
            <article class="tile is-child notification is-info">
              <router-link to="/create">
                <p class="title">Create</p>
                <figure class="image is-4by3">
                  <img src="~@/assets/start-a-new-blog.png">
                </figure>
              </router-link>
            </article>
          </div>
        </div>
        <div class="tile is-parent">
          <article class="tile is-child notification is-danger">
            <p class="title">Import blog</p>
            <p class="subtitle">Coming soon...</p>
            <div class="content">
              <!-- Content -->
            </div>
          </article>
        </div>
      </div>
      <div class="tile is-parent">
        <article class="tile is-child notification is-success">
          <div class="content">
            <p class="title">News</p>
            <p class="subtitle">What's new for hugo-desktop</p>
            <div class="content">
              <!-- Content -->
            </div>
          </div>
        </article>
      </div>
    </div>
</template>

<script>
  import RecentBlogs from './RecentBlogs'

  export default {
    name: 'home',
    components: { RecentBlogs }
  }
</script>

<style>
</style>