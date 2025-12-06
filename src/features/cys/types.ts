export interface RequestCYS {
  id: string;
  name: string;
  contact: string;
  contactPlatform: string;
  reason: string;
  subReason?: string;
  otherDetail?: string;
  location: string;
  
  // New Time Logic
  isMultiDay: boolean;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  startTime: string; // HH:mm (empty if multi-day)
  endTime: string;   // HH:mm (empty if multi-day)
  
  // Legacy support for migration (optional in new logic)
  date?: string;
  time?: string;
}

export const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
export const REASONS = ["Work Interview", "Hangout", "Travel", "Sports", "Other"];
export const SPORT_TYPES = ["Football", "Basketball", "Gym", "Swimming", "Badminton", "Pickleball", "Running", "Other"];
