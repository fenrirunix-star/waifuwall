export interface Wallpaper {
  id: string;
  title: string;
  imageUrl: string;
  thumbnailUrl: string;
  category: string;
  subCategory?: string;
  resolution: string;
  views: number;
  downloads: number;
  likes: number;
  isPremium: boolean;
  createdAt: string;
  authorId: string;
  origin?: 'Standard' | 'Enterprise';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  wallpaperCount: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  isPremium: boolean;
  isAdmin: boolean;
  favorites: string[];
  premiumUntil?: string;
}
