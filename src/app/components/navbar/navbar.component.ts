// navbar.component.ts
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class NavbarComponent {
  readonly isLoggedIn$;
  readonly firstName$;
  readonly userImageUrl$;
  searchQuery: string = '';

  constructor(private authService: AuthService, private router: Router) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.firstName$ = this.authService.firstName$;
    this.userImageUrl$ = this.authService.userImageUrl$;

    this.isLoggedIn$.subscribe(val => console.log('Navbar isLoggedIn$', val));
    this.firstName$.subscribe(val => console.log('Navbar firstName$', val));
    this.userImageUrl$.subscribe(val => console.log('Navbar userImageUrl$', val));
  }

  logout(): void {
    this.authService.logout();
  }

  onSearch(event: Event) {
    event.preventDefault();
    if (this.searchQuery && this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery.trim() } });
    }
  }
}
