import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class QuizzesService {

  private baseUrl = 'https://api.theknight.tech';

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
  
    
  }
