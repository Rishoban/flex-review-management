import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Observable } from 'rxjs';
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
import { AuthService } from '../../shared/services/auth.service';
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
  TrendData,
  PaginationInfo,
  DropdownData,
  DropdownOption,
  Channel,
  Property
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

  // Dropdown data
  protected readonly dropdownData = signal<DropdownData | null>(null);
  protected readonly statusOptions = computed(() => {
    const data = this.dropdownData();
    return data ? data.statuses.filter(s => s.isActive).sort((a, b) => a.sortOrder - b.sortOrder) : [];
  });

  // Channels data
  protected readonly channelsData = signal<Channel[]>([]);
  protected readonly channelOptions = computed(() => {
    return this.channelsData().filter(channel => channel.isActive);
  });

  // Properties data
  protected readonly propertiesData = signal<Property[]>([]);
  protected readonly propertyOptions = computed(() => {
    return this.propertiesData().filter(property => property.isActive);
  });

  // Filter state
  protected readonly filters = signal<DashboardFilters>({});
  protected readonly searchTerm = signal<string>('');
  protected readonly selectedStatus = signal<string>('');
  protected readonly selectedChannel = signal<string>('');
  protected readonly selectedProperty = signal<string>('');
  protected readonly selectedRating = signal<string>('');

  // Sorting state
  protected readonly sortField = signal<string>('submittedAt');
  protected readonly sortDirection = signal<'asc' | 'desc'>('desc');

  // Pagination state
  protected readonly currentPage = signal<number>(1);
  protected readonly pageSize = signal<number>(10);
  protected readonly pagination = signal<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
    hasNext: false,
    hasPrev: false
  });

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
    const rating = this.selectedRating();
    
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
    
    // Apply rating filter
    if (rating) {
      const minRating = parseInt(rating);
      filtered = filtered.filter(review => {
        const reviewRating = review.rating || this.calculateAverageRating(review.reviewCategory);
        return reviewRating >= minRating;
      });
    }
    
    // Apply sorting
    const field = this.sortField();
    const direction = this.sortDirection();
    
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (field) {
        case 'submittedAt':
          aValue = new Date(a.submittedAt).getTime();
          bValue = new Date(b.submittedAt).getTime();
          break;
        case 'rating':
          aValue = a.rating || this.calculateAverageRating(a.reviewCategory);
          bValue = b.rating || this.calculateAverageRating(b.reviewCategory);
          break;
        case 'guestName':
          aValue = a.guestName.toLowerCase();
          bValue = b.guestName.toLowerCase();
          break;
        case 'listingName':
          aValue = a.listingName.toLowerCase();
          bValue = b.listingName.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
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
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  protected loadDashboardData(): void {
    this.isLoading.set(true);
    
    // Load all dashboard data
    Promise.all([
      this.reviewService.getReviewsPaginated(this.currentPage(), this.pageSize()).toPromise(),
      this.reviewService.getPropertyPerformance().toPromise(),
      this.reviewService.getDashboardStats().toPromise(),
      this.reviewService.getTrendData().toPromise(),
      this.reviewService.getDropdownData().toPromise(),
      this.reviewService.getChannels().toPromise(),
      this.reviewService.getProperties().toPromise()
    ]).then(([reviewsData, performance, stats, trends, dropdowns, channels, properties]) => {
      if (reviewsData) {
        this.reviews.set(reviewsData.reviews || []);
        this.pagination.set(reviewsData.pagination);
      }
      this.propertyPerformance.set(performance || []);
      this.dashboardStats.set(stats || this.dashboardStats());
      this.trendData.set(trends || []);
      this.dropdownData.set(dropdowns || null);
      this.channelsData.set(channels || []);
      this.propertiesData.set(properties || []);
      this.isLoading.set(false);
    }).catch(error => {
      console.error('Error loading dashboard data:', error);
      this.showErrorMessage('Failed to load dashboard data');
      this.isLoading.set(false);
    });
  }



  protected updateReviewStatus(reviewId: number, status: string): void {
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
        // Fallback to old method for other statuses
        apiCall = this.reviewService.updateReviewStatus(reviewId, status);
        break;
    }
    
    apiCall.subscribe({
      next: (response: any) => {
        const currentReviews = this.reviews();
        const index = currentReviews.findIndex(r => r.id === reviewId);
        if (index !== -1) {
          currentReviews[index] = { ...currentReviews[index], status };
          this.reviews.set([...currentReviews]);
        }
        
        // Show success message
        const message = response.message || `Review ${status} successfully`;
        this.showSuccessMessage(message);
        
        // Reload dashboard data to get fresh stats
        this.loadDashboardData();
      },
      error: (error: any) => {
        console.error('Failed to update review status:', error);
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
    const statusOption = this.statusOptions().find(option => option.value === status);
    return statusOption?.color || '#666';
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

  protected onRatingChange(rating: string): void {
    this.selectedRating.set(rating);
  }

  protected onTabChange(index: number): void {
    this.selectedTab.set(index);
  }

  protected clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('');
    this.selectedChannel.set('');
    this.selectedProperty.set('');
    this.selectedRating.set('');
  }

  protected sortBy(field: string): void {
    const currentField = this.sortField();
    const currentDirection = this.sortDirection();
    
    if (currentField === field) {
      // Toggle direction if same field
      this.sortDirection.set(currentDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending for dates, ascending for others
      this.sortField.set(field);
      this.sortDirection.set(field === 'submittedAt' ? 'desc' : 'asc');
    }
  }

  protected getSortIcon(field: string): string {
    const currentField = this.sortField();
    const direction = this.sortDirection();
    
    if (currentField !== field) {
      return 'unfold_more';
    }
    
    return direction === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
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
    this.authService.logout();
  }

  // Pagination methods
  protected goToPage(page: number): void {
    if (page >= 1 && page <= this.pagination().pages) {
      this.currentPage.set(page);
      this.loadReviews();
    }
  }

  protected nextPage(): void {
    if (this.pagination().hasNext) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  protected prevPage(): void {
    if (this.pagination().hasPrev) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  protected changePageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1); // Reset to first page
    this.loadReviews();
  }

  // Load reviews only (for pagination and filtering)
  private loadReviews(): void {
    this.isLoading.set(true);
    
    this.reviewService.getReviewsPaginated(
      this.currentPage(), 
      this.pageSize(),
      this.filters()
    ).subscribe({
      next: (data) => {
        this.reviews.set(data.reviews);
        this.pagination.set(data.pagination);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.showErrorMessage('Failed to load reviews');
        this.isLoading.set(false);
      }
    });
  }

  // Update applyFilters to reload with current pagination
  protected applyFilters(): void {
    const filters: DashboardFilters = {
      searchTerm: this.searchTerm() || undefined,
      status: this.selectedStatus() || undefined,
      channel: this.selectedChannel() || undefined,
      propertyId: this.selectedProperty() || undefined,
      rating: this.selectedRating() ? {
        min: parseInt(this.selectedRating()),
        max: 5
      } : undefined
    };
    
    this.filters.set(filters);
    this.currentPage.set(1); // Reset to first page when filtering
    this.loadReviews();
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

  // Helper methods for flagged issues display
  protected getIssuesToolTip(issues: string[]): string {
    if (!issues || issues.length === 0) {
      return 'No issues';
    }
    
    const issueCount = issues.length;
    const preview = issues.slice(0, 3).join(', ');
    
    if (issueCount <= 3) {
      return `Issues: ${preview}`;
    } else {
      return `Issues (${issueCount}): ${preview} and ${issueCount - 3} more...`;
    }
  }

  protected getIssuesSeverityColor(count: number): string {
    if (count === 0) return 'var(--success-color)';
    if (count === 1) return 'var(--warning-color)';
    if (count <= 3) return 'var(--error-color)';
    return 'var(--critical-error-color, #d32f2f)';
  }
}