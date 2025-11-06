import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Observable } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ReviewService } from '../../shared/services/review.service';
import { Review } from '../../shared/models/review.models';

@Component({
  selector: 'app-review-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatMenuModule,
    MatSnackBarModule
  ],
  template: `
    <div class="review-detail-page" *ngIf="review()">
      <div class="header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Review Details</h1>
        <div class="actions">
          <button mat-icon-button [matMenuTriggerFor]="menu">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            <button mat-menu-item (click)="toggleStatus('published')" 
                    [disabled]="review()?.status === 'published'">
              <mat-icon>visibility</mat-icon>
              <span>Publish Review</span>
            </button>
            <button mat-menu-item (click)="toggleStatus('pending')"
                    [disabled]="review()?.status === 'pending'">
              <mat-icon>visibility_off</mat-icon>
              <span>Mark as Pending</span>
            </button>
            <button mat-menu-item (click)="toggleStatus('rejected')"
                    [disabled]="review()?.status === 'rejected'">
              <mat-icon>flag</mat-icon>
              <span>Reject Review</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="deleteReview()" class="delete-action">
              <mat-icon>delete</mat-icon>
              <span>Delete Review</span>
            </button>
          </mat-menu>
        </div>
      </div>

      <div class="content">
        <mat-card class="review-card">
          <mat-card-content>
            <!-- Review Header -->
            <div class="review-header">
              <div class="reviewer-info">
                <div class="avatar">
                  {{getInitials(review()!.guestName)}}
                </div>
                <div class="details">
                  <h2>{{review()!.guestName}}</h2>
                  <p class="date">{{formatDate(review()!.submittedAt)}}</p>
                  <p class="property" *ngIf="review()!.propertyId">{{getPropertyName(review()!.propertyId)}}</p>
                </div>
              </div>
              <div class="rating-section">
                  <div class="stars">
                    <mat-icon *ngFor="let star of getStars(review()!.rating || 0)">star</mat-icon>
                    <mat-icon *ngFor="let star of getEmptyStars(review()!.rating || 0)" class="empty">star_border</mat-icon>
                  </div>
                <span class="rating-text">{{review()!.rating}}/5</span>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Review Content -->
            <div class="review-content">
              <h3>Review</h3>
              <p>{{review()!.publicReview}}</p>
            </div>

            <!-- Review Categories -->
            <div class="categories-section" *ngIf="review()!.reviewCategory && review()!.reviewCategory.length > 0">
              <h4>Category Ratings</h4>
              <div class="category-grid">
                <div class="category-item" *ngFor="let cat of review()!.reviewCategory">
                  <span class="category-name">{{formatCategoryName(cat.category)}}</span>
                  <div class="category-rating">
                    <div class="rating-bar">
                      <div class="rating-fill" [style.width.%]="(cat.rating / 10) * 100"></div>
                    </div>
                    <span class="rating-value">{{cat.rating}}/10</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Flagged Issues -->
            <div class="flagged-section" *ngIf="hasFlaggedIssues()">
              <h4>Flagged Issues</h4>
              <div class="flagged-issues">
                <mat-chip class="issue-chip" *ngFor="let issue of getFlaggedIssues()">
                  <mat-icon>warning</mat-icon>
                  {{formatCategoryName(issue)}}
                </mat-chip>
              </div>
            </div>

            <!-- Review Metadata -->
            <div class="metadata">
              <div class="metadata-row">
                <label>Source:</label>
                <mat-chip>{{getChannelName(review()?.channel || 'direct')}}</mat-chip>
              </div>
              <div class="metadata-row">
                <label>Status:</label>
                <mat-chip [class]="'status-' + review()!.status">
                  {{getStatusLabel(review()!.status)}}
                </mat-chip>
              </div>
              <div class="metadata-row">
                <label>Website Display:</label>
                <mat-chip [class]="review()!.isSelectedForWebsite ? 'status-published' : 'status-hidden'">
                  {{review()!.isSelectedForWebsite ? 'Selected' : 'Not Selected'}}
                </mat-chip>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Actions Card -->
        <mat-card class="actions-card">
          <mat-card-header>
            <mat-card-title>Quick Actions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <!-- Current Status Display -->
            <div class="current-status">
              <h4>Current Status</h4>
              <div class="status-chip" [ngClass]="'status-' + review()?.status">
                <mat-icon>{{ getStatusIcon(review()?.status) }}</mat-icon>
                <span>{{ getStatusDisplay(review()?.status) }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Similar Reviews -->
        <mat-card class="similar-reviews" *ngIf="similarReviews().length > 0">
          <mat-card-header>
            <mat-card-title>Similar Reviews</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="similar-grid">
              <div class="similar-item" *ngFor="let similar of similarReviews()" 
                   (click)="viewReview(similar.id.toString())">
                <div class="similar-header">
                  <span class="name">{{similar.guestName}}</span>
                  <div class="rating">
                    <mat-icon>star</mat-icon>
                    <span>{{similar.rating}}</span>
                  </div>
                </div>
                <p class="preview">{{getPreview(similar.publicReview)}}</p>
                <small class="date">{{formatDate(similar.submittedAt)}}</small>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styleUrl: './review-detail.component.css'
})
export class ReviewDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reviewService = inject(ReviewService);
  private snackBar = inject(MatSnackBar);

  review = signal<Review | null>(null);
  similarReviews = signal<Review[]>([]);

  ngOnInit() {
    console.log('ReviewDetailComponent loaded successfully');
    const reviewId = this.route.snapshot.params['id'];
    this.loadReview(reviewId);
  }

  loadReview(id: string) {
    const reviewId = parseInt(id);
    this.reviewService.getReviewById(reviewId).subscribe({
      next: (review) => {
        this.review.set(review);
        this.loadSimilarReviews(id);
      },
      error: (error) => {
        console.error('Failed to load review:', error);
        this.review.set(null);
      }
    });
  }

  loadSimilarReviews(currentId: string) {
    const currentReview = this.review();
    if (!currentReview) return;

    this.reviewService.getReviews().subscribe(reviews => {
      const currentCategories = currentReview.reviewCategory.map(c => c.category);
      const similar = reviews
        .filter(r => 
          r.id.toString() !== currentId && 
          (r.propertyId === currentReview.propertyId || 
           r.reviewCategory.some(cat => currentCategories.includes(cat.category)))
        )
        .slice(0, 3);
      this.similarReviews.set(similar);
    });
  }

  toggleStatus(status: 'published' | 'pending' | 'approved' | 'rejected') {
    const reviewId = this.review()?.id;
    if (!reviewId) return;

    let apiCall: Observable<any>;
    
    // Use the appropriate API endpoint based on status
    switch (status) {
      case 'approved':
        apiCall = this.reviewService.approveReview(reviewId);
        break;
      case 'published':
        apiCall = this.reviewService.publishReview(reviewId);
        break;
      case 'rejected':
        apiCall = this.reviewService.rejectReview(reviewId);
        break;
      default:
        // Fallback to old method for other statuses like 'pending'
        apiCall = this.reviewService.updateReviewStatus(reviewId, status);
        break;
    }

    apiCall.subscribe({
      next: (response: any) => {
        this.review.update(current => 
          current ? { ...current, status } : current
        );
        const message = response.message || `Review ${status} successfully`;
        this.snackBar.open(message, 'Close', {
          duration: 3000
        });
      },
      error: (error: any) => {
        console.error('Failed to update review status:', error);
        this.snackBar.open('Failed to update review status', 'Close', {
          duration: 3000
        });
      }
    });
  }

  deleteReview() {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    const reviewId = this.review()?.id;
    if (!reviewId) return;

    // In a real app, this would call the review service to delete
    this.snackBar.open('Review deleted successfully', 'Close', {
      duration: 3000
    });
    this.goBack();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  viewReview(id: string) {
    this.router.navigate(['/review', id]);
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

  getStatusLabel(status: string): string {
    const labels = {
      'displayed': 'Displayed',
      'hidden': 'Hidden',
      'flagged': 'Flagged'
    };
    return labels[status as keyof typeof labels] || status;
  }

  getPropertyName(propertyId?: string): string {
    const currentReview = this.review();
    if (currentReview && currentReview.listingName) {
      return currentReview.listingName;
    }
    return 'Unknown Property';
  }

  getPreview(text: string): string {
    return text.length > 100 ? text.substring(0, 97) + '...' : text;
  }

  getStatusIcon(status?: string): string {
    const icons: { [key: string]: string } = {
      'pending': 'schedule',
      'approved': 'check_circle',
      'published': 'visibility',
      'rejected': 'cancel',
      'displayed': 'visibility',
      'hidden': 'visibility_off',
      'flagged': 'flag'
    };
    return icons[status || 'pending'] || 'help';
  }

  getStatusDisplay(status?: string): string {
    const displays: { [key: string]: string } = {
      'pending': 'Pending Review',
      'approved': 'Approved',
      'published': 'Published',
      'rejected': 'Rejected',
      'displayed': 'Displayed',
      'hidden': 'Hidden',
      'flagged': 'Flagged'
    };
    return displays[status || 'pending'] || 'Unknown Status';
  }

  formatCategoryName(category: string): string {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getChannelName(channel?: string): string {
    const channelNames: { [key: string]: string } = {
      'airbnb': 'Airbnb',
      'booking': 'Booking.com',
      'direct': 'Direct Booking',
      'google': 'Google Reviews'
    };
    return channelNames[channel || 'direct'] || (channel ? channel.charAt(0).toUpperCase() + channel.slice(1) : 'Direct Booking');
  }

  hasFlaggedIssues(): boolean {
    const review = this.review();
    return !!(review?.flaggedIssues && review.flaggedIssues.length > 0);
  }

  getFlaggedIssues(): string[] {
    const review = this.review();
    return review?.flaggedIssues || [];
  }
}