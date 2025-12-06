export interface DiaryEntry {
  id: string;
  content: string;
  mediaType: 'image' | 'video' | 'none';
  mediaUrl: string; // Blob URL
  likes: number;
  date: string;
}