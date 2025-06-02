import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface BidCreateDto {
  auctionId: number;
  amount: number;
}

export interface BidOutputDto {
  bidId: number;
  auctionId: number;
  bidderId: number;
  bidderName: string;
  amount: number;
  bidTime: Date;
  isWinning: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BidService {
  apiUrl: string = 'https://localhost:7268/api';

  constructor(private _http: HttpClient) { }

  placeBid(bid: BidCreateDto): Observable<BidOutputDto> {
    return this._http.post<BidOutputDto>(`${this.apiUrl}/Bids/bid`, bid);
  }

  getAuctionBids(auctionId: number): Observable<BidOutputDto[]> {
    return this._http.get<BidOutputDto[]>(`${this.apiUrl}/Bids/auction/${auctionId}`);
  }

  getUserBids(): Observable<BidOutputDto[]> {
    return this._http.get<BidOutputDto[]>(`${this.apiUrl}/Bids/user`);
  }
} 