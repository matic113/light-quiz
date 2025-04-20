import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private registerUrl = 'https://api.theknight.tech/api/auth/register';
  private loginUrl = 'https://api.theknight.tech/api/auth/token';
  private tokenKey = 'auth_token';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) { }

  onSignup(userData: any): Observable<any> {
    return this.http.post(this.registerUrl, userData).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          this.router.navigate(['/create']);
        }
      }),
    );
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(this.loginUrl, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          this.router.navigate(['/create']);
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
  getRule(): string | null {
    const decoded = this.decodeToken();
    return decoded ? decoded.roles || decoded.roles : null;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');

    localStorage.removeItem('sub');
  }
}
