import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReviewService } from '../../shared/services/review.service';
import { Review } from '../../shared/models/review.models';

@Component({
  selector: 'app-reviews-display',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  template: `
    <div class="flex-living-page">
      <!-- Header Navigation -->
      <header class="site-header">
        <div class="header-content">
          <div class="logo">
            <h1>Flex Living</h1>
          </div>
          <nav class="nav-menu">
            <a href="#" class="nav-link">Properties</a>
            <a href="#" class="nav-link active">Reviews</a>
            <a href="#" class="nav-link">About</a>
            <a href="#" class="nav-link">Contact</a>
          </nav>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h1>What Our Residents Say</h1>
            <p class="hero-subtitle">Authentic reviews from people who call Flex Living home</p>
            <div class="hero-stats">
              <div class="stat">
                <span class="stat-number">{{totalReviews()}}</span>
                <span class="stat-label">Total Reviews</span>
              </div>
              <div class="stat">
                <span class="stat-number">{{averageRating()}}</span>
                <span class="stat-label">Average Rating</span>
              </div>
              <div class="stat">
                <span class="stat-number">{{totalProperties()}}</span>
                <span class="stat-label">Properties</span>
              </div>
            </div>
          </div>
          <div class="hero-image">
            <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Flex Living Community" />
          </div>
        </div>
      </section>

      <!-- Filters Section -->
      <section class="filters-section">
        <div class="filters-content">
          <h2>Filter Reviews</h2>
          <div class="filters-row">
            <mat-form-field appearance="outline">
              <mat-label>Property</mat-label>
              <mat-select [value]="selectedProperty()" (selectionChange)="onPropertyChange($event.value)">
                <mat-option value="">All Properties</mat-option>
                @for (property of properties(); track property.id) {
                  <mat-option [value]="property.id">{{ property.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Rating</mat-label>
              <mat-select [value]="selectedRating()" (selectionChange)="onRatingChange($event.value)">
                <mat-option value="">All Ratings</mat-option>
                <mat-option value="5">5 Stars</mat-option>
                <mat-option value="4">4+ Stars</mat-option>
                <mat-option value="3">3+ Stars</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Review Type</mat-label>
              <mat-select [value]="selectedChannel()" (selectionChange)="onChannelChange($event.value)">
                <mat-option value="">All Sources</mat-option>
                <mat-option value="airbnb">Airbnb</mat-option>
                <mat-option value="booking">Booking.com</mat-option>
                <mat-option value="direct">Direct Booking</mat-option>
                <mat-option value="google">Google Reviews</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-stroked-button (click)="clearFilters()" class="clear-btn">
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      <!-- Reviews Grid -->
      <section class="reviews-section">
        <div class="reviews-content">
          <div class="section-header">
            <h2>Guest Reviews ({{filteredReviews().length}})</h2>
            <p>All reviews are verified and come from actual guests</p>
          </div>

          <div class="reviews-grid">
            @for (review of displayedReviews(); track review.id) {
              <mat-card class="review-card">
                <mat-card-content>
                  <div class="review-header">
                    <div class="reviewer-info">
                      <div class="avatar">
                        {{getInitials(review.guestName)}}
                      </div>
                      <div class="reviewer-details">
                        <h4>{{review.guestName}}</h4>
                        <p class="stay-date">{{formatDate(review.submittedAt)}}</p>
                        <p class="property-name">{{getPropertyName(review.propertyId)}}</p>
                      </div>
                    </div>
                    <div class="rating-display">
                      <div class="stars">
                        @for (star of getStars(review.rating || 0); track $index) {
                          <mat-icon>star</mat-icon>
                        }
                        @for (star of getEmptyStars(review.rating || 0); track $index) {
                          <mat-icon class="empty">star_border</mat-icon>
                        }
                      </div>
                      <span class="rating-text">{{review.rating}}/5</span>
                    </div>
                  </div>

                  <div class="review-content">
                    <p>{{review.publicReview}}</p>
                  </div>

                  @if (review.reviewCategory && review.reviewCategory.length > 0) {
                    <div class="review-categories">
                      @for (category of review.reviewCategory; track category.category) {
                        <mat-chip class="category-chip">
                          {{category.category}}: {{category.rating}}/10
                        </mat-chip>
                      }
                    </div>
                  }

                  <div class="review-footer">
                    <div class="source-info">
                      <mat-icon class="source-icon">{{getChannelIcon(review.channel)}}</mat-icon>
                      <span>{{getChannelName(review.channel)}}</span>
                    </div>
                    <div class="verified-badge">
                      <mat-icon>verified</mat-icon>
                      <span>Verified Stay</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            }
          </div>

          @if (hasMoreReviews()) {
            <div class="load-more">
              <button mat-raised-button color="primary" (click)="loadMoreReviews()">
                Load More Reviews
              </button>
            </div>
          }

          @if (filteredReviews().length === 0) {
            <div class="no-reviews">
              <mat-icon>rate_review</mat-icon>
              <h3>No reviews found</h3>
              <p>Try adjusting your filters to see more reviews</p>
            </div>
          }
        </div>
      </section>

      <!-- Trust Section -->
      <section class="trust-section">
        <div class="trust-content">
          <h2>Why Trust Our Reviews?</h2>
          <div class="trust-features">
            <div class="trust-feature">
              <mat-icon>verified_user</mat-icon>
              <h3>Verified Guests Only</h3>
              <p>All reviews come from guests who have actually stayed at our properties</p>
            </div>
            <div class="trust-feature">
              <mat-icon>security</mat-icon>
              <h3>Moderated Content</h3>
              <p>Our team reviews all submissions to ensure authentic, helpful feedback</p>
            </div>
            <div class="trust-feature">
              <mat-icon>star_rate</mat-icon>
              <h3>Transparent Ratings</h3>
              <p>We display all approved reviews, both positive and constructive feedback</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="cta-content">
          <h2>Ready to Experience Flex Living?</h2>
          <p>Join thousands of satisfied guests who have made Flex Living their home away from home</p>
          
        </div>
      </section>

      <!-- Footer -->
      <footer class="site-footer">
        <div class="footer-content">
          <div class="footer-section">
            <h3>Flex Living</h3>
            <p>Premium short-term rentals with the comfort of home</p>
          </div>
          <div class="footer-section">
            <h4>Quick Links</h4>
            <a href="#">Properties</a>
            <a href="#">Reviews</a>
            <a href="#">About Us</a>
            <a href="#">Contact</a>
          </div>
          <div class="footer-section">
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Host Resources</a>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 Flex Living. All rights reserved.</p>
        </div>
      </footer>
    </div>
  `,
  styleUrl: './reviews-display.component.css'
})
export class ReviewsDisplayComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reviewService = inject(ReviewService);

  allReviews = signal<Review[]>([]);
  displayedReviews = signal<Review[]>([]);
  properties = signal<any[]>([]);
  
  // Filter signals
  selectedProperty = signal<string>('');
  selectedRating = signal<string>('');
  selectedChannel = signal<string>('');
  
  // Pagination
  reviewsPerPage = 12;
  currentPage = 0;

  // Computed values
  filteredReviews = computed(() => {
    let reviews = this.allReviews();

    // Filter by property
    if (this.selectedProperty()) {
      reviews = reviews.filter(r => r.propertyId === this.selectedProperty());
    }

    // Filter by rating
    if (this.selectedRating()) {
      const minRating = parseInt(this.selectedRating());
      reviews = reviews.filter(r => (r.rating || 0) >= minRating);
    }

    // Filter by channel
    if (this.selectedChannel()) {
      reviews = reviews.filter(r => r.channel === this.selectedChannel());
    }

    return reviews.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  });

  totalReviews = computed(() => this.allReviews().length);
  averageRating = computed(() => {
    const reviews = this.allReviews();
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  });
  totalProperties = computed(() => {
    const uniqueProps = new Set(this.allReviews().map(r => r.propertyId));
    return uniqueProps.size;
  });

  hasMoreReviews = computed(() => 
    this.displayedReviews().length < this.filteredReviews().length
  );

  ngOnInit() {
    this.loadReviews();
    this.loadProperties();
  }

  loadReviews() {
    this.reviewService.getReviews().subscribe(reviews => {
      // Only show published reviews that are selected for website
      const publicReviews = reviews.filter(review => 
        review.status === 'published' && 
        review.isSelectedForWebsite === true
      );
      
      this.allReviews.set(publicReviews);
      this.resetPagination();
    });
  }

  loadProperties() {
    // Mock property data - in real app, this would come from a property service
    const props = [
      { id: 'prop_001', name: '2B N1 A - 29 Shoreditch Heights' },
      { id: 'prop_002', name: '1B S2 B - 15 Camden Lock' },
      { id: 'prop_003', name: '2B W3 C - 42 Notting Hill Gate' }
    ];
    this.properties.set(props);
  }

  onPropertyChange(value: string) {
    this.selectedProperty.set(value);
    this.resetPagination();
  }

  onRatingChange(value: string) {
    this.selectedRating.set(value);
    this.resetPagination();
  }

  onChannelChange(value: string) {
    this.selectedChannel.set(value);
    this.resetPagination();
  }

  clearFilters() {
    this.selectedProperty.set('');
    this.selectedRating.set('');
    this.selectedChannel.set('');
    this.resetPagination();
  }

  resetPagination() {
    this.currentPage = 0;
    this.displayedReviews.set([]);
    this.loadMoreReviews();
  }

  loadMoreReviews() {
    const start = this.currentPage * this.reviewsPerPage;
    const end = start + this.reviewsPerPage;
    const newReviews = this.filteredReviews().slice(start, end);
    
    this.displayedReviews.update(current => [...current, ...newReviews]);
    this.currentPage++;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }

  getPropertyName(propertyId?: string): string {
    const property = this.properties().find(p => p.id === propertyId);
    return property?.name || 'Flex Living Property';
  }

  getChannelIcon(channel?: string): string {
    const icons: { [key: string]: string } = {
      'airbnb': 'home',
      'booking': 'hotel',
      'direct': 'business',
      'google': 'star'
    };
    return icons[channel || 'direct'] || 'business';
  }

  getChannelName(channel?: string): string {
    const names: { [key: string]: string } = {
      'airbnb': 'Airbnb',
      'booking': 'Booking.com',
      'direct': 'Direct Booking',
      'google': 'Google Reviews'
    };
    return names[channel || 'direct'] || 'Direct Booking';
  }
}