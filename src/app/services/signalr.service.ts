import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface NewBidPayload {
  auctionId: number;
  amount: number;
  bidderId: number;
  bidTime: string; // ISO string from server
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: HubConnection;
  private bidReceivedSubject = new Subject<NewBidPayload>();

  /** Expose as Observable so components can subscribe */
  public bidReceived$: Observable<NewBidPayload> = this.bidReceivedSubject.asObservable();

  constructor(private auth: AuthService) {}

  /** 
   * Call once (e.g. in AppComponent or before any auction page loads) 
   * to start the SignalR connection. 
   */
  public startConnection(): Promise<void> {
    if (this.hubConnection) {
      return Promise.resolve();
    }

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/auctionHub`, {
        accessTokenFactory: () => this.auth.getJwtToken()
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    // When the server sends "ReceiveNewBid", push it into our Subject
    this.hubConnection.on('ReceiveNewBid', (data: NewBidPayload) => {
      this.bidReceivedSubject.next(data);
    });

    return this.hubConnection
      .start()
      .then(() => console.log('SignalR: Connected'))
      .catch(err => {
        console.error('SignalR: Connection error', err);
        throw err;
      });
  }

  /**
   * Join the group for a specific auction (must match the C# group name "auction-{auctionId}").
   */
  public joinAuctionGroup(auctionId: number): Promise<void> {
    if (!this.hubConnection || this.hubConnection.state !== 'Connected') {
      return Promise.reject('SignalR: Hub is not connected yet.');
    }
    return this.hubConnection.invoke('JoinAuctionGroup', auctionId.toString());
  }

  /**
   * (Optional) Leave the group when the user navigates away.
   */
  public leaveAuctionGroup(auctionId: number): Promise<void> {
    if (!this.hubConnection || this.hubConnection.state !== 'Connected') {
      return Promise.resolve();
    }
    return this.hubConnection.invoke('LeaveAuctionGroup', auctionId.toString());
  }
}
