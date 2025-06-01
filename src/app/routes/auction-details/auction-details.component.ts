import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { AuctionsService } from '../../serices/auctions.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ImageModalComponent } from '../../components/image-modal/image-modal.component';

@Component({
  selector: 'app-auction-details',
  standalone: true,
  imports: [CommonModule, ImageModalComponent],
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

  auctionDetails: any;
  selectedImage: string | null = null;

  constructor(public _http: AuctionsService, private route: ActivatedRoute) {
    this.route.params.subscribe(res => this.id = res['id']);
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

  ngOnInit(): void {
    this._http.getAuctionById(this.id).subscribe(res => {
      this.data = res;
      if (this.data?.item?.imageUrls?.length > 0) {
        this.selectedImageUrl = this._http.publicUrl + this.data.item.imageUrls[0];
      }
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
    if (this.data?.item?.imageUrls?.length > 1) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.data.item.imageUrls.length;
      this.selectedImageUrl = this._http.publicUrl + this.data.item.imageUrls[this.currentImageIndex];
    }
  }

  previousImage(): void {
    if (this.data?.item?.imageUrls?.length > 1) {
      this.currentImageIndex = this.currentImageIndex === 0 
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

    // Reset position when zooming out to 1x
    if (this.zoomLevel === 1) {
      this.mouseX = 50;
      this.mouseY = 50;
    } else {
      // Center on current mouse position when zooming in
      const rect = this.mainImage.nativeElement.getBoundingClientRect();
      const centerX = rect.left + rect.width/2;
      const centerY = rect.top + rect.height/2;
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
      
      // Calculate mouse position as percentage of image dimensions
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      
      // Calculate boundaries based on zoom level
      const maxOffset = (this.zoomLevel - 1) * 50;
      
      // Smooth movement with boundaries
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
}
