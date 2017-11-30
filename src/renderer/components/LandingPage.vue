<template>
  <div>
    <section class="hero is-light">
      <div class="hero-body">
        <div class="container">
          <img id="logo" src="~@/assets/logo.png" alt="electron-vue">
        </div>
      </div>
    </section>
    
    <transition name="slide">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'

  export default {
    name: 'landing-page',
    components: { SystemInformation }
  }
</script>

<style>
.slide-enter-active {
  transition: all .6s ease;
  transition-delay: .6s;
}
.slide-enter {
  transform: translateX(100vw);
}

.slide-leave-active {
  transition: transform .6s ease;
}
.slide-leave-to {
  transform: translateX(-100vw);
}
</style>
