<template>
  <div>
    <section class="hero is-light">
      <div class="hero-body">
        <div class="container">
          <img id="logo" src="~@/assets/logo.png" alt="electron-vue">
        </div>
      </div>
    </section>
    
    <div class="tile is-ancestor">
      <div class="tile is-vertical is-8">
        <div class="tile">
          <div class="tile is-parent is-vertical">
            <article class="tile is-child notification is-primary">
              <p class="title">als nuff</p>
              <p class="subtitle">Wandern für Geniesser</p>
            </article>
            <article class="tile is-child notification is-warning">
              <p class="title">hugo-desktop blog</p>
              <p class="subtitle">dog feeding it</p>
            </article>
          </div>
          <div class="tile is-parent">
            <article class="tile is-child notification is-info">
              <p class="title">Create</p>
              <figure class="image is-4by3">
                <img src="~@/assets/start-a-new-blog.png">
              </figure>
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
  </div>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'

  export default {
    name: 'landing-page',
    components: { SystemInformation },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      }
    }
  }
</script>

<style>

</style>
