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
  
</script>

<style>
.slide-enter-active {
  transition: all .4s ease;
  transition-delay: .4s;
}
.slide-enter {
  transform: translateX(100vw);
}

.slide-leave-active {
  transition: transform .4s ease;
}
.slide-leave-to {
  transform: translateX(-100vw);
}
</style>
