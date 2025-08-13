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


export interface Mission {
  id: string;
  name: string;
  title: string;
  description: string;
  xp_reward: number;
  is_active: boolean;
  created_at: string;
  activity_type_required?: string; // e.g., 'daily_login', 'location_visit'
  activity_value_required?: number; // e.g., 1 for daily_login, 5 for location_visit
  completion_count?: number; // How many times this mission can be completed
  current_completions?: number; // How many times user has completed this mission
}