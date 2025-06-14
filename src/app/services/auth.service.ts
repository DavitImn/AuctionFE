import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/Auth`;
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private firstNameSubject = new BehaviorSubject<string>('');
  private userImageUrlSubject = new BehaviorSubject<string>('');

  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  firstName$ = this.firstNameSubject.asObservable();
  userImageUrl$ = this.userImageUrlSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private apiService: ApiService
  ) {
    // Check if token exists in localStorage on service initialization
    const token = localStorage.getItem('token');
    if (token) {
      this.isLoggedInSubject.next(true);
      this.loadUserProfile();
    }
  }

  updateAuthState(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.isLoggedInSubject.next(true);
      this.loadUserProfile();
    } else {
      this.isLoggedInSubject.next(false);
      this.firstNameSubject.next('');
      this.userImageUrlSubject.next('');
    }
  }

  private loadUserProfile(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<any>('https://localhost:7268/api/Users/user-profile', {
      headers,
      params: { t: Date.now().toString() }
    }).subscribe({
      next: (user) => {
        console.log('User profile:', user);
        this.firstNameSubject.next(user.firstName);
        this.userImageUrlSubject.next(this.apiService.getFullImageUrl(user.userImageUrl));
      },
      error: (err) => {
        console.error('Error loading user profile:', err);
        // Don't log out on profile load error, just clear the profile data
        this.firstNameSubject.next('');
        this.userImageUrlSubject.next('');
      }
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false);
    this.firstNameSubject.next('');
    this.userImageUrlSubject.next('');
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  async getUserId(): Promise<number | null> {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(atob(base64Payload));
      const userIdClaim =
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      return userIdClaim ? Number(userIdClaim) : null;
    } catch (err) {
      console.error('Failed to decode JWT payload:', err);
      return null;
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      map(response => {
        if (response && response.accessToken) {
          localStorage.setItem('token', response.accessToken);
          this.isLoggedInSubject.next(true);
          this.loadUserProfile();
        }
        return response;
      })
    );
  }

  /** ← Add this method so SignalRService can read the raw token */
  public getJwtToken(): string {
    return localStorage.getItem('token') || '';
  }
}
