import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';


export interface DashboardStats {
  userId: string;
  totalGroups: number;
  quizzesCreated: number;
  totalStudents: number;
  totalQuestions: number;
  upcomingQuizzesCount: number;
}

export interface TopOrBotStudents {
  quizId: string;
  studentsGrades: {
    studentId: string;
    fullName: string;
    score: number;
    secondsSpent: number;
    submissionDate: string;
  }[];
}

export interface LastQuiz {
  quizId: string;
  shortCode: string;
  title: string;
  description: string;
  timeAllowed: number;
  startsAt: string;
  numberOfQuestions: number;
  possiblePoints: number;
  didStartQuiz: boolean;
  groupId: string;
  anonymous: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  baseUrl: string = "https://api.theknight.tech";


  dashboardStats: DashboardStats | null = null;
  topStudents: TopOrBotStudents | null = null;
  botStudents: TopOrBotStudents | null = null;
  lastQuiz: LastQuiz | null = null;

  quickStats: any[] = [];

  constructor(private cdr: ChangeDetectorRef,
    private http: HttpClient,
    public authService: AuthService,
  ) { }

  ngOnInit(): void {
    try {
      this.getLastQuiz();
      this.initializeDashboard();
      this.getDashboardStats();
    } catch (error) {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }


  async getDashboardStats() {
    const token = this.authService.getToken();
    if (!token) return;

    this.http.get<DashboardStats>(`${this.baseUrl}/api/analytics/groups/stats`, { headers: { 'Authorization': `Bearer ${token}` } }).subscribe(
      (data: DashboardStats) => {
        this.dashboardStats = data;
        this.quickStats = [
          { title: 'Total Groups', value: this.dashboardStats?.totalGroups.toString() || '0', icon: '📘' },
          { title: 'Total Students', value: this.dashboardStats?.totalStudents.toString() || '0', icon: '👩‍🎓' },
          { title: 'Quizzes Created', value: this.dashboardStats?.quizzesCreated.toString() || '0', icon: '📊' },
          { title: 'Total Questions', value: this.dashboardStats?.totalQuestions.toString() || '0', icon: '❓' },
          { title: 'Upcoming Quizzes', value: this.dashboardStats?.upcomingQuizzesCount.toString() || '0', icon: '⏳' },
        ];
      },
      (error) => {
        console.error('Error fetching dashboard stats:', error);
      }

    );
  }


  async getTopStudents(shortCode: string) {
    const token = this.authService.getToken();
    if (!token) return;

    this.http.get<TopOrBotStudents>(`${this.baseUrl}/api/analytics/quiz/${shortCode}/top-students?limit=5`, { headers: { 'Authorization': `Bearer ${token}` } }).subscribe(
      (data: TopOrBotStudents) => {
        this.topStudents = data;
      },
      (error) => {
        console.error('Error fetching top students:', error);
      }
    );
  }


  async getBotStudents(shortCode: string) {
    const token = this.authService.getToken();
    if (!token) return;

    this.http.get<TopOrBotStudents>(`${this.baseUrl}/api/analytics/quiz/${shortCode}/bot-students?limit=5`,
      { headers: { 'Authorization': `Bearer ${token}` } }).subscribe(
        (data: TopOrBotStudents) => {
          this.botStudents = data;
        },
        (error) => {
          console.error('Error fetching bot students:', error);
        }
      );
  }


  async getLastQuiz() {
    const token = this.authService.getToken();
    if (!token) return;

    this.http.get<any[]>(`${this.baseUrl}/api/quiz/all`, { headers: { 'Authorization': `Bearer ${token}` } }).subscribe(
      (data: any[]) => {
        if (data && data.length > 0) {
          const currentTime = new Date();
          // Find the last quiz current time >= startsAt
          for (let i = data.length - 1; i >= 0; i--) {
            const quizStartTime = new Date(data[i].startsAt);
            if (currentTime >= quizStartTime) {
              this.lastQuiz = data[i];
              this.getTopStudents(this.lastQuiz!.shortCode);
              this.getBotStudents(this.lastQuiz!.shortCode);
              break;
            }
          }
        }
      },
      (error) => {
        console.error('Error fetching last group:', error);
      }
    );
  }



  initializeDashboard(): void {
    setTimeout(() => {
      try {
        this.isLoading = false;
        this.cdr.detectChanges();
      } catch (error) {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }, 100);
  }

  getScoreColorClass(score: number): string {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  }

}