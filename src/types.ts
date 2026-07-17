export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  type: 'audio' | 'video';
  url: string;
  fileName?: string;
  date: string;
}

export interface Wish {
  id: string;
  sender: string;
  message: string;
  date: string;
}
