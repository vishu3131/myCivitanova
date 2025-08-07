export interface NewsItem {
  id: string;
  title: string;
  description?: string;
  content?: string;
  type: 'urgent' | 'news' | 'event';
  status: 'draft' | 'published' | 'archived';
  author_id?: string;
  source?: string;
  image_url?: string;
  tags?: string[];
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  views_count: number;
  featured: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  
  // Relazioni
  author?: {
    id: string;
    display_name?: string;
    signupName?: string;
    signupSurname?: string;
    avatar?: string;
  };
}

export interface NewsComment {
  id: string;
  news_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  
  // Relazioni
  user?: {
    id: string;
    display_name?: string;
    signupName?: string;
    signupSurname?: string;
    avatar?: string;
  };
  replies?: NewsComment[];
}

export interface NewsReaction {
  id: string;
  news_id: string;
  user_id: string;
  reaction_type: 'like' | 'dislike';
  created_at: string;
}

export interface CreateNewsData {
  title: string;
  description?: string;
  content?: string;
  type: 'urgent' | 'news' | 'event';
  status?: 'draft' | 'published';
  source?: string;
  image_url?: string;
  tags?: string[];
  featured?: boolean;
  published_at?: string;
}

export interface UpdateNewsData extends Partial<CreateNewsData> {
  id: string;
}