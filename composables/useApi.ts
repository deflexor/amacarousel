// composables/useApi.ts
import { Slide, NewSlide, UpdateSlide } from '~/types/slide';

export const useApi = () => {
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiBaseUrl;

  const fetchSlides = async (): Promise<Slide[]> => {
    try {
      const response = await fetch(`${baseUrl}/api/slides`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching slides:', error);
      return [];
    }
  };

  const createSlide = async (slide: NewSlide): Promise<Slide | null> => {
    try {
      const response = await fetch(`${baseUrl}/api/slides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(slide)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating slide:', error);
      return null;
    }
  };

  const updateSlide = async (id: number, slide: UpdateSlide): Promise<Slide | null> => {
    try {
      const response = await fetch(`${baseUrl}/api/slides/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(slide)
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating slide:', error);
      return null;
    }
  };

  const deleteSlide = async (id: number): Promise<boolean> => {
    try {
      await fetch(`${baseUrl}/api/slides/${id}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Error deleting slide:', error);
      return false;
    }
  };

  return {
    fetchSlides,
    createSlide,
    updateSlide,
    deleteSlide
  };
};
