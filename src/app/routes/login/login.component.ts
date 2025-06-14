// login.component.ts
import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

interface LoginResponse {
  // Match whatever your backend actually returns for /api/Auth/login
  accessToken: string;
  refreshToken: string;
  expiration: string;
  // (If your backend also returns firstName / userImageUrl here, you could skip the second call.
  //  But according to the sample you provided, it only returns tokens + expiration.)
}

interface UserProfile {
  id: number;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  userImageUrl: string | null;
  // … other fields omitted for brevity
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData = {
    userName: '',
    password: '',
  };

  errorMessage: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  onSubmit(): void {
    // 1) Call /api/Auth/login
    this.http
      .post<LoginResponse>(
        `${this.apiService.publicUrl}/api/Auth/login`,
        this.loginData
      )
      .subscribe({
        next: (loginResponse) => {
          // 2) Store the raw JWT in localStorage
          localStorage.setItem('token', loginResponse.accessToken);
          localStorage.setItem('refreshToken', loginResponse.refreshToken);
          this.authService.updateAuthState();
          // 3) Just navigate to home after login
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Login failed:', err);
          this.errorMessage = 'Login failed. Check your credentials.';
        },
      });
  }
}
