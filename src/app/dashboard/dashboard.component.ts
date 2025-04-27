import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Chart,
  ChartConfiguration,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  LineController,
  BarController,
  PieController,
  DoughnutController,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  LineController,
  BarController,
  PieController,
  DoughnutController,
  Title,
  Tooltip,
  Legend
);

interface StudentMetric {
  name: string;
  initials: string;
  rank: number;
  examsTaken: number;
  avgSubmittedTime: number; // in minutes
  totalScore: number;
}

interface QuestionAnalysis {
  questionName: string;
  correctPercentage: number;
}

interface EngagementMetric {
  completionRate: number;
  avgTimeSpent: number;
  onTimeSubmissions: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgClass, DatePipe, FormsModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  notificationCount = 5;
  isLoading = true;
  chartError: string | null = null;
  selectedGroup: string = 'All Groups';
  groups: string[] = ['All Groups', 'Group A', 'Group B', 'Group C'];

  user = {
    name: 'Dr. Sarah Johnson',
    role: 'Senior Examiner',
    department: 'Microbiology',
    lastLogin: new Date(2025, 3, 25, 14, 30), // April 25, 2025, 2:30 PM
    activeCourses: 4,
    initials: 'SJ'
  };

  quickStats = [
    { title: 'Total Exams', value: '150', icon: '📘' },
    { title: 'Active Students', value: '520', icon: '👩‍🎓' },
    { title: 'Avg Score', value: '78.2%', icon: '📊' },
    { title: 'Total Questions', value: '1,300', icon: '❓' },
    { title: 'Ongoing Exams', value: '10', icon: '⏳' },
    { title: 'Completed Exams', value: '135', icon: '✅' },
    { title: 'Cancelled Exams', value: '5', icon: '❌' }
  ];

  engagementMetrics: EngagementMetric = {
    completionRate: 90,
    avgTimeSpent: 25,
    onTimeSubmissions: 85
  };

  lineChartType = 'line' as const;
  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Group A',
        data: [75, 80, 78, 85, 82, 88],
        borderColor: '#3b82f6',
        backgroundColor: (context: any) => {
          if (!context.chart?.ctx) return 'rgba(59, 130, 246, 0.3)';
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
          return gradient;
        },
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#3b82f6',
        pointHoverRadius: 8,
        hidden: this.selectedGroup !== 'All Groups' && this.selectedGroup !== 'Group A'
      },
      {
        label: 'Group B',
        data: [68, 72, 75, 78, 76, 80],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10b981',
        hidden: this.selectedGroup !== 'All Groups' && this.selectedGroup !== 'Group B'
      },
      {
        label: 'Group C',
        data: [70, 75, 73, 80, 78, 82],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#f59e0b',
        hidden: this.selectedGroup !== 'All Groups' && this.selectedGroup !== 'Group C'
      }
    ]
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000, easing: 'easeInOutQuad' },
    scales: {
      x: { type: 'category', grid: { display: false } },
      y: {
        type: 'linear',
        beginAtZero: true,
        max: 100,
        ticks: { callback: (value) => `${value}%` },
        grid: { color: 'rgba(0,0,0,0.05)' }
      }
    },
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15 } },
      tooltip: {
        backgroundColor: '#333',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        callbacks: { label: (context) => `${context.dataset.label}: ${context.parsed.y}%` }
      }
    }
  };

  pieChartType = 'pie' as const;
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['A (90-100%)', 'B (80-89%)', 'C (70-79%)', 'D (60-69%)', 'F (<60%)'],
    datasets: [{
      data: [15, 30, 35, 15, 5],
      backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'],
      hoverOffset: 20
    }]
  };

  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
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

  topicBarChartType = 'bar' as const;
  topicBarChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Midterm 1', 'Midterm 2', 'Quiz 1', 'Quiz 2', 'Final Exam'],
    datasets: [{
      label: 'Performance',
      data: [82, 75, 88, 70, 80],
      backgroundColor: (context: any) => {
        if (!context.chart?.ctx) return '#10b981';
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(1, '#059669');
        return gradient;
      },
      borderRadius: 4
    }]
  };

  topicBarChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000, easing: 'easeInOutQuad' },
    scales: {
      x: { type: 'category', grid: { display: false } },
      y: {
        type: 'linear',
        max: 100,
        ticks: { callback: (value) => `${value}%` },
        grid: { color: 'rgba(0,0,0,0.05)' }
      }
    },
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15 } },
      tooltip: {
        backgroundColor: '#333',
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            let performance = 'Average';
            if (value >= 85) performance = 'Excellent';
            else if (value >= 70) performance = 'Good';
            else if (value <= 60) performance = 'Needs Improvement';
            return `${context.dataset.label}: ${value}% (${performance})`;
          }
        }
      }
    }
  };

  confidenceBarChartType = 'bar' as const;
  confidenceBarChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Midterm 1', 'Midterm 2', 'Quiz 1', 'Quiz 2', 'Final Exam'],
    datasets: [
      {
        label: 'Performance',
        data: [82, 75, 88, 70, 80],
        backgroundColor: '#10b981',
        borderRadius: 4,
        barPercentage: 0.45,
        categoryPercentage: 0.5
      },
      {
        label: 'Confidence',
        data: [85, 78, 90, 72, 83],
        backgroundColor: '#3b82f6',
        borderRadius: 4,
        barPercentage: 0.45,
        categoryPercentage: 0.5
      }
    ]
  };

  confidenceBarChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000, easing: 'easeInOutQuad' },
    scales: {
      x: { type: 'category', grid: { display: false } },
      y: {
        type: 'linear',
        max: 100,
        ticks: { callback: (value) => `${value}%` },
        grid: { color: 'rgba(0,0,0,0.05)' }
      }
    },
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15 } },
      tooltip: {
        backgroundColor: '#333',
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            const index = context.dataIndex;
            const performance = this.confidenceBarChartData.datasets[0].data[index] as number;
            const confidence = this.confidenceBarChartData.datasets[1].data[index] as number;
            const difference = confidence - performance;
            return `${context.dataset.label}: ${value}% (Difference: ${difference}%)`;
          }
        }
      }
    }
  };

  engagementDoughnutChartType = 'doughnut' as const;
  engagementDoughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Completion Rate', 'On-Time Submissions', 'Avg Time Spent'],
    datasets: [{
      data: [90, 85, 25],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
      hoverOffset: 20
    }]
  };

  engagementDoughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { animateScale: true, animateRotate: true, duration: 1000 },
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 15 } },
      tooltip: {
        backgroundColor: '#333',
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            if (label === 'Avg Time Spent') return `${label}: ${value} min`;
            return `${label}: ${value}%`;
          }
        }
      }
    }
  };

  questionMetrics: QuestionAnalysis[] = [
    { questionName: 'Microscope Parts', correctPercentage: 90 },
    { questionName: 'Cell Cycle', correctPercentage: 85 },
    { questionName: 'DNA Replication', correctPercentage: 80 },
    { questionName: 'PCR Techniques', correctPercentage: 40 },
    { questionName: 'Enzyme Kinetics', correctPercentage: 45 },
    { questionName: 'Immune Response', correctPercentage: 50 }
  ];

  studentMetrics = {
    topPerformers: [
      { name: 'Emily Chen', initials: 'EC', rank: 1, examsTaken: 12, avgSubmittedTime: 45, totalScore: 1152 },
      { name: 'Michael Rodriguez', initials: 'MR', rank: 2, examsTaken: 11, avgSubmittedTime: 48, totalScore: 1034 },
      { name: 'Julia Park', initials: 'JP', rank: 3, examsTaken: 10, avgSubmittedTime: 50, totalScore: 950 },
      { name: 'Sophia Lee', initials: 'SL', rank: 4, examsTaken: 10, avgSubmittedTime: 52, totalScore: 920 },
      { name: 'David Kim', initials: 'DK', rank: 5, examsTaken: 9, avgSubmittedTime: 55, totalScore: 855 }
    ],
    needingAttention: [
      { name: 'Alex Johnson', initials: 'AJ', rank: 516, examsTaken: 7, avgSubmittedTime: 70, totalScore: 420 },
      { name: 'Olivia Martinez', initials: 'OM', rank: 517, examsTaken: 6, avgSubmittedTime: 75, totalScore: 390 },
      { name: 'Thomas Williams', initials: 'TW', rank: 518, examsTaken: 8, avgSubmittedTime: 68, totalScore: 480 },
      { name: 'Emma Brown', initials: 'EB', rank: 519, examsTaken: 5, avgSubmittedTime: 80, totalScore: 325 },
      { name: 'Liam Davis', initials: 'LD', rank: 520, examsTaken: 5, avgSubmittedTime: 78, totalScore: 310 }
    ]
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    console.log('DashboardComponent: ngOnInit started');
    try {
      this.initializeDashboard();
    } catch (error) {
      console.error('DashboardComponent: Initialization error:', error);
      this.chartError = 'Failed to initialize charts. Please try refreshing the page.';
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  initializeDashboard(): void {
    setTimeout(() => {
      try {
        this.isLoading = false;
        this.updateLineChart();
        this.cdr.detectChanges();
        console.log('DashboardComponent: Initialization complete, isLoading:', this.isLoading);
      } catch (error) {
        console.error('DashboardComponent: Error in initializeDashboard:', error);
        this.chartError = 'Error rendering dashboard. Check console for details.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }, 100);
  }

  updateLineChart(): void {
    this.lineChartData.datasets.forEach(dataset => {
      dataset.hidden = this.selectedGroup !== 'All Groups' && dataset.label !== this.selectedGroup;
    });
    this.cdr.detectChanges();
  }

  selectGroup(group: string): void {
    this.selectedGroup = group;
    this.updateLineChart();
  }

  getDistributionInsights(): string[] {
    const aPercent = this.pieChartData.datasets[0].data[0];
    const fPercent = this.pieChartData.datasets[0].data[4];
    return [
      `${aPercent}% of students achieved A grades (90-100%)`,
      `${fPercent}% of students failed with F grades (<60%)`
    ];
  }

  getTopCorrectQuestions(): QuestionAnalysis[] {
    return this.questionMetrics
      .sort((a, b) => b.correctPercentage - a.correctPercentage)
      .slice(0, 3);
  }

  getTopIncorrectQuestions(): QuestionAnalysis[] {
    return this.questionMetrics
      .sort((a, b) => a.correctPercentage - b.correctPercentage)
      .slice(0, 3);
  }

  viewNotifications(): void {
    console.log('DashboardComponent: viewNotifications called, notificationCount:', this.notificationCount);
    this.notificationCount = 0;
    this.cdr.detectChanges();
  }

  getScoreColorClass(score: number): string {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getQuestionIndicatorClass(percentage: number): string {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }
}