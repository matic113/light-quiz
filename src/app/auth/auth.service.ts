import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private registerUrl = `${environment.apiHost}/auth/register`;
  private loginUrl = `${environment.apiHost}/auth/token`;
  private tokenKey = 'auth_token';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) { }

  private getDefaultRoute(): string {
    const role = this.getRole();
    return role === 'teacher' ? '/create' : '/quiz';
  }

  onSignup(userData: any): Observable<any> {
    return this.http.post(this.registerUrl, userData).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          this.router.navigate([this.getDefaultRoute()]);
        }
      }),
    );
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(this.loginUrl, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          this.router.navigate([this.getDefaultRoute()]);
        }
      }),
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }
  decodeToken(): any {
    const token = this.getToken();
    if (!token) {
      console.error('No token found in localStorage');
      return null;
    }
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Invalid token:', error);
      return null;
    }
  }

  getFirstname(): string | null {
    const decoded = this.decodeToken();
    console.log('Decoded Token Data:', decoded);
    console.log('Decoded Token Data:');
    return decoded ? decoded.sub || decoded.sub : null;
  }

  getStudentId(): string | null {
    const decoded = this.decodeToken();
    return decoded ? decoded.userId || decoded.userId : null;
  }
  getRole(): string | null {
    const decoded = this.decodeToken();
    if (!decoded) return null;
    
    // Handle both array and single string cases
    const roles = decoded.roles;
    if (Array.isArray(roles)) {
      return roles[0]; // Return first role if it's an array
    }
    return roles || null;
  }

  logout(): void {
    // Clear all auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('sub');
    
    // Navigate to login page after logout
    this.router.navigate(['/login']);
  }
}
