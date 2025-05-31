import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private firstNameSubject = new BehaviorSubject<string>('');
  private userImageUrlSubject = new BehaviorSubject<string>('');

  constructor(private router: Router, private apiService: ApiService) {
    this.checkAuthState();
  }

  private checkAuthState(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.isLoggedInSubject.next(true);
      this.firstNameSubject.next(localStorage.getItem('firstName') ?? 'User');
      const imageUrl = localStorage.getItem('userImageUrl');
      this.userImageUrlSubject.next(this.apiService.getFullImageUrl(imageUrl));
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
} 