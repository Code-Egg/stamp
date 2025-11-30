export interface StampData {
  id: string;
  timestamp: number;
  behavior: string;
  praise: string;
  emoji: string;
}

export interface KidProfile {
  id: string;
  name: string;
  totalStamps: number; // Current active stamps
  targetStamps: number;
  history: StampData[]; // All stamps ever received
}

export interface AIResponse {
  approved: boolean;
  praise: string;
  emoji: string;
}