import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule,FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  selectedSort: string = 'default';
  selectedCategory: string = 'all';

  @Output() filtersChanged = new EventEmitter<{ sort: string, category: string }>();

  onFilterChange() {
    this.filtersChanged.emit({
      sort: this.selectedSort,
      category: this.selectedCategory
    });
  }
}
