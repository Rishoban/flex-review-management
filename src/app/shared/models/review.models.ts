export interface ReviewCategory {
  category: string;
  rating: number;
}

export interface Review {
  id: number;
  type: 'host-to-guest' | 'guest-to-host';
  status: string;
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
  dateRange?: { start?: Date; end?: Date };
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
  approvedReviews?: number;
  lastSync?: string;
}

export interface ApiStatsResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    byStatus: {
      published: number;
      pending: number;
      approved: number;
    };
    lastSync: string;
  };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiReviewsResponse {
  success: boolean;
  message: string;
  data: {
    reviews: Review[];
    pagination: PaginationInfo;
  };
}

export interface TrendData {
  period: string;
  rating: number;
  reviewCount: number;
  flaggedCount: number;
}

// Dropdown API interfaces
export interface DropdownOption {
  value: string;
  label: string;
  description: string;
  color: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  permissions: string[];
}

export interface DropdownData {
  statuses: DropdownOption[];
  metadata: {
    totalCount: number;
    activeCount: number;
    lastUpdated: string;
  };
}

// Properties API interfaces
export interface Property {
  value: string;
  label: string;
  count: number;
  channels: string[];
  averageRating: number;
  lastReview: string;
  isActive: boolean;
}

export interface PropertiesResponse {
  status: string;
  data: {
    properties: Property[];
    totalProperties: number;
    totalReviews: number;
    lastUpdated: string;
  };
}

// Channels API interfaces
export interface Channel {
  value: string;
  label: string;
  count: number;
  lastReview: string;
  isActive: boolean;
}

export interface ChannelsResponse {
  status: string;
  data: {
    channels: Channel[];
    totalChannels: number;
    totalReviews: number;
    lastUpdated: string;
  };
}