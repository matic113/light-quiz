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

interface Quiz {
  title: string;
  type: string;
  points: number;
  date: string;
  time: string;
  code?: string;
  reportData?: ReportData;
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
  imports: [CommonModule, DatePipe, FormsModule, BaseChartDirective],
  templateUrl: './quizzes.component.html',
  styleUrls: ['./quizzes.component.css']
})
export class QuizzesComponent implements OnInit {
  upcomingQuizzes: Quiz[] = [
    { title: 'Mathematics Midterm', type: 'Multiple Choice', points: 50, date: '2025-04-28', time: '10:00', code: 'MATH-MID-20250428' },
    { title: 'Physics Chapter 3 Quiz', type: 'Short Answer', points: 30, date: '2025-05-05', time: '14:30', code: 'PHYS-CH3-20250505' },
    { title: 'History Final Exam', type: 'Essay', points: 100, date: '2025-06-15', time: '09:00', code: 'HIST-FIN-20250615' }
  ];

  completedQuizzes: Quiz[] = [
    { title: 'English Literature Quiz', type: 'Mixed', points: 50, date: '2025-03-10', time: '14:00', reportData: this.getReportData('English Literature Quiz', 'English Literature', '2025-03-10 14:00 - 15:00') },
    { title: 'Algebra Unit 1 Test', type: 'Multiple Choice', points: 40, date: '2025-02-25', time: '10:30', reportData: this.getReportData('Algebra Unit 1 Test', 'Mathematics', '2025-02-25 10:30 - 11:30') },
    { title: 'World Geography Exam', type: 'Essay', points: 80, date: '2025-01-15', time: '09:00', reportData: this.getReportData('World Geography Exam', 'Geography', '2025-01-15 09:00 - 11:00') }
  ];

  calendarDays: { day: number | string; isHighlighted: boolean }[] = [];
  currentMonth: string = 'April 2025';
  currentDate: Date = new Date(2025, 3, 1); // Start at April 2025 (month 3, 0-based)
  notificationCount: number = 3;
  user = {
    name: 'Dr. Sarah Johnson',
    initials: 'SJ'
  };

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

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadCalendar();
  }

  loadCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.currentMonth = `${monthNames[month]} ${year}`;

    this.calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      this.calendarDays.push({ day: '', isHighlighted: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const isHighlighted = this.upcomingQuizzes.some((quiz: Quiz) => {
        const quizDate = new Date(quiz.date);
        return quizDate.getDate() === i && quizDate.getMonth() === month && quizDate.getFullYear() === year;
      });
      this.calendarDays.push({ day: i, isHighlighted });
    }
  }

  previousMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.loadCalendar();
  }

  nextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.loadCalendar();
  }

  previousYear(): void {
    this.currentDate.setFullYear(this.currentDate.getFullYear() - 1);
    this.loadCalendar();
  }

  nextYear(): void {
    this.currentDate.setFullYear(this.currentDate.getFullYear() + 1);
    this.loadCalendar();
  }

  copyCode(quiz: Quiz): void {
    if (quiz.code) {
      navigator.clipboard.writeText(quiz.code).then(() => {
        alert('Code copied to clipboard: ' + quiz.code);
      });
    }
  }

  createQuiz(): void {
    alert('Create Quiz button clicked! Navigating to quiz creation form...');
  }

  showReport(quiz: Quiz): void {
    if (quiz.reportData) {
      this.selectedReport = quiz.reportData;
      this.filteredStudents = [...this.selectedReport.students];

      // Update Grade Distribution Chart
      this.gradePieChartData.datasets[0].data = [
        this.selectedReport.gradeDistribution.excellent,
        this.selectedReport.gradeDistribution.average,
        this.selectedReport.gradeDistribution.poor
      ];

      // Update Time Utilization Chart
      this.timeBarChartData.datasets[0].data = [this.selectedReport.timeUtilization.timePercentage];

      this.showReportPopup = true;
      this.cdr.detectChanges();
    }
  }

  closeReport(): void {
    this.showReportPopup = false;
    this.selectedReport = null;
    this.searchQuery = '';
    this.filteredStudents = [];
  }

  downloadReport(): void {
    if (!this.selectedReport) return;
    const reportContent = `
      Exam Results: ${this.selectedReport.examName}
      Course: ${this.selectedReport.course}
      Date: ${this.selectedReport.dateTime}
      Total Students: ${this.selectedReport.totalStudents}
      Average Score: ${this.selectedReport.averageScore}
      Total Absent: ${this.selectedReport.totalAbsent}
      Total Passed: ${this.selectedReport.totalPassed}
      Total Failed: ${this.selectedReport.totalFailed}

      Grade Distribution:
      Excellent: ${this.selectedReport.gradeDistribution.excellent}%
      Average: ${this.selectedReport.gradeDistribution.average}%
      Poor: ${this.selectedReport.gradeDistribution.poor}%

      Students:
      ${this.selectedReport.students.map((student: Student) => `${student.name}: ${student.score}/${this.selectedReport!.totalMarks} (${student.grade})`).join('\n')}
    `;
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.selectedReport.examName}_Report.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
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

  viewNotifications(): void {
    alert(`You have ${this.notificationCount} new notifications!`);
    this.notificationCount = 0;
    this.cdr.detectChanges();
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