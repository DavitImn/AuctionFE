import { Component, OnInit } from '@angular/core';
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
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  auctions: Auction[] = [];

  constructor(
    public _http: AuctionsService,
    private router: Router
  ) {}

  ngOnInit() {
    this._http.getAuctions().subscribe(response => {
      // Transform the API response to match our Auction interface
      this.auctions = (response as any[]).map(item => ({
        id: item.auctionId,
        title: item.item.title,
        description: item.item.description,
        imageUrl: item.item.imageUrls[0], // Using first image as main
        category: item.item.category,
        condition: item.item.condition,
        seller: item.item.seller.firstName,
        startingPrice: item.startingPrice,
        currentPrice: item.currentPrice,
        buyNowPrice: item.currentPrice, // Assuming this is the buy now price
        timeLeft: this.calculateTimeLeft(item.endTime)
      }));
    });
  }

  private calculateTimeLeft(endTime: string): TimeLeft {
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const distance = end - now;

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

  onCategoryChange(event: any) {
    const categoryValue = event.target.value;
    this._http.getAuctions().subscribe(response => {
      const allAuctions = (response as any[]).map(item => ({
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
        timeLeft: this.calculateTimeLeft(item.endTime)
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

  navigateToAuction(id: number) {
    console.log('Navigating to auction:', id);
    this.router.navigate(['/details', id]);
  }
}
