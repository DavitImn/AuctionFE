import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuctionsService } from '../../serices/auctions.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface Auction {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  condition: string;
  seller: string;
  startingPrice: number;
  currentPrice: number;
  buyNowPrice: number;
  timeLeft: TimeLeft;
  status: 'Pending' | 'Active' | 'Closed' | 'Cancelled';
  startTime: string;
  endTime: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  auctions: Auction[] = [];
  selectedStatus: string = 'all';
  showOnlyActive: boolean = false;
  private timerInterval: any;

  constructor(
    public _http: AuctionsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAuctions();
    // Update timers every second
    this.timerInterval = setInterval(() => {
      this.updateAllTimers();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  updateAllTimers() {
    this.auctions = this.auctions.map(auction => ({
      ...auction,
      timeLeft: this.calculateTimeLeft(auction.endTime)
    }));
  }

  loadAuctions() {
    const endpoint = this.showOnlyActive ? 'auctions' : 'all-auctions';
    this._http.getAuctions(endpoint).subscribe(response => {
      // Filter out deleted auctions and transform the API response
      this.auctions = (response as any[])
        .filter(item => !item.isDeleted)
        .map(item => ({
          id: item.auctionId,
          title: item.item.title,
          description: item.item.description,
          imageUrl: item.item.imageUrls[0], // Using first image as main
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
    });
  }

  private calculateTimeLeft(endTime: string): TimeLeft {
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const distance = end - now;

    // If auction has ended, return all zeros
    if (distance < 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      };
    }

    return {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000)
    };
  }

  onSortChange(event: any) {
    const sortValue = event.target.value;
    if (sortValue === 'low-to-high') {
      this.auctions.sort((a, b) => a.currentPrice - b.currentPrice);
    } else if (sortValue === 'high-to-low') {
      this.auctions.sort((a, b) => b.currentPrice - a.currentPrice);
    }
    // 'default' will use original order
  }

  onStatusChange(event: any) {
    this.selectedStatus = event.target.value;
    this.loadAuctions();
  }

  onCategoryChange(event: any) {
    const categoryValue = event.target.value;
    const endpoint = this.showOnlyActive ? 'auctions' : 'all-auctions';
    this._http.getAuctions(endpoint).subscribe(response => {
      const allAuctions = (response as any[])
        .filter(item => !item.isDeleted)
        .map(item => ({
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

      if (categoryValue === 'all') {
        this.auctions = allAuctions;
      } else {
        this.auctions = allAuctions.filter(auction => 
          auction.category === categoryValue
        );
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Active': return 'status-active';
      case 'Closed': return 'status-closed';
      case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  navigateToAuction(id: number) {
    console.log('Navigating to auction:', id);
    this.router.navigate(['/details', id]);
  }

  onShowActiveChange(event: any) {
    this.showOnlyActive = event.target.checked;
    const endpoint = this.showOnlyActive ? 'auctions' : 'all-auctions';
    this._http.getAuctions(endpoint).subscribe(response => {
      const allAuctions = (response as any[])
        .filter(item => !item.isDeleted)
        .map(item => ({
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

      // Get the current category filter value
      const categorySelect = document.querySelector('.filter-select[ng-reflect-name="category"]') as HTMLSelectElement;
      const categoryValue = categorySelect ? categorySelect.value : 'all';

      // Apply category filter if needed
      if (categoryValue !== 'all') {
        this.auctions = allAuctions.filter(auction => 
          auction.category === categoryValue
        );
      } else {
        this.auctions = allAuctions;
      }
    });
  }
}
