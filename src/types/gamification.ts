export interface GamificationRule {
  id: string;
  name: string;
  description: string;
  points: number;
  condition: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}