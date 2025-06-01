import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuctionsService } from '../../serices/auctions.service';
import { interval, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auction-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auction-details.component.html',
  styleUrls: ['./auction-details.component.css']
})
export class AuctionDetailsComponent implements OnInit, OnDestroy {
  auctionData: any;
  currentImage: string = '';
  currentImageIndex: number = 0;
  remainingDays: number = 0;
  remainingHours: number = 0;
  remainingMinutes: number = 0;
  remainingSeconds: number = 0;
  private timerSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    public _http: AuctionsService
  ) {}

  ngOnInit() {
    // Get auction ID from route parameters
    this.route.params.subscribe(params => {
      const auctionId = params['id'];
      this.loadAuctionDetails(auctionId);
    });
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  private loadAuctionDetails(auctionId: string) {
    // Replace this with your actual API call
    this._http.getAuctionDetails(auctionId).subscribe(data => {
      this.auctionData = data;
      if (this.auctionData?.item?.imageUrls?.length > 0) {
        this.currentImage = this.auctionData.item.imageUrls[0];
      }
      this.startTimer();
    });
  }

  previousImage() {
    if (!this.auctionData?.item?.imageUrls?.length) return;
    this.currentImageIndex = (this.currentImageIndex - 1 + this.auctionData.item.imageUrls.length) % this.auctionData.item.imageUrls.length;
    this.currentImage = this.auctionData.item.imageUrls[this.currentImageIndex];
  }

  nextImage() {
    if (!this.auctionData?.item?.imageUrls?.length) return;
    this.currentImageIndex = (this.currentImageIndex + 1) % this.auctionData.item.imageUrls.length;
    this.currentImage = this.auctionData.item.imageUrls[this.currentImageIndex];
  }

  selectImage(index: number) {
    this.currentImageIndex = index;
    this.currentImage = this.auctionData.item.imageUrls[index];
  }

  private startTimer() {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.updateRemainingTime();
    });
  }

  private updateRemainingTime() {
    const now = new Date().getTime();
    const endTime = new Date(this.auctionData.endTime).getTime();
    const timeDifference = endTime - now;

    if (timeDifference > 0) {
      this.remainingDays = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      this.remainingHours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.remainingMinutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      this.remainingSeconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
    } else {
      // Auction has ended
      this.remainingDays = 0;
      this.remainingHours = 0;
      this.remainingMinutes = 0;
      this.remainingSeconds = 0;
      if (this.timerSubscription) {
        this.timerSubscription.unsubscribe();
      }
    }
  }

  placeBid() {
    // Implement bid placement logic here
    console.log('Placing bid for auction:', this.auctionData.auctionId);
  }
} 