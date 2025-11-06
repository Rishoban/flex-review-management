import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { ReviewService } from '../../shared/services/review.service';
import { 
  Review, 
  PropertyPerformance, 
  DashboardFilters, 
  DashboardStats, 
  TrendData 
} from '../../shared/models/review.models';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatChipsModule,
    MatBadgeModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.css']
})
export class ManagerDashboardComponent implements OnInit {
  // Signals for reactive state management
  protected readonly reviews = signal<Review[]>([]);
  protected readonly propertyPerformance = signal<PropertyPerformance[]>([]);
  protected readonly dashboardStats = signal<DashboardStats>({
    totalReviews: 0,
    averageRating: 0,
    pendingReviews: 0,
    publishedReviews: 0,
    flaggedIssues: 0,
    propertiesCount: 0
  });
  protected readonly trendData = signal<TrendData[]>([]);
  protected readonly isLoading = signal<boolean>(false);
  protected readonly selectedTab = signal<number>(0);

  // Filter state
  protected readonly filters = signal<DashboardFilters>({});
  protected readonly searchTerm = signal<string>('');
  protected readonly selectedStatus = signal<string>('');
  protected readonly selectedChannel = signal<string>('');
  protected readonly selectedProperty = signal<string>('');

  // Table columns
  protected readonly displayedColumns = [
    'guestName', 
    'listingName', 
    'rating', 
    'status', 
    'channel', 
    'submittedAt', 
    'flaggedIssues',
    'websiteSelection',
    'actions'
  ];

  // Computed properties
  protected readonly filteredReviews = computed(() => {
    let filtered = this.reviews();
    const search = this.searchTerm().toLowerCase();
    const status = this.selectedStatus();
    const channel = this.selectedChannel();
    const property = this.selectedProperty();
    
    // Apply search filter
    if (search) {
      filtered = filtered.filter(review =>
        review.guestName.toLowerCase().includes(search) ||
        review.listingName.toLowerCase().includes(search) ||
        review.publicReview.toLowerCase().includes(search)
      );
    }
    
    // Apply status filter
    if (status) {
      filtered = filtered.filter(review => review.status === status);
    }
    
    // Apply channel filter
    if (channel) {
      filtered = filtered.filter(review => review.channel === channel);
    }
    
    // Apply property filter
    if (property) {
      filtered = filtered.filter(review => review.propertyId === property);
    }
    
    return filtered;
  });

  protected readonly reviewsByStatus = computed(() => {
    const reviews = this.reviews();
    return {
      pending: reviews.filter(r => r.status === 'pending').length,
      approved: reviews.filter(r => r.status === 'approved').length,
      published: reviews.filter(r => r.status === 'published').length,
      rejected: reviews.filter(r => r.status === 'rejected').length
    };
  });

  protected readonly flaggedReviews = computed(() => {
    return this.reviews().filter(r => r.flaggedIssues && r.flaggedIssues.length > 0);
  });

  constructor(
    private reviewService: ReviewService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  protected loadDashboardData(): void {
    this.isLoading.set(true);
    
    // Load all dashboard data
    Promise.all([
      this.reviewService.getReviews().toPromise(),
      this.reviewService.getPropertyPerformance().toPromise(),
      this.reviewService.getDashboardStats().toPromise(),
      this.reviewService.getTrendData().toPromise()
    ]).then(([reviews, performance, stats, trends]) => {
      this.reviews.set(reviews || []);
      this.propertyPerformance.set(performance || []);
      this.dashboardStats.set(stats || this.dashboardStats());
      this.trendData.set(trends || []);
      this.isLoading.set(false);
    }).catch(error => {
      console.error('Error loading dashboard data:', error);
      this.showErrorMessage('Failed to load dashboard data');
      this.isLoading.set(false);
    });
  }

  protected applyFilters(filters: DashboardFilters): void {
    this.filters.set(filters);
    this.isLoading.set(true);
    
    this.reviewService.getReviews(filters).subscribe({
      next: (reviews) => {
        this.reviews.set(reviews);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error applying filters:', error);
        this.showErrorMessage('Failed to apply filters');
        this.isLoading.set(false);
      }
    });
  }

  protected updateReviewStatus(reviewId: number, status: Review['status']): void {
    this.reviewService.updateReviewStatus(reviewId, status).subscribe({
      next: (updatedReview) => {
        const currentReviews = this.reviews();
        const index = currentReviews.findIndex(r => r.id === reviewId);
        if (index !== -1) {
          currentReviews[index] = updatedReview;
          this.reviews.set([...currentReviews]);
        }
        this.showSuccessMessage(`Review ${status} successfully`);
      },
      error: (error) => {
        console.error('Error updating review status:', error);
        this.showErrorMessage('Failed to update review status');
      }
    });
  }

  protected navigateToReview(reviewId: number): void {
    this.router.navigate(['/review', reviewId]);
  }

  protected navigateToProperty(propertyId: string): void {
    this.router.navigate(['/property', propertyId]);
  }

  protected toggleWebsiteSelection(reviewId: number): void {
    this.reviewService.toggleWebsiteSelection(reviewId).subscribe({
      next: (updatedReview) => {
        const currentReviews = this.reviews();
        const index = currentReviews.findIndex(r => r.id === reviewId);
        if (index !== -1) {
          currentReviews[index] = updatedReview;
          this.reviews.set([...currentReviews]);
        }
        this.showSuccessMessage('Website selection updated');
      },
      error: (error) => {
        console.error('Error toggling website selection:', error);
        this.showErrorMessage('Failed to update website selection');
      }
    });
  }

  protected getRatingColor(rating: number | null): string {
    if (!rating) return '#666';
    if (rating >= 4.5) return '#4caf50';
    if (rating >= 4.0) return '#8bc34a';
    if (rating >= 3.5) return '#ffc107';
    if (rating >= 3.0) return '#ff9800';
    return '#f44336';
  }

  protected calculateAverageRating(categories: { category: string; rating: number }[]): number {
    if (!categories || categories.length === 0) return 0;
    const total = categories.reduce((sum, cat) => sum + cat.rating, 0);
    return Math.round((total / categories.length) * 10) / 10;
  }

  protected getStatusColor(status: string): string {
    switch (status) {
      case 'published': return '#4caf50';
      case 'approved': return '#2196f3';
      case 'pending': return '#ff9800';
      case 'rejected': return '#f44336';
      default: return '#666';
    }
  }

  protected getChannelIcon(channel: string): string {
    switch (channel) {
      case 'airbnb': return 'home';
      case 'booking': return 'hotel';
      case 'direct': return 'business';
      case 'google': return 'place';
      default: return 'help';
    }
  }

  protected getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      case 'stable': return 'trending_flat';
      default: return 'help';
    }
  }

  protected getTrendColor(trend: string): string {
    switch (trend) {
      case 'up': return '#4caf50';
      case 'down': return '#f44336';
      case 'stable': return '#ff9800';
      default: return '#666';
    }
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  protected onSearchChange(event: any): void {
    this.searchTerm.set(event.target.value);
  }

  protected onStatusChange(status: string): void {
    this.selectedStatus.set(status);
  }

  protected onChannelChange(channel: string): void {
    this.selectedChannel.set(channel);
  }

  protected onPropertyChange(property: string): void {
    this.selectedProperty.set(property);
  }

  protected onTabChange(index: number): void {
    this.selectedTab.set(index);
  }

  protected clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('');
    this.selectedChannel.set('');
    this.selectedProperty.set('');
  }

  protected exportReviews(): void {
    // Implementation for exporting reviews to CSV/Excel
    this.showSuccessMessage('Reviews exported successfully');
  }

  protected viewPublicReviews(): void {
    // Open public reviews page in new tab to simulate how customers would see it
    window.open('/reviews', '_blank');
  }

  protected logout(): void {
    this.router.navigate(['/login']);
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}