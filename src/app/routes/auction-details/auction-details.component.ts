import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  HostListener,
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  LOCALE_ID,
  ChangeDetectorRef    // ← import ChangeDetectorRef
} from '@angular/core';
import { AuctionsService } from '../../serices/auctions.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageModalComponent } from '../../components/image-modal/image-modal.component';
import { BidService, BidOutputDto } from '../../services/bid.service';
import { AuthService } from '../../services/auth.service';
import { AuthDialogComponent } from '../../components/auth-dialog/auth-dialog.component';
import { BuyNowDialogComponent } from '../../components/buy-now-dialog/buy-now-dialog.component';

import { SignalRService, NewBidPayload } from '../../services/signalr.service';
import { Subscription } from 'rxjs';
import { BuyNowService } from '../../services/buy-now.service';

@Component({
  selector: 'app-auction-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageModalComponent, BuyNowDialogComponent],
  templateUrl: './auction-details.component.html',
  styleUrl: './auction-details.component.css',
  providers: [
    DatePipe,
    { provide: LOCALE_ID, useValue: 'ka-GE' }
  ]
})
export class AuctionDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('mainImage') mainImage!: ElementRef;

  id!: number;
  data: any = { item: {}, currentPrice: 0, minimumBidIncrement: 0 };
  isDataLoading: boolean = true;
  selectedImageUrl: string = '';
  countdown: string = '';
  currentImageIndex: number = 0;
  isFullscreen: boolean = false;
  zoomLevel: number = 1;
  isFavorite: boolean = false;
  viewCount: number = 0;
  private countdownInterval: any;
  mouseX: number = 50;
  mouseY: number = 50;
  isDragging: boolean = false;

  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;

  auctionDetails: any;
  selectedImage: string | null = null;
  bids: BidOutputDto[] = [];
  bidAmount: number = 0;
  totalBidsCount: number = 0;
  totalBidIncrease: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';
  private timerInterval: any;

  private bidSubscription!: Subscription;
  showBuyNowDialog: boolean = false;

  constructor(
    public _http: AuctionsService,
    private bidService: BidService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector,
    private signalR: SignalRService,
    private cd: ChangeDetectorRef,   // ← inject ChangeDetectorRef
    private buyNowService: BuyNowService,
  ) {
    this.route.params.subscribe(res => (this.id = +res['id']));
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.data?.item?.imageUrls?.length > 1) {
      if (event.key === 'ArrowLeft') {
        this.previousImage();
      } else if (event.key === 'ArrowRight') {
        this.nextImage();
      }
    }

    if (event.key === 'Escape') {
      if (this.isFullscreen) {
        this.toggleFullscreen();
      }
      if (this.zoomLevel > 1) {
        this.zoomLevel = 1;
        this.mouseX = 50;
        this.mouseY = 50;
      }
    }
  }

  async ngOnInit(): Promise<void> {
    // Load initial data
    this.loadAuctionDetails();
    this.loadBids();
    this.startTimer();

    // Setup SignalR
    this.signalR.startConnection().then(() => {
      this.signalR.joinAuctionGroup(this.id);
      
      // Subscribe to bid updates
      this.bidSubscription = this.signalR.bidReceived$.subscribe((payload: NewBidPayload) => {
        if (payload.auctionId === this.id) {
          // Get the latest bid data from the server to ensure we have complete information
          this.bidService.getAuctionBids(this.id).subscribe(bids => {
            if (bids.length > 0) {
              // Convert all bid times to Georgia timezone
              this.bids = bids.map(bid => {
                const utcDate = new Date(bid.bidTime);
                // Convert to Georgia timezone (UTC+4)
                const georgiaDate = new Date(utcDate.getTime() + (4 * 60 * 60 * 1000));
                return {
                  ...bid,
                  bidTime: georgiaDate
                };
              });

              const latestBid = this.bids[0]; // Use our converted bids array
              
              // Update current price
              this.data.currentPrice = latestBid.amount;
              
              this.totalBidsCount = this.bids.length;
              this.calculateTotalIncrease();
              
              // Update next minimum bid
              this.bidAmount = this.data.currentPrice + this.data.minimumBidIncrement;
              
              // Force UI update
              this.cd.detectChanges();
            }
          });
        }
      });
    });
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // ───────────────────────────────────────────
    // Clean up SignalR subscription
    if (this.bidSubscription) {
      this.bidSubscription.unsubscribe();
    }
    this.signalR.leaveAuctionGroup(this.id).catch(() => {});
  }

  initializeViewCount(): void {
    const viewsKey = `auction_${this.id}_views`;
    let views = localStorage.getItem(viewsKey);
    if (!views) {
      localStorage.setItem(viewsKey, '1');
      this.viewCount = 1;
    } else {
      this.viewCount = parseInt(views) + 1;
      localStorage.setItem(viewsKey, this.viewCount.toString());
    }
  }

  checkFavoriteStatus(): void {
    const favoritesStr = localStorage.getItem('favorite_auctions') || '[]';
    const favorites = JSON.parse(favoritesStr);
    this.isFavorite = favorites.includes(this.id);
  }

  toggleFavorite(): void {
    const favoritesStr = localStorage.getItem('favorite_auctions') || '[]';
    const favorites = JSON.parse(favoritesStr);

    if (this.isFavorite) {
      const index = favorites.indexOf(this.id);
      favorites.splice(index, 1);
    } else {
      favorites.push(this.id);
    }

    localStorage.setItem('favorite_auctions', JSON.stringify(favorites));
    this.isFavorite = !this.isFavorite;
  }

  nextImage(): void {
    if (this.data?.item?.imageUrls?.length > 1) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.data.item.imageUrls.length;
      this.selectedImageUrl = this._http.publicUrl + this.data.item.imageUrls[this.currentImageIndex];
    }
  }

  previousImage(): void {
    if (this.data?.item?.imageUrls?.length > 1) {
      this.currentImageIndex =
        this.currentImageIndex === 0
          ? this.data.item.imageUrls.length - 1
          : this.currentImageIndex - 1;
      this.selectedImageUrl = this._http.publicUrl + this.data.item.imageUrls[this.currentImageIndex];
    }
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    if (!this.isFullscreen) {
      this.zoomLevel = 1;
      this.mouseX = 50;
      this.mouseY = 50;
    }
  }

  adjustZoom(increment: boolean, event?: MouseEvent): void {
    if (increment && this.zoomLevel < 3) {
      this.zoomLevel += 0.5;
    } else if (!increment && this.zoomLevel > 1) {
      this.zoomLevel -= 0.5;
    }

    if (this.zoomLevel === 1) {
      this.mouseX = 50;
      this.mouseY = 50;
    } else {
      const rect = this.mainImage.nativeElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = ((event?.clientX || centerX) - rect.left) / rect.width * 100;
      const y = ((event?.clientY || centerY) - rect.top) / rect.height * 100;
      this.mouseX = x;
      this.mouseY = y;
    }
  }

  selectImage(index: number): void {
    this.currentImageIndex = index;
    this.selectedImageUrl = this._http.publicUrl + this.data.item.imageUrls[index];
    this.zoomLevel = 1;
    this.mouseX = 50;
    this.mouseY = 50;
  }

  startCountdown() {
    this.countdownInterval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(this.data.endTime).getTime();
      const distance = end - now;

      if (distance <= 0) {
        this.countdown = 'აუქციონი დასრულდა';
        this.days = this.hours = this.minutes = this.seconds = 0;
        clearInterval(this.countdownInterval);
        return;
      }

      this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
      this.hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      this.minutes = Math.floor((distance / 1000 / 60) % 60);
      this.seconds = Math.floor((distance / 1000) % 60);

      this.countdown = `${this.days} დღე ${this.hours} სთ ${this.minutes} წთ ${this.seconds} წმ`;
    }, 1000);
  }

  onMouseMove(event: MouseEvent): void {
    if (this.zoomLevel > 1) {
      const rect = this.mainImage.nativeElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      const maxOffset = (this.zoomLevel - 1) * 50;
      this.mouseX = Math.max(maxOffset, Math.min(100 - maxOffset, x));
      this.mouseY = Math.max(maxOffset, Math.min(100 - maxOffset, y));
    }
  }

  openImageModal(imageUrl: string) {
    this.selectedImage = this._http.publicUrl + imageUrl;
  }

  closeImageModal() {
    this.selectedImage = null;
  }

  private formatDate(date: string): string {
    const d = new Date(date);
    d.setHours(d.getHours() + 4);
    return d.toISOString();
  }

  private loadAuctionDetails(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.isDataLoading = true;
      this._http.getAuctionById(this.id).subscribe({
        next: (res: any) => {
          if (res.startTime) {
            res.startTime = this.formatDate(res.startTime);
          }
          if (res.endTime) {
            res.endTime = this.formatDate(res.endTime);
          }
          this.data = res;
          this.bidAmount = this.data.currentPrice + this.data.minimumBidIncrement;
          
          // Calculate buy now price if not set (temporary)
          if (!this.data.buyNowPrice) {
            this.data.buyNowPrice = this.data.currentPrice * 1.5;
          }

          if (this.data?.item?.imageUrls?.length > 0) {
            this.selectedImageUrl = this._http.publicUrl + this.data.item.imageUrls[0];
          }
          this.startCountdown();
          this.initializeViewCount();
          this.checkFavoriteStatus();
          this.isDataLoading = false;
          resolve();
        },
        error: (error) => {
          console.error('Failed to load auction details:', error);
          this.isDataLoading = false;
          reject(error);
        }
      });
    });
  }

  private loadBids(): void {
    this.bidService.getAuctionBids(this.id).subscribe(bids => {
      this.bids = bids.map(bid => {
        const utcDate = new Date(bid.bidTime);
        // Convert to Georgia timezone (UTC+4)
        const georgiaDate = new Date(utcDate.getTime() + (4 * 60 * 60 * 1000));
        return {
          ...bid,
          bidTime: georgiaDate
        };
      });
      this.totalBidsCount = bids.length;
      this.calculateTotalIncrease();
    });
  }

  private calculateTotalIncrease(): void {
    if (this.bids.length > 0 && this.data?.startingPrice) {
      const highestBid = Math.max(...this.bids.map((b) => b.amount));
      this.totalBidIncrease = highestBid - this.data.startingPrice;
    } else {
      this.totalBidIncrease = 0;
    }
  }

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.data?.endTime) {
        const now = new Date().getTime();
        const end = new Date(this.data.endTime).getTime();
        const distance = end - now;

        if (distance < 0) {
          clearInterval(this.timerInterval);
          this.loadAuctionDetails();
        }
      }
    }, 1000);
  }

  async placeBid(): Promise<void> {
    if (!this.authService.isAuthenticated()) {
      this.showAuthDialog();
      return;
    }

    if (this.isLoading) return;

    try {
      this.isLoading = true;
      this.errorMessage = '';

      // Client-side validations
      if (!this.data || !this.bidAmount) {
        throw new Error('გთხოვთ შეიყვანოთ ბიდის თანხა');
      }

      if (this.bidAmount <= this.data.currentPrice) {
        throw new Error('ბიდი უნდა იყოს მიმდინარე ფასზე მეტი');
      }

      if (this.bidAmount < this.data.currentPrice + this.data.minimumBidIncrement) {
        throw new Error(`მინიმალური ბიდის ოდენობაა ${this.data.minimumBidIncrement}₾`);
      }

      const userId = await this.authService.getUserId();

      if (!userId) {
        this.showAuthDialog();
        return;
      }

      // Check if user is the seller
      if (this.data.seller?.id === userId) {
        throw new Error('თქვენ ვერ დადებთ ბიდს საკუთარ აუქციონზე');
      }

      // Check if user has the last bid
      if (this.bids.length > 0 && this.bids[0].bidderId === userId) {
        throw new Error('თქვენ უკვე გაქვთ უმაღლესი ბიდი');
      }

      // Place bid but don't update UI - wait for SignalR
      await this.bidService
        .placeBid({
          auctionId: this.id,
          amount: this.bidAmount
        })
        .toPromise();

      // Only update the input field for next bid
      this.bidAmount = this.data.currentPrice + this.data.minimumBidIncrement;
      this.errorMessage = '';
    } catch (error: any) {
      if (error?.status === 401) {
        this.showAuthDialog();
        return;
      }

      if (error?.status === 400) {
        const errorResponse = error.error;
        if (errorResponse.error === 'You are already the highest bidder.') {
          this.errorMessage = 'თქვენ უკვე გაქვთ უმაღლესი ბიდი';
        } else if (errorResponse.error.includes('Bid amount must be at least')) {
          const minAmount = errorResponse.error.match(/\d+(\.\d+)?/)[0];
          this.errorMessage = `მინიმალური ბიდის ოდენობაა ${minAmount}₾`;
        } else {
          this.errorMessage = errorResponse.error || 'დაფიქსირდა შეცდომა ბიდის დადებისას';
        }
      } else {
        this.errorMessage = error.message || 'დაფიქსირდა შეცდომა';
      }
    } finally {
      this.isLoading = false;
    }
  }

  async confirmBuyNow(): Promise<void> {
    if (!this.authService.isAuthenticated()) {
      this.showAuthDialog();
      return;
    }

    const userId = await this.authService.getUserId();
    if (!userId) {
      this.showAuthDialog();
      return;
    }

    // Check if user is the seller
    if (this.data.seller?.id === userId) {
      this.errorMessage = 'თქვენ ვერ იყიდით საკუთარ აუქციონს';
      return;
    }

    this.showBuyNowDialog = true;
  }

  async handleBuyNowConfirm(): Promise<void> {
    this.showBuyNowDialog = false;
    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.buyNowService
        .buyNow({
          auctionId: this.id,
          price: this.data.buyNowPrice
        })
        .toPromise();

      // Reload auction details to get updated status
      await this.loadAuctionDetails();
      
      // Show success message
      alert('წარმატებული შესყიდვა! აუქციონი დასრულებულია.');
    } catch (error: any) {
      if (error?.status === 401) {
        this.showAuthDialog();
        return;
      }

      this.errorMessage = error?.error?.error || 'დაფიქსირდა შეცდომა ყიდვისას';
    } finally {
      this.isLoading = false;
    }
  }

  closeBuyNowDialog(): void {
    this.showBuyNowDialog = false;
  }

  private showAuthDialog(): void {
    const dialogComponentRef = createComponent(AuthDialogComponent, {
      environmentInjector: this.injector
    });

    const { hostView } = dialogComponentRef;
    this.appRef.attachView(hostView);
    const domElem = (hostView as any).rootNodes[0];
    document.body.appendChild(domElem);

    dialogComponentRef.instance.closeEvent.subscribe(() => {
      this.appRef.detachView(hostView);
      dialogComponentRef.destroy();
    });
  }
}
