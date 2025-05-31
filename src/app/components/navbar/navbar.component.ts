// navbar.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class NavbarComponent {
  readonly isLoggedIn$;
  readonly firstName$;
  readonly userImageUrl$;

  constructor(private authService: AuthService) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.firstName$ = this.authService.firstName$;
    this.userImageUrl$ = this.authService.userImageUrl$;
  }

  logout(): void {
    this.authService.logout();
  }
}
