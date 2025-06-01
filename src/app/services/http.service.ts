import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  public readonly publicUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.publicUrl}${endpoint}`, data);
  }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.publicUrl}${endpoint}`);
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.publicUrl}${endpoint}`, data);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.publicUrl}${endpoint}`);
  }
} 