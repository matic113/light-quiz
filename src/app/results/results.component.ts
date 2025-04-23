import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { SidebarStateService } from '../services/sidebar-state.service';

interface QuizResult {
  quizTitle: string;
  correctQuestions: number;
  totalQuestions: number;
  grade: number;
  possiblePoints: number;
}

@Component({
  selector: 'app-results',
  imports: [
    CommonModule
  ],
  templateUrl: './results.component.html',
  styleUrl: './results.component.css',
})
export class ResultsComponent {
  isExpanded: boolean = true;

  results: QuizResult[] = [];
  isLoading = true;
  private baseUrl = 'https://api.theknight.tech';



  constructor(private http: HttpClient, private authService: AuthService,    private sidebarStateService: SidebarStateService
  ) { }


  ngOnInit(): void {
    const token = this.authService.getToken();
    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    // TODO : quiz id changes later 
    this.http.get<QuizResult[]>(`${this.baseUrl}/api/student/results`, headers)
      .subscribe({
        next: (data) => {
          this.results = data;
          this.isLoading = false;
          console.log(data);
        },
        error: () => {
          this.isLoading = false;
          // تقدر تعرض رسالة خطأ لو حبيت
        }
      });
      this.sidebarStateService.setSidebarState(true); 

      this.sidebarStateService.isExpanded$.subscribe(value => {
        this.isExpanded = value;
      
      });
  }



}
