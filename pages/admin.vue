<!-- pages/admin.vue -->
<template>
  <div class="admin-page">
    <div class="container">
      <h1 class="title">Управление каруселью</h1>
      
      <div class="control-panel">
        <div class="carousel-controls">
          <h2>Управление каруселью</h2>
          <div class="button-group">
            <button @click="prevSlide" class="control-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Предыдущий слайд
            </button>
            <button @click="nextSlide" class="control-button">
              Следующий слайд
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="slide-form">
          <h2>{{ isEditing ? 'Редактировать слайд' : 'Добавить слайд' }}</h2>
          <form @submit.prevent="saveSlide">
            <div class="form-group">
              <label for="image">URL изображения</label>
              <input type="text" id="image" v-model="currentSlide.image" required />
            </div>
            
            <div class="form-group">
              <label for="rating">Рейтинг (1-5)</label>
              <select id="rating" v-model="currentSlide.rating" required>
                <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="review">Отзыв</label>
              <textarea id="review" v-model="currentSlide.review" rows="4" required></textarea>
            </div>
            
            <div class="form-group">
              <label for="username">Имя пользователя</label>
              <input type="text" id="username" v-model="currentSlide.username" required />
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">
                {{ isEditing ? 'Сохранить изменения' : 'Добавить слайд' }}
              </button>
              <button type="button" v-if="isEditing" @click="cancelEdit" class="btn btn-secondary">
                Отменить
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div class="slides-list">
        <h2>Список слайдов</h2>
        <div class="slides-grid">
          <div v-for="slide in slides" :key="slide.id" class="slide-card">
            <div class="slide-image">
              <img :src="slide.image" :alt="slide.username" />
            </div>
            <div class="slide-info">
              <div class="slide-username">{{ slide.username }}</div>
              <div class="slide-rating">
                <span v-for="i in 5" :key="i" class="star">
                  <svg
                    :class="{ 'star-filled': i <= slide.rating }"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                  >
                    <path
                      fill="currentColor"
                      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                    />
                  </svg>
                </span>
              </div>
              <div class="slide-review">{{ slide.review }}</div>
            </div>
            <div class="slide-actions">
              <button @click="editSlide(slide)" class="btn btn-edit">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                </svg>
              </button>
              <button @click="removeSlide(slide.id)" class="btn btn-delete">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { Slide, NewSlide } from '~/types/slide';

const slides = ref<Slide[]>([]);
const isEditing = ref(false);
const editingId = ref<number | null>(null);

const defaultSlide: NewSlide = {
  image: '',
  rating: 5,
  review: '',
  username: ''
};

const currentSlide = reactive<NewSlide>({ ...defaultSlide });

const { fetchSlides, createSlide, updateSlide, deleteSlide } = useApi();
const socket = useSocket();

onMounted(async () => {
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
});

onUnmounted(() => {
  socket.closeSocket();
});

async function saveSlide() {
  if (isEditing.value && editingId.value !== null) {
    await updateSlide(editingId.value, { ...currentSlide });
    resetForm();
  } else {
    await createSlide({ ...currentSlide });
    resetForm();
  }
}

function editSlide(slide: Slide) {
  isEditing.value = true;
  editingId.value = slide.id;
  
  // Set form values
  currentSlide.image = slide.image;
  currentSlide.rating = slide.rating;
  currentSlide.review = slide.review;
  currentSlide.username = slide.username;
}

function cancelEdit() {
  resetForm();
}

function resetForm() {
  isEditing.value = false;
  editingId.value = null;
  
  // Reset form values
  currentSlide.image = defaultSlide.image;
  currentSlide.rating = defaultSlide.rating;
  currentSlide.review = defaultSlide.review;
  currentSlide.username = defaultSlide.username;
}

async function removeSlide(id: number) {
  if (confirm('Вы уверены, что хотите удалить этот слайд?')) {
    await deleteSlide(id);
  }
}

function nextSlide() {
  socket.controlCarouselNext();
}

function prevSlide() {
  socket.controlCarouselPrev();
}
</script>

<style lang="scss" scoped>
.admin-page {
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
  
  .control-panel {
    display: flex;
    gap: 20px;
    margin-bottom: 40px;
    
    @media (max-width: 768px) {
      flex-direction: column;
    }
    
    .carousel-controls, .slide-form {
      flex: 1;
      background: #fff;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      
      h2 {
        margin-bottom: 20px;
        font-size: 20px;
        color: #333;
      }
    }
    
    .carousel-controls {
      .button-group {
        display: flex;
        gap: 10px;
        
        @media (max-width: 768px) {
          flex-direction: column;
        }
        
        .control-button {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 10px 15px;
          background-color: #f0f0f0;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s;
          
          &:hover {
            background-color: #e0e0e0;
          }
        }
      }
    }
    
    .slide-form {
      form {
        display: flex;
        flex-direction: column;
        gap: 15px;
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
          
          label {
            font-size: 14px;
            color: #666;
          }
          
          input, select, textarea {
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
            
            &:focus {
              outline: none;
              border-color: #4a90e2;
            }
          }
        }
        
        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
          
          .btn {
            padding: 10px 15px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.3s;
            
            &.btn-primary {
              background-color: #4a90e2;
              color: #fff;
              
              &:hover {
                background-color: #3a80d2;
              }
            }
            
            &.btn-secondary {
              background-color: #f0f0f0;
              color: #333;
              
              &:hover {
                background-color: #e0e0e0;
              }
            }
          }
        }
      }
    }
  }
  
  .slides-list {
    background: #fff;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    
    h2 {
      margin-bottom: 20px;
      font-size: 20px;
      color: #333;
    }
    
    .slides-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      
      .slide-card {
        border: 1px solid #eee;
        border-radius: 10px;
        overflow: hidden;
        position: relative;
        
        .slide-image {
          height: 150px;
          overflow: hidden;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
        
        .slide-info {
          padding: 15px;
          
          .slide-username {
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .slide-rating {
            display: flex;
            margin-bottom: 10px;
            
            .star {
              color: #ccc;
              
              &.star-filled {
                color: #ffc107;
              }
            }
          }
          
          .slide-review {
            font-size: 14px;
            color: #666;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
        
        .slide-actions {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          gap: 5px;
          
          .btn {
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            transition: background-color 0.3s;
            
            &.btn-edit {
              background-color: #4a90e2;
              color: #fff;
              
              &:hover {
                background-color: #3a80d2;
              }
            }
            
            &.btn-delete {
              background-color: #e74c3c;
              color: #fff;
              
              &:hover {
                background-color: #d73c2c;
              }
            }
          }
        }
      }
    }
  }
}
</style>
