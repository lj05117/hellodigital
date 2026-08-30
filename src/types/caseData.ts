export type PhotoItem = {
  id: number;
  title: string;
  accent: string;
};

export type CaseItem = {
  id: number;
  category: string;
  description: string;
  photos: PhotoItem[];
};
