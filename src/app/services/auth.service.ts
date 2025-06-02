import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  private apiUrl: string = 'https://localhost:7268/api';
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private firstNameSubject = new BehaviorSubject<string>('');
  private userImageUrlSubject = new BehaviorSubject<string>('');

  constructor(
    private http: HttpClient,
    private router: Router,
    private apiService: ApiService
  ) {
    this.currentUserSubject = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
    this.checkAuthState();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  private checkAuthState(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.isLoggedInSubject.next(true);
      this.firstNameSubject.next(localStorage.getItem('firstName') ?? 'User');
      const imageUrl = localStorage.getItem('userImageUrl');
      this.userImageUrlSubject.next(
        this.apiService.getFullImageUrl(imageUrl)
      );
    } else {
      this.isLoggedInSubject.next(false);
      this.firstNameSubject.next('');
      this.userImageUrlSubject.next(this.apiService.getFullImageUrl(null));
    }
  }

  updateAuthState(): void {
    this.checkAuthState();
  }

  logout(): void {
    localStorage.clear();
    this.isLoggedInSubject.next(false);
    this.firstNameSubject.next('');
    this.userImageUrlSubject.next(this.apiService.getFullImageUrl(null));
    this.router.navigate(['/login']);
  }

  get isLoggedIn$(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  get firstName$(): Observable<string> {
    return this.firstNameSubject.asObservable();
  }

  get userImageUrl$(): Observable<string> {
    return this.userImageUrlSubject.asObservable();
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
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

  login(email: string, password: string) {
    return this.http
      .post<any>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        map((user) => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          // assume your login API also returns 'token' and 'firstName' etc.
          this.currentUserSubject.next(user);
          return user;
        })
      );
  }

  /** ← Add this method so SignalRService can read the raw token */
  public getJwtToken(): string {
    return localStorage.getItem('token') || '';
  }
}
