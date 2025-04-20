import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  dashboardData: any = {
    totalQuizzes: 48,
    totalQuestions: 32,
    activeExams: 5,
    completedExams: 12,
    canceledExams: 3,
    totalPassFail: 67,
    passed: 76,
    merit: 15,
    failed: 9,
    missedQuestions: {
      topic: 'Food Safety Basics',
      quiz: 'Food Safety Quiz #1',
      missRate: 70,
    },
    topPerformers: [
      { name: 'John Doe', grade: 95 },
      { name: 'Jane Smith', grade: 92 },
    ],
    needingAttention: [
      { name: 'Alex Brown', grade: 45 },
      { name: 'Sarah Lee', grade: 50 },
    ],
    quizDifficulty: [
      { title: 'Food Safety Basics', avgScore: 78, passRate: 85 },
      { title: 'Advanced Foodborne Illness', avgScore: 65, passRate: 70 },
    ],
    engagement: {
      avgTimeSpent: 15,
      incompleteQuizzes: 5,
      participationRate: 80,
    },
    groupPerformance: [
      { name: 'Group A', avgScore: 85, passRate: 90 },
      { name: 'Group B', avgScore: 70, passRate: 65 },
    ],
    reminders: [
      { title: 'Food Safety Quiz Starts', dueDate: '2025-04-20' },
      { title: 'Grade Submissions for Quiz #3', dueDate: '2025-04-22' },
    ],
    teachingAnalytics: {
      lowParticipationRate: 30,
      highFailureRate: 25,
      strugglingTopic: {
        topic: 'Food Safety',
        performanceGap: 40,
      },
    },
  };

  groupResultsLabels: string[] = ['Quizzes 1-3', 'Quizzes 4-6', 'Quizzes 7-10'];

  groupResultsData: any[] = [
    {
      label: 'Group A',
      quizBreakdown: [
        { batch: 'Quizzes 1-3', passed: 80, merit: 15, failed: 5 },
        { batch: 'Quizzes 4-6', passed: 85, merit: 10, failed: 5 },
        { batch: 'Quizzes 7-10', passed: 90, merit: 8, failed: 2 },
      ],
    },
    {
      label: 'Group B',
      quizBreakdown: [
        { batch: 'Quizzes 1-3', passed: 65, merit: 20, failed: 15 },
        { batch: 'Quizzes 4-6', passed: 70, merit: 15, failed: 15 },
        { batch: 'Quizzes 7-10', passed: 75, merit: 10, failed: 15 },
      ],
    },
  ];

  currentRange: string = 'Last 10 Quizzes'; // Default range

  constructor() {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData() {
    
  }

  updateRange(event: Event, section: string) {
    const target = event.target as HTMLSelectElement;
    this.currentRange = target.value;

    console.log(`Updating ${section} for range: ${this.currentRange}`);

    // Mock data update logic for Last 3, 5, 10 Quizzes
    if (this.currentRange === 'Last 3 Quizzes') {
      // Data for last 3 quizzes (mocked values)
      this.dashboardData.passed = 78;
      this.dashboardData.merit = 14;
      this.dashboardData.failed = 8;
      this.dashboardData.teachingAnalytics.lowParticipationRate = 20;
      this.dashboardData.teachingAnalytics.highFailureRate = 15;
      this.dashboardData.engagement.avgTimeSpent = 12;
      this.dashboardData.engagement.incompleteQuizzes = 2;
      this.dashboardData.engagement.participationRate = 85;
      this.dashboardData.groupPerformance = [
        { name: 'Group A', avgScore: 88, passRate: 92 },
        { name: 'Group B', avgScore: 72, passRate: 68 },
      ];
      this.groupResultsData = [
        {
          label: 'Group A',
          quizBreakdown: [
            { batch: 'Quiz 1', passed: 85, merit: 10, failed: 5 },
            { batch: 'Quiz 2', passed: 88, merit: 8, failed: 4 },
            { batch: 'Quiz 3', passed: 90, merit: 6, failed: 4 },
          ],
        },
        {
          label: 'Group B',
          quizBreakdown: [
            { batch: 'Quiz 1', passed: 70, merit: 15, failed: 15 },
            { batch: 'Quiz 2', passed: 72, merit: 13, failed: 15 },
            { batch: 'Quiz 3', passed: 75, merit: 10, failed: 15 },
          ],
        },
      ];
      this.groupResultsLabels = ['Quiz 1', 'Quiz 2', 'Quiz 3'];
    } else if (this.currentRange === 'Last 5 Quizzes') {
      // Data for last 5 quizzes (mocked values)
      this.dashboardData.passed = 77;
      this.dashboardData.merit = 15;
      this.dashboardData.failed = 8;
      this.dashboardData.teachingAnalytics.lowParticipationRate = 25;
      this.dashboardData.teachingAnalytics.highFailureRate = 20;
      this.dashboardData.engagement.avgTimeSpent = 13;
      this.dashboardData.engagement.incompleteQuizzes = 3;
      this.dashboardData.engagement.participationRate = 82;
      this.dashboardData.groupPerformance = [
        { name: 'Group A', avgScore: 86, passRate: 91 },
        { name: 'Group B', avgScore: 71, passRate: 66 },
      ];
      this.groupResultsData = [
        {
          label: 'Group A',
          quizBreakdown: [
            { batch: 'Quizzes 1-3', passed: 82, merit: 12, failed: 6 },
            { batch: 'Quizzes 4-5', passed: 88, merit: 8, failed: 4 },
          ],
        },
        {
          label: 'Group B',
          quizBreakdown: [
            { batch: 'Quizzes 1-3', passed: 68, merit: 18, failed: 14 },
            { batch: 'Quizzes 4-5', passed: 73, merit: 12, failed: 15 },
          ],
        },
      ];
      this.groupResultsLabels = ['Quizzes 1-3', 'Quizzes 4-5'];
    } else {
      // Default: Last 10 Quizzes
      this.dashboardData.passed = 76;
      this.dashboardData.merit = 15;
      this.dashboardData.failed = 9;
      this.dashboardData.teachingAnalytics.lowParticipationRate = 30;
      this.dashboardData.teachingAnalytics.highFailureRate = 25;
      this.dashboardData.engagement.avgTimeSpent = 15;
      this.dashboardData.engagement.incompleteQuizzes = 5;
      this.dashboardData.engagement.participationRate = 80;
      this.dashboardData.groupPerformance = [
        { name: 'Group A', avgScore: 85, passRate: 90 },
        { name: 'Group B', avgScore: 70, passRate: 65 },
      ];
      this.groupResultsData = [
        {
          label: 'Group A',
          quizBreakdown: [
            { batch: 'Quizzes 1-3', passed: 80, merit: 15, failed: 5 },
            { batch: 'Quizzes 4-6', passed: 85, merit: 10, failed: 5 },
            { batch: 'Quizzes 7-10', passed: 90, merit: 8, failed: 2 },
          ],
        },
        {
          label: 'Group B',
          quizBreakdown: [
            { batch: 'Quizzes 1-3', passed: 65, merit: 20, failed: 15 },
            { batch: 'Quizzes 4-6', passed: 70, merit: 15, failed: 15 },
            { batch: 'Quizzes 7-10', passed: 75, merit: 10, failed: 15 },
          ],
        },
      ];
      this.groupResultsLabels = ['Quizzes 1-3', 'Quizzes 4-6', 'Quizzes 7-10'];
    }
  }
}