<template>
  <div class="carousel-container">
    <ClientOnly>
      <swiper-container ref="containerRef" :init="false">
        <swiper-slide v-for="slide in slides" :key="slide.id" class="slide">
          <div class="slide-content">
            <div class="slide-image">
              <img :src="slide.image" :alt="slide.username" />
            </div>
            <div class="slide-rating">
              <div class="stars">
                <span v-for="i in 5" :key="i" class="star">
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      width="16"
                      height="16"
                    >
                    <path :fill="i <= slide.rating ? '#FFDE30' : 'currentColor'" d="M6.79107 2.29596C7.37318 1.45701 8.62666 1.45701 9.20877 2.29596L10.5479 4.226C10.7385 4.50065 11.0191 4.702 11.3424 4.79615L13.6146 5.45774C14.6023 5.74531 14.9896 6.92283 14.3617 7.72891L12.9172 9.58333C12.7116 9.84721 12.6044 10.173 12.6137 10.5058L12.6788 12.8448C12.7071 13.8615 11.6931 14.5892 10.7229 14.2484L8.49093 13.4645C8.17333 13.3529 7.82651 13.3529 7.50891 13.4645L5.27696 14.2484C4.30678 14.5892 3.29269 13.8615 3.321 12.8448L3.38613 10.5058C3.39539 10.173 3.28822 9.84721 3.08266 9.58333L1.63812 7.72891C1.01021 6.92283 1.39756 5.74531 2.38523 5.45773L4.65743 4.79615C4.98075 4.702 5.26134 4.50065 5.4519 4.226L6.79107 2.29596Z" />
                  </svg>
                </span>
              </div>
            </div>
            <div class="slide-review">{{ slide.review }}</div>
            <div class="slide-username">{{ slide.username }}</div>
          </div>
        </swiper-slide>
      </swiper-container>
    </ClientOnly>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { Slide } from '~/types/slide';

const containerRef = ref(null)

const slides = ref<Slide[]>([]);

const { fetchSlides } = useApi();
const socket = useSocket();

const swiper = useSwiper(containerRef, {
  effect: 'creative',
  loop: false,
  navigation: true,
  pagination: true,
  slidesPerView: 3,
  spaceBetween: 10,
  breakpoints: {
    768: {
      slidesPerView: 1,
    },
  },
  autoplay: {
    delay: 5000,
  },
  creativeEffect: {
    prev: {
      shadow: true,
      translate: [0, 0, -400],
    },
    next: {
      shadow: true,
      translate: [0, 0, -400],
    },
  },
})

onMounted(async () => {
  socket.initSocket();

  slides.value = await fetchSlides();

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
    if (swiper) {
      swiper.next();
    }
  });
  
  socket.onCarouselPrev(() => {
    if (swiper) {
      swiper.prev();
    }
  });
});

onUnmounted(() => {
  socket.closeSocket();
});

</script>

<style lang="scss" scoped>
.carousel-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;
}

.slide {
  height: 100%;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  
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

// Responsive
@media (max-width: 768px) {
  .carousel-container {
    padding: 10px;
  }
}
</style>