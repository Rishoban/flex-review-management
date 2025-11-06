import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
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

            <!-- Review Metadata -->
            <div class="metadata">
              <div class="metadata-row">
                <label>Category:</label>
                <mat-chip *ngFor="let cat of review()!.reviewCategory">{{cat.category}}</mat-chip>
              </div>
              <div class="metadata-row">
                <label>Source:</label>
                <mat-chip>{{review()!.channel}}</mat-chip>
              </div>
              <div class="metadata-row">
                <label>Status:</label>
                <mat-chip [class]="'status-' + review()!.status">
                  {{getStatusLabel(review()!.status)}}
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
            <div class="action-buttons">
              <button mat-raised-button color="primary" 
                      (click)="toggleStatus('published')"
                      [disabled]="review()?.status === 'published'">
                <mat-icon>visibility</mat-icon>
                Publish Review
              </button>
              <button mat-raised-button color="accent"
                      (click)="toggleStatus('approved')"
                      [disabled]="review()?.status === 'approved'">
                <mat-icon>check</mat-icon>
                Approve Review
              </button>
              <button mat-raised-button color="warn"
                      (click)="toggleStatus('rejected')"
                      [disabled]="review()?.status === 'rejected'">
                <mat-icon>close</mat-icon>
                Reject Review
              </button>
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
    const reviewId = this.route.snapshot.params['id'];
    this.loadReview(reviewId);
    this.loadSimilarReviews(reviewId);
  }

  loadReview(id: string) {
    this.reviewService.getReviews().subscribe(reviews => {
      const review = reviews.find(r => r.id.toString() === id);
      this.review.set(review || null);
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

    this.reviewService.updateReviewStatus(reviewId, status).subscribe({
      next: () => {
        this.review.update(current => 
          current ? { ...current, status } : current
        );
        this.snackBar.open(`Review ${status} successfully`, 'Close', {
          duration: 3000
        });
      },
      error: () => {
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
    if (!propertyId) return 'Unknown Property';
    const properties: { [key: string]: string } = {
      'prop1': 'Flex Living Downtown',
      'prop2': 'Flex Living Midtown'
    };
    return properties[propertyId] || 'Unknown Property';
  }

  getPreview(text: string): string {
    return text.length > 100 ? text.substring(0, 97) + '...' : text;
  }
}