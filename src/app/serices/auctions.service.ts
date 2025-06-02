import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuctionsService {

  apiUrl: string = 'https://localhost:7268/api'
  publicUrl: string = 'https://localhost:7268'

  constructor(private _http: HttpClient) { }
 
  getAuctions(endpoint: string = 'auctions')
  {
    return this._http.get(`${this.apiUrl}/Auctions/${endpoint}`)
  }

  getAuctionById(id: number)
  {
    return this._http.get(`${this.apiUrl}/Auctions/get-auction?auctionid=${id}`)
  }
}
