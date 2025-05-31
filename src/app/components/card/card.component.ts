import { Component, Input } from '@angular/core';
import { AuctionsService } from '../../serices/auctions.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-card',
  imports: [CommonModule,
    FormsModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {

  constructor(public _http: AuctionsService) {
    
  }
  @Input() dataForChild!: any

  // startTime = new Date(this.dataForChild.startTime.toISOString())
}
