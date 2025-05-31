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

          // 3) Decode the JWT to extract the user ID (the "nameidentifier" claim)
          //    This assumes your JWT payload contains a claim:
          //    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": "<userId>"
          let payload: any;
          try {
            const base64Payload = loginResponse.accessToken.split('.')[1];
            payload = JSON.parse(atob(base64Payload));
          } catch (err) {
            console.error('Failed to decode JWT payload:', err);
            this.errorMessage = 'Unexpected token format. Cannot retrieve user ID.';
            return;
          }

          const userIdClaim =
            payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
          if (!userIdClaim) {
            console.error('JWT does not contain a nameidentifier claim.');
            this.errorMessage = 'Cannot find user ID in token.';
            return;
          }

          const userId: number = Number(userIdClaim);
          if (isNaN(userId)) {
            console.error('Extracted userId is not a number:', userIdClaim);
            this.errorMessage = 'Invalid user ID in token.';
            return;
          }

          // 4) Fetch the user's profile (firstName + userImageUrl) by ID
          const headers = new HttpHeaders({
            Authorization: `Bearer ${loginResponse.accessToken}`,
          });

          this.http
            .get<UserProfile>(
              `${this.apiService.publicUrl}/api/Users/profile/${userId}`,
              { headers }
            )
            .subscribe({
              next: (profile) => {
                // 5) Store firstName and userImageUrl (or default) in localStorage
                localStorage.setItem('firstName', profile.firstName);
                localStorage.setItem(
                  'userImageUrl',
                  profile.userImageUrl ?? '/assets/default-avatar.png'
                );
                this.authService.updateAuthState();
                // 6) Finally, navigate to home so Navbar can re-read localStorage
                this.router.navigate(['/']);
              },
              error: (errProfile) => {
                console.error('Failed to fetch user profile:', errProfile);
                this.errorMessage = 'Login succeeded, but failed to load profile.';
              },
            });
        },
        error: (err) => {
          console.error('Login failed:', err);
          this.errorMessage = 'Login failed. Check your credentials.';
        },
      });
  }
}
