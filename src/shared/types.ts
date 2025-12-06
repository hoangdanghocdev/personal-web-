export type Tab = 'PORTFOLIO' | 'DIARY' | 'FAV' | 'CYS' | 'SIGNIN';

export interface UserAction {
  likedItems: string[]; 
  lastRequestTime: number; 
}

export interface BusyData {
  [date: string]: string[]; 
}