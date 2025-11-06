import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { EnvironmentService } from './environment.service';
import { 
  Review, 
  PropertyPerformance, 
  DashboardFilters, 
  DashboardStats, 
  TrendData,
  GoogleReview,
  PaginationInfo,
  DropdownData,
  DropdownOption,
  Channel,
  ChannelsResponse,
  Property,
  PropertiesResponse
} from '../models/review.models';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(EnvironmentService);
  
  private readonly reviews = new BehaviorSubject<Review[]>([]);
  public reviews$ = this.reviews.asObservable();

  private mockReviews: Review[] = [
    {
      id: 7453,
      type: 'host-to-guest',
      status: 'published',
      rating: null,
      publicReview: "Shane and family are wonderful! Would definitely host again :)",
      reviewCategory: [
        { category: 'cleanliness', rating: 10 },
        { category: 'communication', rating: 10 },
        { category: 'respect_house_rules', rating: 10 }
      ],
      submittedAt: '2024-08-21 22:45:14',
      guestName: 'Shane Finkelstein',
      listingName: '2B N1 A - 29 Shoreditch Heights',
      propertyId: 'prop_001',
      channel: 'airbnb',
      isSelectedForWebsite: true
    },
    {
      id: 7454,
      type: 'guest-to-host',
      status: 'pending',
      rating: 4,
      publicReview: "Great location and clean apartment. Host was very responsive. Minor issue with Wi-Fi but overall excellent stay.",
      reviewCategory: [
        { category: 'cleanliness', rating: 9 },
        { category: 'communication', rating: 10 },
        { category: 'location', rating: 10 },
        { category: 'wifi', rating: 6 }
      ],
      submittedAt: '2024-10-15 14:30:22',
      guestName: 'Emma Thompson',
      listingName: '1B S2 B - 15 Camden Lock',
      propertyId: 'prop_002',
      channel: 'booking',
      isSelectedForWebsite: false,
      flaggedIssues: ['wifi']
    },
    {
      id: 7455,
      type: 'guest-to-host',
      status: 'approved',
      rating: 5,
      publicReview: "Absolutely perfect! The apartment exceeded expectations. Everything was spotless and the host went above and beyond.",
      reviewCategory: [
        { category: 'cleanliness', rating: 10 },
        { category: 'communication', rating: 10 },
        { category: 'location', rating: 9 },
        { category: 'value', rating: 9 }
      ],
      submittedAt: '2024-10-20 09:15:33',
      guestName: 'Michael Chen',
      listingName: '3B E1 C - 42 Canary Wharf Tower',
      propertyId: 'prop_003',
      channel: 'direct',
      isSelectedForWebsite: true
    },
    {
      id: 7456,
      type: 'guest-to-host',
      status: 'published',
      rating: 2,
      publicReview: "Location was good but had several issues. Heating wasn't working properly and cleanliness was below standard.",
      reviewCategory: [
        { category: 'cleanliness', rating: 4 },
        { category: 'communication', rating: 8 },
        { category: 'location', rating: 9 },
        { category: 'heating', rating: 2 }
      ],
      submittedAt: '2024-09-28 16:45:11',
      guestName: 'Sarah Wilson',
      listingName: '2B N1 A - 29 Shoreditch Heights',
      propertyId: 'prop_001',
      channel: 'airbnb',
      isSelectedForWebsite: false,
      flaggedIssues: ['cleanliness', 'heating']
    },
    {
      id: 7457,
      type: 'guest-to-host',
      status: 'approved',
      rating: 4,
      publicReview: "Nice place in great location. Check-in was smooth and host was helpful. Would stay again!",
      reviewCategory: [
        { category: 'cleanliness', rating: 8 },
        { category: 'communication', rating: 9 },
        { category: 'location', rating: 10 },
        { category: 'checkin', rating: 9 }
      ],
      submittedAt: '2024-11-01 11:20:45',
      guestName: 'David Rodriguez',
      listingName: '1B S2 B - 15 Camden Lock',
      propertyId: 'prop_002',
      channel: 'google',
      isSelectedForWebsite: true
    }
  ];

  constructor() {
    this.reviews.next(this.mockReviews);
  }

  getReviews(filters?: DashboardFilters, page = 1, limit = 10): Observable<Review[]> {
    const url = `${this.env.apiUrl}/reviews`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    return this.http.get<any>(url, { params }).pipe(
      map(response => {
        if (response.success && response.data && response.data.reviews) {
          const reviews = response.data.reviews;
          // Update local state with fresh data
          this.reviews.next(reviews);
          // Apply filters if provided
          return filters ? this.applyFilters(reviews, filters) : reviews;
        }
        // Fallback to mock data if API fails
        const filteredMock = filters ? this.applyFilters(this.mockReviews, filters) : this.mockReviews;
        this.reviews.next(filteredMock);
        return filteredMock;
      }),
      catchError((error) => {
        console.warn('Failed to fetch reviews from API, using mock data:', error);
        const filteredMock = filters ? this.applyFilters(this.mockReviews, filters) : this.mockReviews;
        this.reviews.next(filteredMock);
        return of(filteredMock);
      })
    );
  }

  // New method to get paginated reviews with full response
  // New method specifically for public reviews (published only)
  getPublishedReviews(page = 1, limit = 10): Observable<{reviews: Review[], pagination: PaginationInfo}> {
    const url = `${this.env.apiUrl}/reviews`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('status', 'published');
    
    return this.http.get<any>(url, { params }).pipe(
      map(response => {
        if (response.success && response.data) {
          return {
            reviews: response.data.reviews,
            pagination: response.data.pagination
          };
        }
        // Fallback to mock published reviews
        const publishedMockReviews = this.mockReviews.filter(r => r.status === 'published');
        return {
          reviews: publishedMockReviews,
          pagination: {
            page: 1,
            limit: 10,
            total: publishedMockReviews.length,
            pages: 1,
            hasNext: false,
            hasPrev: false
          }
        };
      }),
      catchError((error) => {
        console.warn('Failed to fetch published reviews from API, using mock data:', error);
        const publishedMockReviews = this.mockReviews.filter(r => r.status === 'published');
        return of({
          reviews: publishedMockReviews,
          pagination: {
            page: 1,
            limit: 10,
            total: publishedMockReviews.length,
            pages: 1,
            hasNext: false,
            hasPrev: false
          }
        });
      })
    );
  }

  getReviewsPaginated(page = 1, limit = 10, filters?: DashboardFilters): Observable<{reviews: Review[], pagination: PaginationInfo}> {
    const url = `${this.env.apiUrl}/reviews`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    return this.http.get<any>(url, { params }).pipe(
      map(response => {
        if (response.success && response.data) {
          let reviews = response.data.reviews;
          // Apply filters if provided
          if (filters) {
            reviews = this.applyFilters(reviews, filters);
          }
          return {
            reviews,
            pagination: response.data.pagination
          };
        }
        // Fallback to mock data
        const mockReviews = filters ? this.applyFilters(this.mockReviews, filters) : this.mockReviews;
        return {
          reviews: mockReviews,
          pagination: {
            page: 1,
            limit: 10,
            total: mockReviews.length,
            pages: 1,
            hasNext: false,
            hasPrev: false
          }
        };
      }),
      catchError((error) => {
        console.warn('Failed to fetch paginated reviews from API, using mock data:', error);
        const mockReviews = filters ? this.applyFilters(this.mockReviews, filters) : this.mockReviews;
        return of({
          reviews: mockReviews,
          pagination: {
            page: 1,
            limit: 10,
            total: mockReviews.length,
            pages: 1,
            hasNext: false,
            hasPrev: false
          }
        });
      })
    );
  }

  getPropertyPerformance(): Observable<PropertyPerformance[]> {
    const performance: PropertyPerformance[] = [
      {
        propertyId: 'prop_001',
        propertyName: '2B N1 A - 29 Shoreditch Heights',
        averageRating: 4.0,
        totalReviews: 15,
        reviewsByChannel: { 'airbnb': 8, 'booking': 4, 'direct': 3 },
        categoryAverages: { 
          'cleanliness': 7.5, 
          'communication': 9.2, 
          'location': 9.8,
          'wifi': 6.5
        },
        recentTrend: 'down',
        flaggedIssuesCount: 3,
        selectedForWebsiteCount: 8
      },
      {
        propertyId: 'prop_002',
        propertyName: '1B S2 B - 15 Camden Lock',
        averageRating: 4.5,
        totalReviews: 22,
        reviewsByChannel: { 'airbnb': 10, 'booking': 8, 'direct': 2, 'google': 2 },
        categoryAverages: { 
          'cleanliness': 8.8, 
          'communication': 9.5, 
          'location': 9.9,
          'value': 8.5
        },
        recentTrend: 'up',
        flaggedIssuesCount: 1,
        selectedForWebsiteCount: 18
      },
      {
        propertyId: 'prop_003',
        propertyName: '3B E1 C - 42 Canary Wharf Tower',
        averageRating: 4.8,
        totalReviews: 18,
        reviewsByChannel: { 'airbnb': 12, 'booking': 4, 'direct': 2 },
        categoryAverages: { 
          'cleanliness': 9.5, 
          'communication': 9.8, 
          'location': 9.2,
          'value': 9.0
        },
        recentTrend: 'stable',
        flaggedIssuesCount: 0,
        selectedForWebsiteCount: 16
      }
    ];

    return of(performance).pipe(delay(200));
  }

  getDashboardStats(): Observable<DashboardStats> {
    const url = `${this.env.apiUrl}/reviews/stats`;
    
    return this.http.get<any>(url).pipe(
      map(response => {
        if (response.success && response.data) {
          // Transform API response to match DashboardStats interface
          const apiData = response.data;
          const stats: DashboardStats = {
            totalReviews: apiData.total,
            averageRating: 4.4, // Calculate from reviews or get from another endpoint
            pendingReviews: apiData.byStatus.pending,
            publishedReviews: apiData.byStatus.published,
            approvedReviews: apiData.byStatus.approved,
            flaggedIssues: 0, // Calculate from reviews or get from another endpoint
            propertiesCount: 3, // Get from another endpoint or calculate
            lastSync: apiData.lastSync
          };
          return stats;
        }
        // Fallback to mock data if API fails
        return this.getMockDashboardStats();
      }),
      catchError((error) => {
        // Return mock data on error
        console.warn('Failed to fetch dashboard stats from API, using mock data:', error);
        return of(this.getMockDashboardStats());
      })
    );
  }

  // Get individual review by ID
  getReviewById(id: number): Observable<Review> {
    const url = `${this.env.apiUrl}/reviews/${id}`;
    
    return this.http.get<any>(url).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        // Fallback to mock data
        const mockReview = this.mockReviews.find(r => r.id === id);
        if (mockReview) {
          return mockReview;
        }
        throw new Error('Review not found');
      }),
      catchError((error) => {
        console.warn('Failed to fetch review from API, using mock data:', error);
        const mockReview = this.mockReviews.find(r => r.id === id);
        if (mockReview) {
          return of(mockReview);
        }
        throw error;
      })
    );
  }

  private getMockDashboardStats(): DashboardStats {
    return {
      totalReviews: 55,
      averageRating: 4.4,
      pendingReviews: 8,
      publishedReviews: 42,
      flaggedIssues: 4,
      propertiesCount: 3
    };
  }

  getTrendData(): Observable<TrendData[]> {
    const trends: TrendData[] = [
      { period: '2024-08', rating: 4.2, reviewCount: 12, flaggedCount: 2 },
      { period: '2024-09', rating: 4.1, reviewCount: 15, flaggedCount: 3 },
      { period: '2024-10', rating: 4.6, reviewCount: 18, flaggedCount: 1 },
      { period: '2024-11', rating: 4.5, reviewCount: 10, flaggedCount: 1 }
    ];

    return of(trends).pipe(delay(250));
  }

  updateReviewStatus(reviewId: number, status: string): Observable<Review> {
    const reviews = this.reviews.value;
    const reviewIndex = reviews.findIndex((r: Review) => r.id === reviewId);
    
    if (reviewIndex !== -1) {
      reviews[reviewIndex] = { ...reviews[reviewIndex], status };
      this.reviews.next([...reviews]);
      return of(reviews[reviewIndex]).pipe(delay(100));
    }
    
    throw new Error('Review not found');
  }

  // New API methods for status updates
  approveReview(reviewId: number): Observable<any> {
    const url = `${this.env.apiUrl}/reviews/${reviewId}/approve`;
    
    return this.http.patch<any>(url, {}).pipe(
      map(response => {
        if (response.success) {
          // Update local state if successful
          this.updateLocalReviewStatus(reviewId, 'approved');
          return response;
        }
        throw new Error(response.message || 'Failed to approve review');
      }),
      catchError((error) => {
        console.error('Failed to approve review:', error);
        // Fallback to local update for development
        this.updateLocalReviewStatus(reviewId, 'approved');
        return of({ success: true, message: 'Review approved (offline mode)' });
      })
    );
  }

  publishReview(reviewId: number): Observable<any> {
    const url = `${this.env.apiUrl}/reviews/${reviewId}/publish`;
    
    return this.http.patch<any>(url, {}).pipe(
      map(response => {
        if (response.success) {
          // Update local state if successful
          this.updateLocalReviewStatus(reviewId, 'published');
          return response;
        }
        throw new Error(response.message || 'Failed to publish review');
      }),
      catchError((error) => {
        console.error('Failed to publish review:', error);
        // Fallback to local update for development
        this.updateLocalReviewStatus(reviewId, 'published');
        return of({ success: true, message: 'Review published (offline mode)' });
      })
    );
  }

  rejectReview(reviewId: number): Observable<any> {
    const url = `${this.env.apiUrl}/reviews/${reviewId}/reject`;
    
    return this.http.patch<any>(url, {}).pipe(
      map(response => {
        if (response.success) {
          // Update local state if successful
          this.updateLocalReviewStatus(reviewId, 'rejected');
          return response;
        }
        throw new Error(response.message || 'Failed to reject review');
      }),
      catchError((error) => {
        console.error('Failed to reject review:', error);
        // Fallback to local update for development
        this.updateLocalReviewStatus(reviewId, 'rejected');
        return of({ success: true, message: 'Review rejected (offline mode)' });
      })
    );
  }

  private updateLocalReviewStatus(reviewId: number, status: Review['status']): void {
    const reviews = this.reviews.value;
    const reviewIndex = reviews.findIndex((r: Review) => r.id === reviewId);
    
    if (reviewIndex !== -1) {
      reviews[reviewIndex] = { ...reviews[reviewIndex], status };
      this.reviews.next([...reviews]);
    }
  }

  // Get dropdown data for form fields
  getDropdownData(): Observable<DropdownData> {
    const url = `${this.env.apiUrl}/form/dropdowns`;
    
    return this.http.get<any>(url).pipe(
      map(response => {
        if (response.status === 'success' && response.data) {
          return response.data;
        }
        // Fallback to mock data
        return this.getMockDropdownData();
      }),
      catchError((error) => {
        console.warn('Failed to fetch dropdown data from API, using mock data:', error);
        return of(this.getMockDropdownData());
      })
    );
  }

  private getMockDropdownData(): DropdownData {
    return {
      statuses: [
        {
          value: 'pending',
          label: 'Pending Review',
          description: 'Review is awaiting manager approval',
          color: '#ff9800',
          icon: 'schedule',
          sortOrder: 1,
          isActive: true,
          permissions: ['view', 'update']
        },
        {
          value: 'approved',
          label: 'Approved',
          description: 'Review has been approved by manager',
          color: '#2196f3',
          icon: 'check_circle',
          sortOrder: 2,
          isActive: true,
          permissions: ['view', 'update', 'publish']
        },
        {
          value: 'published',
          label: 'Published',
          description: 'Review is live on the website',
          color: '#4caf50',
          icon: 'visibility',
          sortOrder: 3,
          isActive: true,
          permissions: ['view', 'unpublish']
        },
        {
          value: 'rejected',
          label: 'Rejected',
          description: 'Review has been rejected',
          color: '#f44336',
          icon: 'cancel',
          sortOrder: 4,
          isActive: true,
          permissions: ['view', 'reapprove']
        }
      ],
      metadata: {
        totalCount: 4,
        activeCount: 4,
        lastUpdated: new Date().toISOString()
      }
    };
  }

  getChannels(): Observable<Channel[]> {
    const url = `${this.env.apiUrl}/channels`;
    
    return this.http.get<ChannelsResponse>(url).pipe(
      map(response => response?.data?.channels || []),
      catchError(error => {
        console.error('Error fetching channels data:', error);
        // Return mock data as fallback
        return of([
          { value: 'airbnb', label: 'Airbnb', count: 0, lastReview: '', isActive: true },
          { value: 'booking', label: 'Booking.com', count: 0, lastReview: '', isActive: true },
          { value: 'direct', label: 'Direct', count: 0, lastReview: '', isActive: true },
          { value: 'google', label: 'Google', count: 0, lastReview: '', isActive: true }
        ]);
      })
    );
  }

  getProperties(): Observable<Property[]> {
    const url = `${this.env.apiUrl}/properties`;
    
    return this.http.get<PropertiesResponse>(url).pipe(
      map(response => response?.data?.properties || []),
      catchError(error => {
        console.error('Error fetching properties data:', error);
        // Return mock data as fallback
        return of([
          { value: 'prop1', label: 'Property 1', count: 0, channels: [], averageRating: 0, lastReview: '', isActive: true },
          { value: 'prop2', label: 'Property 2', count: 0, channels: [], averageRating: 0, lastReview: '', isActive: true }
        ]);
      })
    );
  }

  toggleWebsiteSelection(reviewId: number): Observable<Review> {
    const reviews = this.reviews.value;
    const reviewIndex = reviews.findIndex((r: Review) => r.id === reviewId);
    
    if (reviewIndex !== -1) {
      reviews[reviewIndex] = { 
        ...reviews[reviewIndex], 
        isSelectedForWebsite: !reviews[reviewIndex].isSelectedForWebsite 
      };
      this.reviews.next([...reviews]);
      return of(reviews[reviewIndex]).pipe(delay(100));
    }
    
    throw new Error('Review not found');
  }

  getGoogleReviews(placeId: string): Observable<GoogleReview[]> {
    // Mock Google Reviews data
    const googleReviews: GoogleReview[] = [
      {
        author_name: 'John Smith',
        author_url: 'https://www.google.com/maps/contrib/123',
        language: 'en',
        profile_photo_url: 'https://via.placeholder.com/40',
        rating: 5,
        relative_time_description: '2 weeks ago',
        text: 'Excellent service and beautiful property. Highly recommend!',
        time: 1699123200
      },
      {
        author_name: 'Lisa Johnson',
        author_url: 'https://www.google.com/maps/contrib/456',
        language: 'en',
        profile_photo_url: 'https://via.placeholder.com/40',
        rating: 4,
        relative_time_description: '1 month ago',
        text: 'Great location and clean facilities. Minor issues with parking.',
        time: 1696531200
      }
    ];

    return of(googleReviews).pipe(delay(400));
  }

  private applyFilters(reviews: Review[], filters?: DashboardFilters): Review[] {
    if (!filters) return reviews;

    return reviews.filter(review => {
      // Property filter
      if (filters.propertyId && review.propertyId !== filters.propertyId) {
        return false;
      }

      // Rating filter
      if (filters.rating && review.rating) {
        if (review.rating < filters.rating.min || review.rating > filters.rating.max) {
          return false;
        }
      }

      // Category filter
      if (filters.category) {
        const hasCategory = review.reviewCategory.some(cat => 
          cat.category.toLowerCase().includes(filters.category!.toLowerCase())
        );
        if (!hasCategory) return false;
      }

      // Channel filter
      if (filters.channel && review.channel !== filters.channel) {
        return false;
      }

      // Status filter
      if (filters.status && review.status !== filters.status) {
        return false;
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          review.publicReview.toLowerCase().includes(searchLower) ||
          review.guestName.toLowerCase().includes(searchLower) ||
          review.listingName.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const reviewDate = new Date(review.submittedAt);
        if (filters.dateRange.start && reviewDate < filters.dateRange.start) {
          return false;
        }
        if (filters.dateRange.end && reviewDate > filters.dateRange.end) {
          return false;
        }
      }

      return true;
    });
  }
}