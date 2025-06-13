import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuctionsService } from '../../services/auctions.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../components/card/card.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchResults: any[] = [];
  allResults: any[] = [];
  searchQuery: string = '';
  isLoading = false;
  error: string | null = null;
  selectedSort: string = 'default';
  selectedCategory: string = 'all';
  showOnlyActive: boolean = false;

  constructor(private route: ActivatedRoute, private auctionsService: AuctionsService) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const query = params['q'];
      if (query) {
        this.searchQuery = query;
        this.performSearch(query);
      }
    });
  }

  performSearch(query: string) {
    this.isLoading = true;
    this.error = null;
    this.searchResults = [];
    this.auctionsService.searchAuctions(query).subscribe({
      next: (results) => {
        if (!results || results.length === 0) {
          this.error = `No auctions found for "${query}"`;
          this.searchResults = [];
          this.allResults = [];
        } else {
          this.allResults = results.filter((item: any) => !item.isDeleted).map((item: any) => ({
            id: item.auctionId,
            title: item.item.title,
            description: item.item.description,
            imageUrl: item.item.imageUrls[0],
            category: item.item.category,
            condition: item.item.condition,
            seller: item.item.seller.firstName,
            startingPrice: item.startingPrice,
            currentPrice: item.currentPrice,
            buyNowPrice: item.currentPrice,
            timeLeft: this.calculateTimeLeft(item.endTime),
            status: item.status,
            startTime: item.startTime,
            endTime: item.endTime
          }));
          this.applyFilters();
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to search auctions. Please try again.';
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.allResults];
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === this.selectedCategory);
    }
    if (this.showOnlyActive) {
      filtered = filtered.filter(a => a.status === 'Active');
    }
    if (this.selectedSort === 'low-to-high') {
      filtered = filtered.sort((a, b) => a.currentPrice - b.currentPrice);
    } else if (this.selectedSort === 'high-to-low') {
      filtered = filtered.sort((a, b) => b.currentPrice - a.currentPrice);
    }
    this.searchResults = filtered;
  }

  onSortChange(event: any) {
    this.selectedSort = event.target.value;
    this.applyFilters();
  }

  onCategoryChange(event: any) {
    this.selectedCategory = event.target.value;
    this.applyFilters();
  }

  onShowActiveChange(event: any) {
    this.showOnlyActive = event.target.checked;
    this.applyFilters();
  }

  private calculateTimeLeft(endTime: string) {
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const distance = end - now;
    if (distance < 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000)
    };
  }
} 