<!-- components/SlideCarousel.vue -->
<template>
  <div class="carousel-container">
    <div class="swiper-container">
      <div class="swiper-wrapper">
        <swiper
          :slidesPerView="isMobile ? 1 : 3"
          :spaceBetween="20"
          :navigation="true"
          :pagination="{ clickable: true }"
          :modules="[Navigation, Pagination]"
          :class="'mySwiper'"
          @swiper="onSwiperInitialized"
        >
          <swiper-slide v-for="slide in slides" :key="slide.id" class="slide">
            <div class="slide-content">
              <div class="slide-image">
                <img :src="slide.image" :alt="slide.username" />
              </div>
              <div class="slide-rating">
                <div class="stars">
                  <span v-for="i in 5" :key="i" class="star">
                    <svg
                      :class="{ 'star-filled': i <= slide.rating }"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                    >
                      <path
                        fill="currentColor"
                        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                      />
                    </svg>
                  </span>
                </div>
              </div>
              <div class="slide-review">{{ slide.review }}</div>
              <div class="slide-username">{{ slide.username }}</div>
            </div>
          </swiper-slide>
        </swiper>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Slide } from '~/types/slide';

const slides = ref<Slide[]>([]);
const swiperInstance = ref(null);
const isMobile = ref(false);

const { fetchSlides } = useApi();
const socket = useSocket();

onMounted(async () => {
  // Check if mobile
  checkMobileView();
  window.addEventListener('resize', checkMobileView);
  
  // Initialize socket
  socket.initSocket();
  
  // Fetch initial slides
  slides.value = await fetchSlides();
  
  // Listen for socket events
  socket.onSlideCreated((slide) => {
    slides.value.push(slide);
  });
  
  socket.onSlideUpdated((updatedSlide) => {
    const index = slides.value.findIndex(s => s.id === updatedSlide.id);
    if (index !== -1) {
      slides.value[index] = updatedSlide;
    }
  });
  
  socket.onSlideDeleted((id) => {
    slides.value = slides.value.filter(slide => slide.id !== id);
  });
  
  socket.onCarouselNext(() => {
    if (swiperInstance.value) {
      swiperInstance.value.slideNext();
    }
  });
  
  socket.onCarouselPrev(() => {
    if (swiperInstance.value) {
      swiperInstance.value.slidePrev();
    }
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobileView);
  socket.closeSocket();
});

function onSwiperInitialized(swiper) {
  swiperInstance.value = swiper;
}

function checkMobileView() {
  isMobile.value = window.innerWidth <= 768;
}
</script>

<style lang="scss" scoped>
.carousel-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  
  .swiper-container {
    width: 100%;
    overflow: hidden;
    
    .swiper-wrapper {
      display: flex;
    }
  }
  
  .slide {
    height: 100%;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    
    .slide-content {
      padding: 20px;
      display: flex;
      flex-direction: column;
      height: 100%;
      
      .slide-image {
        width: 80px;
        height: 80px;
        margin: 0 auto 15px;
        border-radius: 50%;
        overflow: hidden;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .slide-rating {
        margin-bottom: 15px;
        display: flex;
        justify-content: center;
        
        .stars {
          display: flex;
          
          .star {
            color: #ccc;
            margin: 0 2px;
            
            &.star-filled {
              color: #ffc107;
            }
          }
        }
      }
      
      .slide-review {
        flex-grow: 1;
        font-size: 14px;
        line-height: 1.5;
        color: #666;
        margin-bottom: 15px;
        text-align: center;
      }
      
      .slide-username {
        font-weight: bold;
        color: #333;
        text-align: center;
      }
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .carousel-container {
    padding: 10px;
  }
}
</style>
