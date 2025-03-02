<template>
  <ClientOnly>
    <div class="carousel">
      <button class="prev" :class="isBeginning ? 'grey-arrow' : 'orange-arrow'">
        <span @click="containerRef?.swiper.slidePrev()">&#10094;</span>
      </button>
      <swiper-container ref="containerRef" :init="false" class="carousel-container">
        <swiper-slide v-for="slide in slides" :key="slide.id" class="review-card">
          <img :src="slide.image" :alt="slide.username" />
          <div class="review-content">
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
          <p>{{ slide.review }}</p>
          <span class="author">{{ slide.username }}</span>
        </div>
      </swiper-slide>
    </swiper-container>
    <button class="next" :class="isEnd ? 'grey-arrow' : 'orange-arrow'">
      <span @click="containerRef?.swiper.slideNext()">&#10095;</span>
    </button>
  </div>
</ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { Slide } from '~/types/slide';

const containerRef = ref(null)

const slides = ref<Slide[]>([]);

const { fetchSlides } = useApi();
const socket = useSocket();

const isBeginning = ref(true);
const isEnd = ref(false);

const swiper = useSwiper(containerRef, {
  loop: false,
  navigation: false,
  pagination: true,
  slidesPerView: 1,
  spaceBetween: 10,
  breakpoints: {
    375: {
      slidesPerView: 3,
    },
  },
  on: {
    init: function (s) {
      isBeginning.value = s.isBeginning
      isEnd.value = s.isEnd
    },
    transitionEnd: function (s) {
      isBeginning.value = s.isBeginning
      isEnd.value = s.isEnd
    },
  },
  autoplay: false
})

onMounted(async () => {
  console.log(swiper.instance)
  console.log(containerRef)
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
    // if (swiper) swiper.next();
    containerRef.value?.swiper.slideNext()
  });
  
  socket.onCarouselPrev(() => {
    // if (swiper) swiper.prev();
    containerRef.value?.swiper.slidePrev()
  });
});

onUnmounted(() => {
  socket.closeSocket();
});

</script>

<style lang="scss" scoped>

$orange-arrow: #FE9539;
$gery-arrow: #C7CADF;

.grey-arrow {
  color: $gery-arrow;
  font-size: 200%;
  font-weight: 700;
}

.orange-arrow {
  color: $orange-arrow;
  font-size: 200%;
  font-weight: 700;
}

// Responsive
@media (max-width: 375px) {
  .carousel {
    padding: 10px;
  }
}

.carousel {
  --swiper-pagination-bottom: -5px;
  --swiper-pagination-color: #FE9539;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  max-width: 1260px;
  margin: auto;
  position: relative;
  
  .prev, .next {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 10px 9px;
    @media (max-width: 375px) {
      padding: 0;
      align-self: flex-end;
      span {
        position: absolute;
        bottom: 8px;
        pointer-events: all;
        z-index: 10;
      }
    }
  }
  
  @media (max-width: 375px) {
    .next {
      span {
        right: 30px
      }
    }
    
    .prev {
      span {
        left: 30px
      }
    }
  }
  
  .carousel-container {
    display: flex;
    gap: 15px;
    overflow: hidden;
    padding: 10px;
  }
  
  .review-card {
    height: 242px;
    background: white;
    border-radius: 10px;
    padding: 15px;
    text-align: center;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    margin: 20px 0;
    @media (max-width: 375px) {
      margin: 35px 0;
    }
    width: fit-content;
    gap: 10px;
    
    img {
      height: 210px;
      border-radius: 5px;
    }
    
    .review-content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      height: 100%;
      justify-content: space-between;
      .stars {
        .star {
          display: inline-block;
        }
        white-space: nowrap;
        margin: 5px 0;
      }
      
      p {
        font-size: 16px;
        line-height: 20px;
        text-align: left;
        color: #333;
        text-overflow: ellipsis;
        overflow: hidden;
        -webkit-line-clamp: 7;
        -webkit-box-orient: vertical;
        display: -webkit-box;
      }
      
      .author {
        text-align: left;
        font-weight: bold;
        margin-top: auto;
      }
    }
  }
}


</style>