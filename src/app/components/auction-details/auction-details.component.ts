import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuctionsService, AuctionData } from '../../services/auctions.service';
import { HttpService } from '../../services/http.service';
import { interval, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

interface AuctionResponse {
  viewCount: number;
}

@Component({
  selector: 'app-auction-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auction-details.component.html',
  styleUrls: ['./auction-details.component.css']
})
export class AuctionDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('zoomImage') zoomImage!: ElementRef<HTMLImageElement>;
  
  isFullscreen: boolean = false;
  viewCount: number = 0;
  auctionData?: AuctionData;
  currentImage: string = '';
  currentImageIndex: number = 0;
  remainingDays: string = '00';
  remainingHours: string = '00';
  remainingMinutes: string = '00';
  remainingSeconds: string = '00';
  private timerSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private auctionsService: AuctionsService,
    public httpService: HttpService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const auctionId = params['id'];
      if (auctionId) {
        this.loadAuctionDetails(auctionId);
      }
    });
  }

  private loadAuctionDetails(auctionId: string) {
    this.auctionsService.getAuction(auctionId).subscribe({
      next: (data: AuctionData) => {
        this.auctionData = data;
        if (data.item.imageUrls.length > 0) {
          this.currentImage = data.item.imageUrls[0];
        }
        this.startTimer();
        this.incrementViewCount();
      },
      error: (error: Error) => {
        console.error('Error loading auction details:', error);
      }
    });
  }

  private incrementViewCount() {
    const auctionId = this.auctionData?.auctionId;
    if (auctionId) {
      this.httpService.post<AuctionResponse>(`/api/auctions/${auctionId}/view`, {}).subscribe({
        next: (response: AuctionResponse) => {
          this.viewCount = response.viewCount;
        },
        error: (error: Error) => {
          console.error('Error incrementing view count:', error);
        }
      });
    }
  }

  handleZoom(event: MouseEvent) {
    if (!this.zoomImage?.nativeElement) return;
    
    const image = this.zoomImage.nativeElement;
    const { left, top, width, height } = image.getBoundingClientRect();
    
    const x = (event.clientX - left) / width;
    const y = (event.clientY - top) / height;
    
    image.style.transformOrigin = `${x * 100}% ${y * 100}%`;
    image.classList.add('zoomed');
  }

  resetZoom() {
    if (!this.zoomImage?.nativeElement) return;
    this.zoomImage.nativeElement.classList.remove('zoomed');
  }

  openFullscreen() {
    this.isFullscreen = true;
    document.body.style.overflow = 'hidden';
  }

  closeFullscreen() {
    this.isFullscreen = false;
    document.body.style.overflow = 'auto';
  }

  previousImage(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
      this.currentImage = this.auctionData?.item?.imageUrls[this.currentImageIndex] || '';
    }
  }

  nextImage(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    if (this.currentImageIndex < (this.auctionData?.item?.imageUrls.length || 0) - 1) {
      this.currentImageIndex++;
      this.currentImage = this.auctionData?.item?.imageUrls[this.currentImageIndex] || '';
    }
  }

  selectImage(index: number) {
    this.currentImageIndex = index;
    this.currentImage = this.auctionData.item.imageUrls[index];
  }

  private startTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.auctionData) {
        const endTime = new Date(this.auctionData.endTime).getTime();
        const now = new Date().getTime();
        const distance = endTime - now;

        if (distance > 0) {
          this.remainingDays = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
          this.remainingHours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
          this.remainingMinutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
          this.remainingSeconds = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
        } else {
          this.remainingDays = '00';
          this.remainingHours = '00';
          this.remainingMinutes = '00';
          this.remainingSeconds = '00';
          this.timerSubscription?.unsubscribe();
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  placeBid() {
    // Implement bid placement logic here
    const auctionId = this.auctionData?.auctionId;
    if (auctionId) {
      // You can implement the bid amount input UI and logic here
      const amount = this.auctionData?.currentPrice + 10; // Example increment
      this.auctionsService.placeBid(auctionId, amount).subscribe({
        next: (updatedAuction: AuctionData) => {
          this.auctionData = updatedAuction;
        },
        error: (error: Error) => {
          console.error('Error placing bid:', error);
        }
      });
    }
  }
} 