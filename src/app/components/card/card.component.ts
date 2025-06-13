import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { AuctionsService } from '../../serices/auctions.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent implements OnInit, OnDestroy {

  @Input() dataForChild!: any

  remainingDays: number = 0;
  remainingHours: number = 0;
  remainingMinutes: number = 0;
  remainingSeconds: number = 0;
  private timerSubscription?: Subscription;

  constructor(public _http: AuctionsService, private router: Router) {
    
  }

  ngOnInit() {
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
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
    this.router.navigate(['/details', id]);
  }

  placeBid(event: MouseEvent) {
    // Prevent the click event from bubbling up to the card
    event.preventDefault();
    event.stopPropagation();
    
    // Implement your bid logic here
    console.log('Placing bid for auction:', this.dataForChild.id);
  }

  private startTimer() {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.updateRemainingTime();
    });
  }

  private updateRemainingTime() {
    const now = new Date().getTime();
    const endTime = new Date(this.dataForChild.endTime).getTime();
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
}
