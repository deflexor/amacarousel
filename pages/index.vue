<!-- pages/index.vue -->
<template>
  <div class="home-page">
    <div class="container">
      <h1 class="title">Отзывы наших клиентов</h1>
      <SlideCarousel />
    </div>
  </div>
</template>

<script setup lang="ts">
import SlideCarousel from '~/components/SlideCarousel.vue';
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  padding: 40px 20px;
  background-color: #f5f5f5;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .title {
    text-align: center;
    margin-bottom: 40px;
    font-size: 32px;
    color: #333;
  }
}

// Responsive
@media (max-width: 768px) {
  .home-page {
    padding: 20px 10px;
    
    .title {
      font-size: 24px;
      margin-bottom: 20px;
    }
  }
}
</style>
