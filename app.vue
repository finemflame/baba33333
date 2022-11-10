<template>
  <header class="p-3 bg-dark text-white" v-if="!isIndex">
    <div class="container">
      <div
        class="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start"
      >
        <router-link
          to="/"
          class="d-flex align-items-center mb-2 mb-lg-0 text-white text-decoration-none"
        >
          <img src="https://umsu.ca/wp-content/uploads/2019/05/CBC-News-Logo.jpg" alt="Bongda1" class="mr-2" height="50">
        </router-link>

        <ul class="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
          <li><router-link to="/" class="nav-link px-2 text-secondary">Home</router-link></li>
        </ul>

      </div>
    </div>
  </header>
  <main>
    <div class="container">
    <NuxtPage />
    </div>
  </main>
</template>
<script setup>
const isIndex = useRoute().name === 'index';
</script>
