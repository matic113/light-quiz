import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Chart,
  ChartConfiguration,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  BarController,
  PieController,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { AuthService } from '../auth/auth.service';
import { QuizzesService } from '../services/quizzes.service';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { SidebarStateService } from '../services/sidebar-state.service';

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
// -------------------------------------------------
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

}
interface Group {
  groupId: string;
  name: string;
}
// ---------------------------------------------------------
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
  average: number;
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

@Component({
  selector: 'app-quizzes',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './quizzes.component.html',
  styleUrls: ['./quizzes.component.css']
})
export class QuizzesComponent  {
  // -----------------------------------------------------------------------
  groups: Group[] = [];
  upcomingQuizzes: Quiz[] = [];
  completedQuizzes: Quiz[] = [];
  isLoadingGroups = false;
  isLoadingQuizzes = false;
  private baseUrl = 'https://api.theknight.tech';
  ngOnInit(): void {
    this.fetchGroups();
    this.sidebarStateService.setSidebarState(true);

    this.sidebarStateService.isExpanded$.subscribe(value => {
      this.isExpanded = value;
    });

    this.sidebarStateService.isMobile$.subscribe(isMobile => {
      this.isMobile = isMobile;
    });
  }

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
          reportData: this.getReportData(
            q.title,
            q.course || '—',
            `${this.formatDate(q.startsAt)} ${this.formatTime(q.startsAt)}`
          )
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
    const date = new Date(dateTimeString);
    return date.toLocaleDateString(); 
  }

  formatTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString(); 
  }
  copyExamLink(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      // Sweet alert toast notification
      const Toast = Swal.mixin({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true
      });

      Toast.fire({
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
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No report URL returned.',
          });
        }
      },
      error: (err) => {
        console.error('Error downloading report:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'There was an issue with downloading the report.',
        });
      }
    });
  }
  constructor(private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private quizService: QuizzesService,
    private http: HttpClient,
    private sidebarStateService: SidebarStateService
    
  ) {}
  isExpanded: boolean = true;
  isMobile: boolean = true;
// -----------------------------------------------------------------------
  showReportPopup: boolean = false;
  selectedReport: ReportData | null = null;
  filteredStudents: Student[] = [];
  searchQuery: string = '';

  // Grade Distribution Pie Chart
  gradePieChartType = 'pie' as const;
  gradePieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Excellent', 'Average', 'Poor'],
    datasets: [{
      data: [0, 0, 0], // Will be updated dynamically
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

  // Time Utilization Horizontal Bar Chart
  timeBarChartType = 'bar' as const;
  timeBarChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Time Utilization'],
    datasets: [
      {
        label: 'Time Spent',
        data: [0], // Will be updated dynamically
        backgroundColor: '#3b82f6',
        borderRadius: 4
      }
    ]
  };

  timeBarChartOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000, easing: 'easeInOutQuad' },
    scales: {
      x: {
        type: 'linear',
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
  showReport(quiz: Quiz): void {
    if (!quiz.reportData) return;              // نضمن وجود البيانات
    this.selectedReport = quiz.reportData;
    this.filteredStudents = [...quiz.reportData.students];
  
    // تحديث رسم التوزيع
    this.gradePieChartData.datasets[0].data = [
      quiz.reportData.gradeDistribution.excellent,
      quiz.reportData.gradeDistribution.average,
      quiz.reportData.gradeDistribution.poor
    ];
    // تحديث رسم استغلال الوقت
    this.timeBarChartData.datasets[0].data = [
      quiz.reportData.timeUtilization.timePercentage
    ];
  
    this.showReportPopup = true;               // فتح البوب-أب
    this.cdr.detectChanges();
  }

  closeReport(): void {
    this.showReportPopup = false;
    this.selectedReport = null;
    this.searchQuery = '';
    this.filteredStudents = [];
  }

  filterStudents(): void {
    if (!this.selectedReport) return;
    if (!this.searchQuery) {
      this.filteredStudents = [...this.selectedReport.students];
    } else {
      this.filteredStudents = this.selectedReport.students.filter((student: Student) =>
        student.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }

  getReportData(examName: string, course: string, dateTime: string): ReportData {
    const students: Student[] = [
      { name: 'Anaru Hakopa', status: 'Passed', score: 45, scorePercentage: 90, grade: 'Excellent', timeSpent: '25 Min', submittedTime: '2025-03-10, 14:25' },
      { name: 'Balveer Bhadlar', status: 'Passed', score: 38, scorePercentage: 76, grade: 'Average', timeSpent: '28 Min', submittedTime: '2025-03-10, 14:28' },
      { name: 'Sanne Viscaal', status: 'Passed', score: 42, scorePercentage: 84, grade: 'Excellent', timeSpent: '22 Min', submittedTime: '2025-03-10, 14:22' },
      { name: 'Tua Manuera', status: 'Failed', score: 18, scorePercentage: 36, grade: 'Poor', timeSpent: '30 Min', submittedTime: '2025-03-10, 14:30' }
    ];

    const gradeDistribution: GradeDistribution = { excellent: 0, average: 0, poor: 0 };
    students.forEach(student => {
      if (student.grade === 'Excellent') gradeDistribution.excellent++;
      else if (student.grade === 'Average') gradeDistribution.average++;
      else if (student.grade === 'Poor') gradeDistribution.poor++;
    });
    const totalStudents = students.length;
    gradeDistribution.excellent = Math.round((gradeDistribution.excellent / totalStudents) * 100);
    gradeDistribution.average = Math.round((gradeDistribution.average / totalStudents) * 100);
    gradeDistribution.poor = Math.round((gradeDistribution.poor / totalStudents) * 100);

    const totalTimeSpent = students.reduce((sum, student) => {
      const time = parseInt(student.timeSpent.split(' ')[0]);
      return sum + time;
    }, 0);
    const avgTimeSpent = Math.round(totalTimeSpent / students.length);
    const allocatedTime = 30;
    const timePercentage = Math.round((avgTimeSpent / allocatedTime) * 100);

    return {
      examName,
      course,
      totalQuestions: 20,
      examType: 'All in one exam',
      dateTime,
      duration: '30 Min',
      totalMarks: 50,
      passMarks: 40,
      totalStudents: 120,
      averageScore: 78,
      totalAbsent: 5,
      totalFinished: 115,
      totalPassed: 100,
      totalFailed: 15,
      students,
      gradeDistribution,
      timeUtilization: { avgTimeSpent, allocatedTime, timePercentage },
      questionPerformance: {
        topCorrect: [
          { text: 'What is the primary theme of the novel?', correctRate: 92 },
          { text: 'Identify the correct synonym for "happy."', correctRate: 89 }
        ],
        topIncorrect: [
          { text: 'What is the historical context of the story?', incorrectRate: 65 },
          { text: 'Analyze the character’s motivation in chapter 5.', incorrectRate: 60 }
        ]
      }
    };
  }
}