import { Component, OnInit } from '@angular/core';
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
export class AuctionDetailsComponent implements OnInit {
  id!: number;
  data: any;
  selectedImageUrl: string = '';
  countdown: string = '';

  constructor(public _http: AuctionsService, private route: ActivatedRoute) {
    this.route.params.subscribe(res => this.id = res['id']);
  }

  days: number = 0;
hours: number = 0;
minutes: number = 0;
seconds: number = 0;

  ngOnInit(): void {
    this._http.getAuctionById(this.id).subscribe(res => {
      this.data = res;
      this.selectedImageUrl = this._http.publicUrl + this.data.item.imageUrls[0];
      this.startCountdown();
    });
  }

  startCountdown() {
  setInterval(() => {
    const now = new Date().getTime();
    const end = new Date(this.data.endTime).getTime();
    const distance = end - now;

    if (distance <= 0) {
      this.countdown = 'აუქციონი დასრულდა';
      this.days = this.hours = this.minutes = this.seconds = 0;
      return;
    }

    this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
    this.hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    this.minutes = Math.floor((distance / (1000 * 60)) % 60);
    this.seconds = Math.floor((distance / 1000) % 60);

    this.countdown = `${this.days} დღე ${this.hours} სთ ${this.minutes} წთ ${this.seconds} წმ`;
  }, 1000);
}
 
}
