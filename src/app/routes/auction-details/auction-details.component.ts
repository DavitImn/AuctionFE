import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AuctionsService } from '../../serices/auctions.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auction-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auction-details.component.html',
  styleUrl: './auction-details.component.css'
})
export class AuctionDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('mainImage') mainImage!: ElementRef;
  
  id!: number;
  data: any;
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

  constructor(public _http: AuctionsService, private route: ActivatedRoute) {
    this.route.params.subscribe(res => this.id = res['id']);
  }

  ngOnInit(): void {
    this._http.getAuctionById(this.id).subscribe(res => {
      this.data = res;
      this.selectedImageUrl = this._http.publicUrl + this.data.item.imageUrls[0];
      this.startCountdown();
      this.initializeViewCount();
      this.checkFavoriteStatus();
    });
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
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
    if (this.data.item.imageUrls.length > 1) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.data.item.imageUrls.length;
      this.selectedImageUrl = this._http.publicUrl + this.data.item.imageUrls[this.currentImageIndex];
    }
  }

  previousImage(): void {
    if (this.data.item.imageUrls.length > 1) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.data.item.imageUrls.length - 1 
        : this.currentImageIndex - 1;
      this.selectedImageUrl = this._http.publicUrl + this.data.item.imageUrls[this.currentImageIndex];
    }
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    this.zoomLevel = 1;
    this.mouseX = 50;
    this.mouseY = 50;
  }

  adjustZoom(increment: boolean): void {
    if (increment && this.zoomLevel < 3) {
      this.zoomLevel += 0.5;
      if (this.zoomLevel === 1.5) {
        // Reset position on initial zoom
        this.mouseX = 50;
        this.mouseY = 50;
      }
    } else if (!increment && this.zoomLevel > 1) {
      this.zoomLevel -= 0.5;
      if (this.zoomLevel === 1) {
        // Reset position when zooming out completely
        this.mouseX = 50;
        this.mouseY = 50;
      }
    }
  }

  selectImage(index: number): void {
    this.currentImageIndex = index;
    this.selectedImageUrl = this._http.publicUrl + this.data.item.imageUrls[index];
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
      this.minutes = Math.floor((distance / (1000 * 60)) % 60);
      this.seconds = Math.floor((distance / 1000) % 60);

      this.countdown = `${this.days} დღე ${this.hours} სთ ${this.minutes} წთ ${this.seconds} წმ`;
    }, 1000);
  }

  onMouseMove(event: MouseEvent): void {
    if (this.zoomLevel > 1) {
      const rect = this.mainImage.nativeElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      
      // Constrain values between 0 and 100
      this.mouseX = Math.max(0, Math.min(100, x));
      this.mouseY = Math.max(0, Math.min(100, y));
    }
  }

  onMouseDown(event: MouseEvent): void {
    if (this.zoomLevel > 1) {
      this.isDragging = true;
      this.onMouseMove(event);
    }
  }

  onMouseUp(): void {
    this.isDragging = false;
  }

  onMouseLeave(): void {
    this.isDragging = false;
  }
}
