<template>
    <a class="navbar-item" @click="publishBlog">
        <span class="icon" style="color: #333;">
            <font-awesome-icon :icon="['fas', 'cloud-upload-alt']" />
        </span>
    </a>
</template>

<script>
  export default {
    name: 'publish',
    props: ['content'],
    methods: {
      publishBlog: function () {
      }
    }
  }
</script>

<style>

</style>