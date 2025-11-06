import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { ReviewService } from '../../shared/services/review.service';
import { Review } from '../../shared/models/review.models';

@Component({
  selector: 'app-property-display',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <div class="property-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1>{{property()?.name}}</h1>
          <p class="location">{{property()?.location}}</p>
          <div class="rating-summary">
            <div class="stars">
              <mat-icon>star</mat-icon>
              <span class="rating">{{property()?.rating}}</span>
              <span class="total">({{totalReviews()}} reviews)</span>
            </div>
          </div>
        </div>
        <div class="hero-image">
          <img [src]="property()?.imageUrl" [alt]="property()?.name" />
        </div>
      </section>

      <!-- Reviews Section -->
      <section class="reviews-section">
        <div class="section-header">
          <h2>What Our Residents Say</h2>
          <p>Authentic reviews from people who call {{property()?.name}} home</p>
        </div>

        <div class="reviews-grid">
          <mat-card class="review-card" *ngFor="let review of displayedReviews()">
            <mat-card-content>
              <div class="review-header">
                <div class="reviewer-info">
                  <div class="avatar">
                    {{getInitials(review.guestName)}}
                  </div>
                  <div class="details">
                    <h4>{{review.guestName}}</h4>
                    <p class="date">{{formatDate(review.submittedAt)}}</p>
                  </div>
                </div>
                <div class="rating">
                  <div class="stars">
                    <mat-icon *ngFor="let star of getStars(review.rating || 0)">star</mat-icon>
                  </div>
                  <span class="rating-text">{{review.rating}}/5</span>
                </div>
              </div>

              <div class="review-content">
                <p>{{review.publicReview}}</p>
              </div>

              <div class="review-footer" *ngIf="review.reviewCategory && review.reviewCategory.length > 0">
                <mat-chip-set>
                  <mat-chip *ngFor="let cat of review.reviewCategory">{{cat.category}}</mat-chip>
                  <mat-chip *ngIf="review.channel">{{review.channel}}</mat-chip>
                </mat-chip-set>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="load-more" *ngIf="hasMoreReviews()">
          <button mat-raised-button color="primary" (click)="loadMoreReviews()">
            Load More Reviews
          </button>
        </div>
      </section>

      <!-- Trust Badges -->
      <section class="trust-section">
        <div class="trust-content">
          <h3>Verified Reviews</h3>
          <p>All reviews are verified and come from actual residents</p>
          <div class="badges">
            <div class="badge">
              <mat-icon>verified</mat-icon>
              <span>Verified Residents</span>
            </div>
            <div class="badge">
              <mat-icon>security</mat-icon>
              <span>Secure Platform</span>
            </div>
            <div class="badge">
              <mat-icon>fact_check</mat-icon>
              <span>Fact Checked</span>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="cta-content">
          <h2>Ready to Make {{property()?.name}} Your Home?</h2>
          <p>Join our community of satisfied residents</p>
          <div class="cta-buttons">
            <button mat-raised-button color="primary" class="primary-cta">
              Schedule a Tour
            </button>
            <button mat-outlined-button class="secondary-cta">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  `,
  styleUrl: './property-display.component.css'
})
export class PropertyDisplayComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reviewService = inject(ReviewService);

  property = signal<any>(null);
  allReviews = signal<Review[]>([]);
  displayedReviews = signal<Review[]>([]);
  reviewsPerPage = 6;
  currentPage = 0;

  totalReviews = computed(() => this.allReviews().length);
  hasMoreReviews = computed(() => 
    this.displayedReviews().length < this.allReviews().length
  );

  ngOnInit() {
    const propertyId = this.route.snapshot.params['id'];
    this.loadProperty(propertyId);
    this.loadReviews(propertyId);
  }

  loadProperty(id: string) {
    // Mock property data - in real app, this would come from a property service
    const properties = [
      {
        id: 'prop1',
        name: 'Flex Living Downtown',
        location: '123 Main Street, Downtown',
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
      },
      {
        id: 'prop2',
        name: 'Flex Living Midtown',
        location: '456 Oak Avenue, Midtown',
        rating: 4.6,
        imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
      }
    ];

    const property = properties.find(p => p.id === id);
    this.property.set(property || properties[0]);
  }

  loadReviews(propertyId: string) {
    this.reviewService.getReviews().subscribe(reviews => {
      // Filter only published reviews for this property that are selected for website
      const propertyReviews = reviews
        .filter(review => 
          review.propertyId === propertyId && 
          review.status === 'published' &&
          review.isSelectedForWebsite
        )
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      
      this.allReviews.set(propertyReviews);
      this.loadMoreReviews();
    });
  }

  loadMoreReviews() {
    const start = this.currentPage * this.reviewsPerPage;
    const end = start + this.reviewsPerPage;
    const newReviews = this.allReviews().slice(start, end);
    
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
}