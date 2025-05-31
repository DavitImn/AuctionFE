import { Component, OnInit } from '@angular/core';
import { CardComponent } from '../../components/card/card.component';
import { AuctionsService } from '../../serices/auctions.service';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-home',
  imports: [CardComponent, CommonModule, SidebarComponent,FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  originalData: any[] = [];      // Store full auction list
  dataForParent: any[] = [];     // Displayed (filtered) auctions

  constructor(private _http: AuctionsService) {}

  ngOnInit() {
    this._http.getAuctions().subscribe(response => {
      this.originalData = response as any[];
this.dataForParent = [...this.originalData];
      console.log(response);
    });
  }

  applyFilters(filters: { sort: string; category: string }) {
    let filtered = [...this.originalData];

    if (filters.category !== 'all') {
      filtered = filtered.filter(item => 
        item.item.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.sort === 'lowToHigh') {
      filtered.sort((a, b) => a.startingPrice - b.startingPrice);
    } else if (filters.sort === 'highToLow') {
      filtered.sort((a, b) => b.startingPrice - a.startingPrice);
    }

    this.dataForParent = filtered;
  }
}
