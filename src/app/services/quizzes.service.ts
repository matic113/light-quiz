import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuizzesService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService,private dialog: MatDialog) {}

  downloadReport(code: string): Observable<string> {
    const token = this.authService.getToken();
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'No Token Found',
        text: 'You are not authenticated!',
      });
      throw new Error('No token found');
    }

      return this.http.post(`${this.baseUrl}/api/quiz/report/${code}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        responseType: 'text'
      });
    }
  
    private buildAuthHeaders(): HttpHeaders {
      const token = this.authService.getToken() || '';
      return new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
    }
  
    /** DELETE /api/quiz/{quizId} */
    deleteQuizById(quizId: string): Observable<void> {
      const url = `${this.baseUrl}/api/quiz/${quizId}`;
      return this.http.delete<void>(url, { headers: this.buildAuthHeaders() });
    }
  
    /** DELETE /api/quiz/{shortCode} */
    deleteQuizByShortCode(shortCode: string): Observable<void> {
      const url = `${this.baseUrl}/api/quiz/${shortCode}`;
      return this.http.delete<void>(url, { headers: this.buildAuthHeaders() });
    }
  }
