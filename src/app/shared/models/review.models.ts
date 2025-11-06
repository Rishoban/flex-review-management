export interface ReviewCategory {
  category: string;
  rating: number;
}

export interface Review {
  id: number;
  type: 'host-to-guest' | 'guest-to-host';
  status: 'published' | 'pending' | 'approved' | 'rejected';
  rating: number | null;
  publicReview: string;
  reviewCategory: ReviewCategory[];
  submittedAt: string;
  guestName: string;
  listingName: string;
  propertyId?: string;
  channel?: 'airbnb' | 'booking' | 'direct' | 'google';
  isSelectedForWebsite?: boolean;
  flaggedIssues?: string[];
}

export interface GoogleReview {
  author_name: string;
  author_url: string;
  language: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

export interface PropertyPerformance {
  propertyId: string;
  propertyName: string;
  averageRating: number;
  totalReviews: number;
  reviewsByChannel: { [key: string]: number };
  categoryAverages: { [key: string]: number };
  recentTrend: 'up' | 'down' | 'stable';
  flaggedIssuesCount: number;
  selectedForWebsiteCount: number;
}

export interface DashboardFilters {
  propertyId?: string;
  rating?: { min: number; max: number };
  category?: string;
  channel?: string;
  dateRange?: { start: Date; end: Date };
  status?: string;
  searchTerm?: string;
}

export interface DashboardStats {
  totalReviews: number;
  averageRating: number;
  pendingReviews: number;
  publishedReviews: number;
  flaggedIssues: number;
  propertiesCount: number;
}

export interface TrendData {
  period: string;
  rating: number;
  reviewCount: number;
  flaggedCount: number;
}