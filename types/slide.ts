// types/slide.ts
export interface Slide {
  id: number;
  image: string;
  rating: number;
  review: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export type NewSlide = Omit<Slide, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSlide = Partial<NewSlide>;
