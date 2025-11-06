import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { 
  Review, 
  PropertyPerformance, 
  DashboardFilters, 
  DashboardStats, 
  TrendData,
  GoogleReview 
} from '../models/review.models';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private reviewsSubject = new BehaviorSubject<Review[]>([]);
  public reviews$ = this.reviewsSubject.asObservable();

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
    this.reviewsSubject.next(this.mockReviews);
  }

  getReviews(filters?: DashboardFilters): Observable<Review[]> {
    return of(this.mockReviews).pipe(
      map(reviews => this.applyFilters(reviews, filters)),
      delay(300) // Simulate API call
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
    const stats: DashboardStats = {
      totalReviews: 55,
      averageRating: 4.4,
      pendingReviews: 8,
      publishedReviews: 42,
      flaggedIssues: 4,
      propertiesCount: 3
    };

    return of(stats).pipe(delay(150));
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

  updateReviewStatus(reviewId: number, status: Review['status']): Observable<Review> {
    const reviews = this.reviewsSubject.value;
    const reviewIndex = reviews.findIndex(r => r.id === reviewId);
    
    if (reviewIndex !== -1) {
      reviews[reviewIndex] = { ...reviews[reviewIndex], status };
      this.reviewsSubject.next([...reviews]);
      return of(reviews[reviewIndex]).pipe(delay(100));
    }
    
    throw new Error('Review not found');
  }

  toggleWebsiteSelection(reviewId: number): Observable<Review> {
    const reviews = this.reviewsSubject.value;
    const reviewIndex = reviews.findIndex(r => r.id === reviewIndex);
    
    if (reviewIndex !== -1) {
      reviews[reviewIndex] = { 
        ...reviews[reviewIndex], 
        isSelectedForWebsite: !reviews[reviewIndex].isSelectedForWebsite 
      };
      this.reviewsSubject.next([...reviews]);
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
        if (reviewDate < filters.dateRange.start || reviewDate > filters.dateRange.end) {
          return false;
        }
      }

      return true;
    });
  }
}