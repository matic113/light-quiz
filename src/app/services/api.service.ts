import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;
  private readonly apiHost = environment.apiHost;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Get the base API URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Get the API host URL
   */
  getApiHost(): string {
    return this.apiHost;
  }

  /**
   * Build authorization headers with the current token
   */
  private buildAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken() || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Generic GET request with authentication
   */
  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    const url = `${this.apiHost}${endpoint}`;
    return this.http.get<T>(url, {
      headers: this.buildAuthHeaders(),
      params
    });
  }

  /**
   * Generic POST request with authentication
   */
  post<T>(endpoint: string, body: any, responseType?: 'json' | 'text'): Observable<T> {
    const url = `${this.apiHost}${endpoint}`;
    return this.http.post<T>(url, body, {
      headers: this.buildAuthHeaders(),
      responseType: responseType as any
    });
  }

  /**
   * Generic PUT request with authentication
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.apiHost}${endpoint}`;
    return this.http.put<T>(url, body, {
      headers: this.buildAuthHeaders()
    });
  }

  /**
   * Generic DELETE request with authentication
   */
  delete<T>(endpoint: string): Observable<T> {
    const url = `${this.apiHost}${endpoint}`;
    return this.http.delete<T>(url, {
      headers: this.buildAuthHeaders()
    });
  }

  /**
   * GET request without authentication
   */
  getPublic<T>(endpoint: string, params?: HttpParams): Observable<T> {
    const url = `${this.apiHost}${endpoint}`;
    return this.http.get<T>(url, { params });
  }

  /**
   * POST request without authentication
   */
  postPublic<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.apiHost}${endpoint}`;
    return this.http.post<T>(url, body);
  }
} 