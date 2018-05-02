<template>
  <a class="navbar-item" @click="goToContent">
    <span class="icon">
      <font-awesome-icon :icon="['fas', 'arrow-left']" />
    </span>
  </a>
</template>

<script>
  export default {
    name: 'navbar-go-back-button',
    props: ['destination'],
    methods: {
      goToContent: function () {
        this.$router.push({path: '/' + this.destination})
      }
    }
  }
</script>

<style>

</style>