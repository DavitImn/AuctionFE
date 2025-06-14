import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  loading = true;
  error: string | null = null;

  constructor(private http: HttpClient, private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.error = 'Not authenticated.';
      this.loading = false;
      return;
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    this.http.get<any>('https://localhost:7268/api/Users/user-profile', { headers }).subscribe({
      next: (data) => {
        this.user = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load profile.';
        this.loading = false;
      }
    });
  }

  getFullImageUrl(path: string | null): string {
    return this.apiService.getFullImageUrl(path);
  }
}
