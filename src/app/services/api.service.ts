import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'https://localhost:7268';

  constructor() {}

  get publicUrl(): string {
    return this.baseUrl;
  }

  getFullImageUrl(path: string | null): string {
    if (!path) {
      return '/assets/default-avatar.png';
    }
    if (path.startsWith('http')) {
      return path;
    }
    if (path.startsWith('/')) {
      return `${this.baseUrl}${path}`;
    }
    return `${this.baseUrl}/${path}`;
  }
} 