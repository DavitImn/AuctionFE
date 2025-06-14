import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../components/card/card.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-my-aucitons',
  standalone: true,
  imports: [CommonModule, CardComponent, SidebarComponent],
  templateUrl: './my-aucitons.component.html',
  styleUrl: './my-aucitons.component.css'
})
export class MyAucitonsComponent implements OnInit {
  auctions: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(private http: HttpClient, private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadMyAuctions();
  }

  loadMyAuctions(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.error = 'Not authenticated.';
      this.loading = false;
      return;
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    this.http.get<any[]>('https://localhost:7268/api/Auctions/my-auctions', { headers }).subscribe({
      next: (data) => {
        this.auctions = (data || []).filter(item => !item.isDeleted).map(item => ({
          id: item.auctionId,
          title: item.item.title,
          description: item.item.description,
          imageUrl: item.item.imageUrls[0],
          category: item.item.category,
          condition: item.item.condition,
          seller: item.item.seller?.firstName || '',
          startingPrice: item.startingPrice,
          currentPrice: item.currentPrice,
          buyNowPrice: item.currentPrice,
          timeLeft: this.calculateTimeLeft(item.endTime),
          status: item.status,
          startTime: item.startTime,
          endTime: item.endTime
        }));
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load your auctions.';
        this.loading = false;
      }
    });
  }

  calculateTimeLeft(endTime: string) {
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

  getFullImageUrl(path: string | null): string {
    return this.apiService.getFullImageUrl(path);
  }
}
