import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';

export interface AuctionData {
  auctionId: string;
  item: {
    title: string;
    description: string;
    category: string;
    condition: string;
    imageUrls: string[];
    seller: {
      firstName: string;
    };
  };
  currentPrice: number;
  startingPrice: number;
  startTime: string;
  endTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuctionsService {
  constructor(private httpService: HttpService) {}

  getAuction(id: string): Observable<AuctionData> {
    return this.httpService.get<AuctionData>(`/api/auctions/${id}`);
  }

  placeBid(auctionId: string, amount: number): Observable<AuctionData> {
    return this.httpService.post<AuctionData>(`/api/auctions/${auctionId}/bid`, { amount });
  }

  getAuctions(): Observable<AuctionData[]> {
    return this.httpService.get<AuctionData[]>('/api/auctions');
  }

  buyNow(auctionId: number): Observable<any> {
    return this.httpService.post(`/api/auctions/${auctionId}/buy-now`, {});
  }
} 