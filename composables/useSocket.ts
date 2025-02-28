// composables/useSocket.ts
import { io, Socket } from 'socket.io-client';
import { Slide } from '~/types/slide';

export const useSocket = () => {
  const config = useRuntimeConfig();
  const socket = ref<Socket | null>(null);
  
  const initSocket = () => {
    socket.value = io(config.public.socketUrl);
    
    socket.value.on('connect', () => {
      console.log('Connected to Socket.io server');
    });
    
    socket.value.on('disconnect', () => {
      console.log('Disconnected from Socket.io server');
    });
  };
  
  const onSlideCreated = (callback: (slide: Slide) => void) => {
    socket.value?.on('slideCreated', callback);
  };
  
  const onSlideUpdated = (callback: (slide: Slide) => void) => {
    socket.value?.on('slideUpdated', callback);
  };
  
  const onSlideDeleted = (callback: (id: number) => void) => {
    socket.value?.on('slideDeleted', callback);
  };
  
  const onCarouselNext = (callback: () => void) => {
    socket.value?.on('carousel:next', callback);
  };
  
  const onCarouselPrev = (callback: () => void) => {
    socket.value?.on('carousel:prev', callback);
  };
  
  const controlCarouselNext = () => {
    socket.value?.emit('carousel:next');
  };
  
  const controlCarouselPrev = () => {
    socket.value?.emit('carousel:prev');
  };
  
  const closeSocket = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
    }
  };
  
  return {
    initSocket,
    onSlideCreated,
    onSlideUpdated,
    onSlideDeleted,
    onCarouselNext,
    onCarouselPrev,
    controlCarouselNext,
    controlCarouselPrev,
    closeSocket
  };
};
