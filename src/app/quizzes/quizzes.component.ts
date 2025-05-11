import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, CategoryScale, LinearScale, BarElement, ArcElement, BarController, PieController, Title, Tooltip, Legend } from 'chart.js';

import { AuthService } from '../auth/auth.service';
import { QuizzesService } from '../services/quizzes.service';
import { SidebarStateService } from '../services/sidebar-state.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  BarController,
  PieController,
  Title,
  Tooltip,
  Legend
);

// Interfaces -----------------------------------------------------------
interface Quiz {
  title: string;
  type: string;
  points: number;
  date: string;
  time: string;
  code?: string;
  reportData?: ReportData;
  groupName: string;
  isStarted: boolean;
  groupId?: string;
  timeAllowed: number;
}

interface Group {
  groupId: string;
  name: string;
}

interface ReportData {
  examName: string;
  course: string;
  totalQuestions: number;
  examType: string;
  dateTime: string;
  duration: string;
  totalMarks: number;
  passMarks: number;
  totalStudents: number;
  averageScore: number;
  totalAbsent: number;
  totalFinished: number;
  totalPassed: number;
  totalFailed: number;
  students: Student[];
  gradeDistribution: GradeDistribution;
  timeUtilization: TimeUtilization;
  questionPerformance: QuestionPerformance;
}

interface Student {
  name: string;
  status: string;
  score: number;
  scorePercentage: number;
  grade: string;
  timeSpent: string;
  submittedTime: string;
}

interface GradeDistribution {
  excellent: number;
  good: number;
  poor: number;
}

interface TimeUtilization {
  avgTimeSpent: number;
  allocatedTime: number;
  timePercentage: number;
}

interface QuestionPerformance {
  topCorrect: { text: string; correctRate: number }[];
  topIncorrect: { text: string; incorrectRate: number }[];
}

interface StudentResponse {
  studentId: string;
  studentName: string;
  studentEmail: string;
  quizId: string;
  quizShortCode: string;
  grade: number;
  possiblePoints: number;
  gradedAt: string;
  correctQuestions: number;
  totalQuestions: number;
}

// Component -------------------------------------------------------------
@Component({
  selector: 'app-quizzes',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective,MatIconModule,MatButtonModule,MatTooltipModule  ],
  templateUrl: './quizzes.component.html',
  styleUrls: ['./quizzes.component.css']
})
export class QuizzesComponent implements OnInit {
  // Properties
  groups: Group[] = [];
  upcomingQuizzes: Quiz[] = [];
  completedQuizzes: Quiz[] = [];

  isLoadingGroups = false;
  isLoadingQuizzes = false;
  isExpanded = true;
  isMobile = true;

  baseUrl = 'https://api.theknight.tech';

  showReportPopup = false;
  selectedReport: ReportData | null = null;
  filteredStudents: Student[] = [];
  searchQuery = '';
  currentQuiz: Quiz | null = null;

  showResponsesPopup = false;
  selectedResponses: StudentResponse[] = [];
  isLoadingResponses = false;

  // Grade Pie Chart
  gradePieChartType = 'pie' as const;
  gradePieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Excellent', 'Good', 'Poor'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#10b981', '#3b82f6', '#ef4444'],
      hoverOffset: 20
    }]
  };
  gradePieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { animateScale: true, animateRotate: true, duration: 1000 },
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 15 } },
      tooltip: {
        backgroundColor: '#333',
        callbacks: { label: (context) => `${context.label}: ${context.parsed}%` }
      }
    }
  };

  // Time Bar Chart
  timeBarChartType = 'bar' as const;
  timeBarChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Time Utilization'],
    datasets: [{
      label: 'Time Spent',
      data: [0],
      backgroundColor: '#3b82f6',
      borderRadius: 4
    }]
  };
  timeBarChartOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000, easing: 'easeInOutQuad' },
    scales: {
      x: {
        type: 'linear',
        min: 0,
        max: 100,
        ticks: { callback: (value) => `${value}%` },
        grid: { display: false }
      },
      y: { type: 'category', grid: { display: false } }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#333',
        callbacks: { label: (context) => `Time Spent: ${context.parsed.x}%` }
      }
    }
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private quizService: QuizzesService,
    private http: HttpClient,
    private sidebarStateService: SidebarStateService
  ) {}

  // Life Cycle ----------------------------------------------------------
  ngOnInit(): void {
    this.fetchGroups();
    this.sidebarStateService.setSidebarState(true);

    this.sidebarStateService.isExpanded$.subscribe(value => this.isExpanded = value);
    this.sidebarStateService.isMobile$.subscribe(value => this.isMobile = value);
  }

  // Methods -------------------------------------------------------------

  fetchGroups(): void {
    const token = this.authService.getToken();
    if (!token) return;

    this.isLoadingGroups = true;
    this.http.get<any[]>(`${this.baseUrl}/api/group/created`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: groupsData => {
        this.groups = groupsData.map(g => ({ groupId: g.groupId, name: g.name }));
        this.isLoadingGroups = false;
        this.fetchQuizzes();
      },
      error: err => {
        console.error('Error fetching groups:', err);
        this.isLoadingGroups = false;
      }
    });
  }

  fetchQuizzes(): void {
    const token = this.authService.getToken();
    if (!token) return;

    this.isLoadingQuizzes = true;
    this.http.get<any[]>(`${this.baseUrl}/api/quiz/all`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: data => {
        const now = new Date();
        const mapToQuiz = (q: any): Quiz => ({
          title: q.title,
          type: q.type || 'standard',
          points: q.possiblePoints,
          date: this.formatDate(q.startsAt),
          time: this.formatTime(q.startsAt),
          code: q.shortCode,
          groupName: this.getGroupName(q.groupId),
          isStarted: q.didStartQuiz,
          groupId: q.groupId,
          timeAllowed: q.timeAllowed || 0
        });

        this.upcomingQuizzes = data.filter(q => new Date(q.startsAt) > now).map(mapToQuiz);
        this.completedQuizzes = data.filter(q => new Date(q.startsAt) <= now).map(mapToQuiz);

        this.cdr.detectChanges();
        this.isLoadingQuizzes = false;
      },
      error: err => {
        console.error('Error fetching quizzes:', err);
        this.isLoadingQuizzes = false;
      }
    });
  }

  getGroupName(groupId: string): string {
    const group = this.groups.find(g => g.groupId === groupId);
    return group ? group.name : '';
  }

  formatDate(dateTimeString: string): string {
    return new Date(dateTimeString).toLocaleDateString();
  }

  formatTime(dateTimeString: string): string {
    return new Date(dateTimeString).toLocaleTimeString();
  }

  copyExamLink(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      Swal.mixin({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true
      }).fire({
        icon: 'success',
        title: 'Exam code copied successfully!'
      });
    });
  }

  downloadReport(code: string): void {
    this.quizService.downloadReport(code).subscribe({
      next: (response) => {
        if (response) {
          window.open(response);
        } else {
          Swal.fire({ icon: 'error', title: 'Error', text: 'No report URL returned.' });
        }
      },
      error: (err) => {
        console.error('Error downloading report:', err);
        Swal.fire({ icon: 'error', title: 'Error', text: 'There was an issue with downloading the report.' });
      }
    });
  }

  showReport(quiz: { code: string }): void {
    if (!quiz.code) return;
    this.fetchReportData(quiz.code);
    this.currentQuiz = [...this.upcomingQuizzes, ...this.completedQuizzes].find(q => q.code === quiz.code) || null;
  }

  closeReport(): void {
    this.showReportPopup = false;
    this.selectedReport = null;
    this.searchQuery = '';
    this.filteredStudents = [];
  }

  filterStudents(): void {
    if (!this.selectedReport) return;
    this.filteredStudents = this.searchQuery
      ? this.selectedReport.students.filter(student =>
          student.name.toLowerCase().includes(this.searchQuery.toLowerCase()))
      : [...this.selectedReport.students];
  }

  private fetchReportData(shortCode: string): void {
    const token = this.authService.getToken();
    if (!token) return;
  
    const headers = { Authorization: `Bearer ${token}` };
  
    // استدعاء بيانات الاختبار والطلاب
    const quizInfo$      = this.http.get<any>(`${this.baseUrl}/api/analytics/quiz/${shortCode}`, { headers });
    const topStudents$   = this.http.get<any>(`${this.baseUrl}/api/analytics/quiz/${shortCode}/top-students?limit=1000`, { headers });
    // استدعاء بيانات الأسئلة الأسهل والأصعب
    const questionsStats$ = this.http.get<{
      quizShortCode: string;
      easiestQuestions: { questionText: string; correctAnswers: number; wrongAnswers: number; totalAnswers: number }[];
      hardestQuestions: { questionText: string; correctAnswers: number; wrongAnswers: number; totalAnswers: number }[];
    }>(`${this.baseUrl}/api/analytics/quiz/${shortCode}/top-questions`, { headers });
  
    forkJoin([ quizInfo$, topStudents$, questionsStats$ ]).subscribe({
      next: ([ quizInfo, topStudents, stats ]) => {
        // تجهيز بيانات الطلاب كما في السابق
        const students: Student[] = topStudents.studentsGrades.map((s: any) => ({
          name: s.fullName,
          status: s.score >= (quizInfo.possiblePoints * 0.5) ? 'Passed' : 'Failed',
          score: s.score,
          scorePercentage: quizInfo.possiblePoints
            ? Math.round((s.score / quizInfo.possiblePoints) * 100)
            : 0,
          grade: this.getGrade(s.score, quizInfo.possiblePoints),
          timeSpent: this.secondsToMinutes(s.secondsSpent),
          submittedTime: this.formatDateTime(s.submissionDate)
        }));
  
        // حساب التوزيع الزمني والدرجات كما في كودك الحالي
        const totalStudentsCount = students.length || 1;
        const gradeDistribution: GradeDistribution = { excellent: 0, good: 0, poor: 0 };
        students.forEach(st => {
          if (st.grade === 'Excellent') gradeDistribution.excellent++;
          else if (st.grade === 'good') gradeDistribution.good++;
          else gradeDistribution.poor++;
        });
        gradeDistribution.excellent = Math.round(gradeDistribution.excellent / totalStudentsCount * 100);
        gradeDistribution.good  =   Math.round(gradeDistribution.good / totalStudentsCount * 100)  ;
        gradeDistribution.poor     = Math.round(gradeDistribution.poor     / totalStudentsCount * 100);
  
        const avgSecondsSpent = students.reduce((sum, s) => sum + this.minutesToSeconds(s.timeSpent), 0) / students.length;
        const avgTimeSpent    = Math.round(avgSecondsSpent / 60);
        const allocatedTime   = quizInfo.quizDuration;
        const timePercentage  = allocatedTime ? Math.round(avgTimeSpent / allocatedTime * 100) : 0;
  
        // حساب نسب الأسئلة الأسهل والأصعب
        const topCorrect = stats.easiestQuestions.map(q => ({
          text: q.questionText,
          correctRate: q.totalAnswers
            ? Math.round(q.correctAnswers / q.totalAnswers * 100)
            : 0
        }));
        const topIncorrect = stats.hardestQuestions.map(q => ({
          text: q.questionText,
          incorrectRate: q.totalAnswers
            ? Math.round(q.wrongAnswers / q.totalAnswers * 100)
            : 0
        }));
  
        // تجميع كل البيانات في الـ reportData
        const reportData: ReportData = {
          examName:      quizInfo.quizName,
          course:        '—',
          totalQuestions:quizInfo.numberOfQuestions,
          examType:      'All in one exam',
          dateTime:      this.formatDateTime(quizInfo.quizDateTime),
          duration:      `${quizInfo.quizDuration} Min`,
          totalMarks:    quizInfo.possiblePoints,
          passMarks:     Math.ceil(quizInfo.possiblePoints * 0.5),
          totalStudents: quizInfo.numberOfStudents,
          averageScore: parseFloat(
            (
              students.reduce((sum, s) => sum + s.score, 0) 
              / students.length
            ).toFixed(3)
          ),
                    totalAbsent:   quizInfo.numberOfStudents - students.length,
          totalFinished: students.length,
          totalPassed:   students.filter(s => s.status === 'Passed').length,
          totalFailed:   students.filter(s => s.status === 'Failed').length,
          students,
          gradeDistribution,
          timeUtilization: { avgTimeSpent, allocatedTime, timePercentage },
          questionPerformance: {
            topCorrect,
            topIncorrect
          }
        };
  
        this.selectedReport = reportData;
        this.filteredStudents = [...students];
        this.updateCharts(reportData);
        this.showReportPopup = true;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error fetching report data:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Unable to fetch report data.',
        });
      }
    });
  }

  private getGrade(score: number, total: number): string {
    const percentage = (score / total) * 100;
    if (percentage >= 85) return 'Excellent';
    if (percentage >= 50) return 'good';
    return 'poor';
  }

  private secondsToMinutes(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  private minutesToSeconds(time: string): number {
    const [mins, secs] = time.split(':').map(Number);
    return (mins * 60) + secs;
  }

  private formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString();
  }

  private updateCharts(report: ReportData): void {
    this.gradePieChartData.datasets[0].data = [
      report.gradeDistribution.excellent,
      report.gradeDistribution.good,
      report.gradeDistribution.poor
    ];
    this.timeBarChartData.datasets[0].data = [report.timeUtilization.timePercentage];
  }

  deleteQuiz(quiz: Quiz): void {
    if (!quiz.code) {
      Swal.fire('Error', 'No quiz code available to delete.', 'error');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete quiz "${quiz.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then(result => {
      if (result.isConfirmed) {
        this.quizService.deleteQuizByShortCode(quiz.code!).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'The quiz has been deleted.', 'success');
            this.fetchQuizzes();
          },
          error: err => {
            console.error('Delete quiz error:', err);
            Swal.fire('Error', 'Could not delete the quiz.', 'error');
          }
        });
      }
    });
  }

  showResponses(quizShortCode: string): void {
    this.isLoadingResponses = true;
    this.http.get<StudentResponse[]>(`${this.baseUrl}/api/quiz/responses/${quizShortCode}`, {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`,
      },
    }).subscribe({
      next: (responses) => {
        this.selectedResponses = responses;
        this.showResponsesPopup = true;
        this.isLoadingResponses = false;
      },
      error: (err) => {
        console.error('Error fetching responses:', err);
        this.isLoadingResponses = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch student responses'
        });
      }
    });
  }

  closeResponses(): void {
    this.showResponsesPopup = false;
    this.selectedResponses = [];
  }

  showManualGrading(response: StudentResponse): void {
    // This will be implemented later
    Swal.fire({
      icon: 'info',
      title: 'Coming Soon',
      text: 'Manual grading feature will be available soon!'
    });
  }

}
