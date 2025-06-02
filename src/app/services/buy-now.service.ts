import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';

export interface BuyNowCreateDto {
  auctionId: number;
  price: number;
}

export interface BuyNowOutputDto {
  id: number;
  auctionId: number;
  itemTitle: string;
  price: number;
  purchaseTime: Date;
  buyNowId: number;
  buyerName: string;
}

@Injectable({
  providedIn: 'root'
})
export class BuyNowService {
  constructor(private httpService: HttpService) {}

  buyNow(dto: BuyNowCreateDto): Observable<BuyNowOutputDto> {
    return this.httpService.post<BuyNowOutputDto>('/api/BuyNow', dto);
  }

  getMyPurchases(): Observable<BuyNowOutputDto[]> {
    return this.httpService.get<BuyNowOutputDto[]>('/api/BuyNow/my-purchases');
  }
} 