<template>
  <div>
    <section class="hero is-light">
      <div class="hero-body">
        <div class="container">
          <img id="logo" src="~@/assets/logo.png" alt="electron-vue">
        </div>
      </div>
    </section>
    
    <router-view></router-view>
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
