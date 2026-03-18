export interface Book {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  title: string;
  author: string;
  summary: string;
  file: string;
  cover: string;
}

export interface AuthState {
  isValid: boolean;
  model: any | null;
  token: string;
}
