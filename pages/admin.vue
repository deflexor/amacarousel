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
              <label for="image">Изображение</label>
              <input 
                id="image" 
                type="file" 
                @change="handleFileChange" 
                accept="image/*" 
                :required="!isEditing"
                class="form-control"
              />
              <div v-if="imagePreview" class="preview-container">
                <img :src="imagePreview" alt="Preview" class="preview-image" />
              </div>
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
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    width="16"
                    height="16"
                  >
                    <path :fill="i <= slide.rating ? '#FFDE30' : 'currentColor'" d="M6.79107 2.29596C7.37318 1.45701 8.62666 1.45701 9.20877 2.29596L10.5479 4.226C10.7385 4.50065 11.0191 4.702 11.3424 4.79615L13.6146 5.45774C14.6023 5.74531 14.9896 6.92283 14.3617 7.72891L12.9172 9.58333C12.7116 9.84721 12.6044 10.173 12.6137 10.5058L12.6788 12.8448C12.7071 13.8615 11.6931 14.5892 10.7229 14.2484L8.49093 13.4645C8.17333 13.3529 7.82651 13.3529 7.50891 13.4645L5.27696 14.2484C4.30678 14.5892 3.29269 13.8615 3.321 12.8448L3.38613 10.5058C3.39539 10.173 3.28822 9.84721 3.08266 9.58333L1.63812 7.72891C1.01021 6.92283 1.39756 5.74531 2.38523 5.45773L4.65743 4.79615C4.98075 4.702 5.26134 4.50065 5.4519 4.226L6.79107 2.29596Z" />
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
import type { Slide, NewSlide } from '~/types/slide';

const slides = ref<Slide[]>([]);
const isEditing = ref(false);
const editingId = ref<number | null>(null);
const imagePreview = ref<string>('');

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

function handleFileChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  
  const file: File = target.files[0];
  if (!file) return;
  
  // currentSlide.image = file;
  
  // Create image preview
  const reader: FileReader = new FileReader();
  reader.onload = (e: ProgressEvent<FileReader>) => {
    imagePreview.value = currentSlide.image = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}

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
  imagePreview.value = currentSlide.image = slide.image;
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
  imagePreview.value = '';
  
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
}

.admin-page .container {
  max-width: 1200px;
  margin: 0 auto;
}

.admin-page .title {
  text-align: center;
  margin-bottom: 40px;
  font-size: 32px;
  color: #333;
}

.admin-page .control-panel {
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
}

@media (max-width: 768px) {
  .admin-page .control-panel {
    flex-direction: column;
  }
}

.admin-page .carousel-controls,
.admin-page .slide-form {
  flex: 1;
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.admin-page .carousel-controls h2,
.admin-page .slide-form h2 {
  margin-bottom: 20px;
  font-size: 20px;
  color: #333;
}

.admin-page .carousel-controls .button-group {
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .admin-page .carousel-controls .button-group {
    flex-direction: column;
  }
}

.admin-page .carousel-controls .control-button {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px 15px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.admin-page .carousel-controls .control-button:hover {
  background-color: #e0e0e0;
}

.admin-page .slide-form form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.admin-page .slide-form .form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.admin-page .slide-form .form-group label {
  font-size: 14px;
  color: #666;
}

.admin-page .slide-form .form-group input,
.admin-page .slide-form .form-group select,
.admin-page .slide-form .form-group textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.admin-page .slide-form .form-group input:focus,
.admin-page .slide-form .form-group select:focus,
.admin-page .slide-form .form-group textarea:focus {
  outline: none;
  border-color: #4a90e2;
}

.admin-page .slide-form .form-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.admin-page .slide-form .form-actions .btn {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.admin-page .slide-form .form-actions .btn.btn-primary {
  background-color: #4a90e2;
  color: #fff;
}

.admin-page .slide-form .form-actions .btn.btn-primary:hover {
  background-color: #3a80d2;
}

.admin-page .slide-form .form-actions .btn.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.admin-page .slide-form .form-actions .btn.btn-secondary:hover {
  background-color: #e0e0e0;
}

.admin-page .slides-list {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.admin-page .slides-list h2 {
  margin-bottom: 20px;
  font-size: 20px;
  color: #333;
}

.admin-page .slides-list .slides-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.admin-page .slides-list .slide-card {
  border: 1px solid #eee;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.admin-page .slides-list .slide-card .slide-image {
  height: 150px;
  overflow: hidden;
}

.admin-page .slides-list .slide-card .slide-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.admin-page .slides-list .slide-card .slide-info {
  padding: 15px;
}

.admin-page .slides-list .slide-card .slide-info .slide-username {
  font-weight: bold;
  margin-bottom: 5px;
}

.admin-page .slides-list .slide-card .slide-info .slide-rating {
  display: flex;
  margin-bottom: 10px;
}

.admin-page .slides-list .slide-card .slide-info .slide-rating .star {
  color: #ccc;
}

.admin-page .slides-list .slide-card .slide-info .slide-review {
  font-size: 14px;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-page .slides-list .slide-card .slide-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
}

.admin-page .slides-list .slide-card .slide-actions .btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.3s;
}

.admin-page .slides-list .slide-card .slide-actions .btn.btn-edit {
  background-color: #4a90e2;
  color: #fff;
}

.admin-page .slides-list .slide-card .slide-actions .btn.btn-edit:hover {
  background-color: #3a80d2;
}

.admin-page .slides-list .slide-card .slide-actions .btn.btn-delete {
  background-color: #e74c3c;
  color: #fff;
}

.admin-page .slides-list .slide-card .slide-actions .btn.btn-delete:hover {
  background-color: #d73c2c;
}

.admin-page .preview-container {
  margin-top: 10px;
}

.admin-page .preview-image {
  max-width: 100%;
  max-height: 200px;
}
</style>
