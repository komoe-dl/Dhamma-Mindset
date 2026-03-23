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
  category?: string;
  google_doc_link?: string;
  uploaded_by?: string;
  sadhu_count?: number;
  expand?: {
    uploaded_by?: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface Comment {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  text: string;
  user: string;
  book: string;
  expand?: {
    user: {
      id: string;
      name: string;
      email: string;
      role?: string;
    };
  };
}

export interface AuthState {
  isValid: boolean;
  model: any | null;
  token: string;
}
