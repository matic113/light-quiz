import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SidebarStateService } from '../services/sidebar-state.service';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  isExpanded: boolean = true;

  globalFilter = {
    range: 'Last 10 Quizzes',
    examName: '',
    group: ''
  };

  examsList: string[] = ['HACCP Principles Quiz', 'Pathogen Control Strategies Quiz', 'Sanitation Standards Quiz'];
  groupsList: string[] = ['Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta', 'Team Epsilon'];

  topPerformersFilter: string = 'overall';
  needingAttentionFilter: string = 'overall';
  confidenceFilter: string = 'all';
  filteredConfidenceData: any[] = [];

  calendarDays: { day: number | string, isHighlighted: boolean }[] = [];

  dashboardData: any = {
    totalQuizzes: 52,
    totalQuestions: 40,
    activeExams: 4,
    completedExams: 15,
    canceledExams: 2,
    totalPassFail: 73,
    examPerformanceBreakdown: [
      { excellent: 18, pass: 62, fail: 20 }, // HACCP Principles Quiz (first instance)
      { excellent: 22, pass: 58, fail: 20 }, // Pathogen Control Strategies Quiz
      { excellent: 15, pass: 65, fail: 20 }, // Sanitation Standards Quiz
      { excellent: 20, pass: 60, fail: 20 }  // HACCP Principles Quiz (second instance)
    ],
    missedQuestions: {
      topic: 'Pathogen Identification',
      quiz: 'Pathogen Control Strategies Quiz',
      missRate: 68,
    },
    topPerformers: [
      { name: 'Aisha Khan', initials: 'AK', quizzes: 45, avgTime: '28:30', change: 70, score: 680 },
      { name: 'Carlos Rivera', initials: 'CR', quizzes: 32, avgTime: '25:45', change: 35, score: 560 },
      { name: 'Mei Lin', initials: 'ML', quizzes: 28, avgTime: '23:15', change: 85, score: 510 },
      { name: 'James Okoro', initials: 'JO', quizzes: 20, avgTime: '17:40', change: 15, score: 400 },
      { name: 'Sofia Mendes', initials: 'SM', quizzes: 18, avgTime: '15:20', change: -5, score: 370 }
    ],
    needingAttention: [
      { name: 'Liam Nguyen', initials: 'LN', quizzes: 12, avgTime: '19:50', change: -10, score: 210 },
      { name: 'Fatima Ali', initials: 'FA', quizzes: 14, avgTime: '21:10', change: -15, score: 190 },
      { name: 'Noah Kim', initials: 'NK', quizzes: 9, avgTime: '17:30', change: 8, score: 160 },
      { name: 'Emma Patel', initials: 'EP', quizzes: 8, avgTime: '16:45', change: -6, score: 140 },
      { name: 'Omar Hassan', initials: 'OH', quizzes: 6, avgTime: '14:55', change: -10, score: 110 }
    ],
    topCorrectQuestions: [
      { text: 'What is the minimum temperature for hot holding?', correctRate: 92 },
      { text: 'How often should handwashing stations be checked?', correctRate: 89 },
      { text: 'What is the primary cause of cross-contamination?', correctRate: 87 }
    ],
    topIncorrectQuestions: [
      { text: 'What is the incubation period for Listeria?', incorrectRate: 72 },
      { text: 'Which pathogen is most associated with raw eggs?', incorrectRate: 67 },
      { text: 'What is the ideal pH for bacterial growth?', incorrectRate: 63 }
    ],
    groupPerformance: [
      { name: 'Team Alpha', avgScore: 88, passRate: 92 },
      { name: 'Team Beta', avgScore: 75, passRate: 70 },
      { name: 'Team Gamma', avgScore: 82, passRate: 85 },
      { name: 'Team Delta', avgScore: 68, passRate: 65 },
      { name: 'Team Epsilon', avgScore: 79, passRate: 80 }
    ],
    reminders: [
      { title: 'HACCP Principles Quiz Starts', dueDate: '2025-04-25' },
      { title: 'Sanitation Standards Quiz Submission', dueDate: '2025-04-27' }
    ],
    teachingAnalytics: {
      lowParticipationRate: 28,
      highFailureRate: 22,
      strugglingTopic: {
        topic: 'Pathogen Identification',
        performanceGap: 35,
      },
    },
    quizPerformance: {
      completionRate: 87,
      difficultQuestions: [
        { text: 'What is the incubation period for Listeria?', correctRate: 28 },
        { text: 'Which pathogen is most associated with raw eggs?', correctRate: 33 },
        { text: 'What is the ideal pH for bacterial growth?', correctRate: 37 }
      ],
      timeUtilization: [
        { quizName: 'HACCP Principles Quiz', avgTime: 10, allocatedTime: 15, avgTimePercentage: 67 },
        { quizName: 'Pathogen Control Strategies Quiz', avgTime: 16, allocatedTime: 20, avgTimePercentage: 80 }
      ],
      gradeDistribution: [
        { quizName: 'HACCP Principles Quiz', excellent: 18, pass: 62, fail: 20 },
        { group: 'Team Alpha', excellent: 25, pass: 65, fail: 10 },
        { group: 'Team Beta', excellent: 12, pass: 55, fail: 33 },
        { group: 'Team Gamma', excellent: 20, pass: 60, fail: 20 },
        { group: 'Team Delta', excellent: 10, pass: 50, fail: 40 },
        { group: 'Team Epsilon', excellent: 15, pass: 58, fail: 27 }
      ]
    },
    engagementInsights: {
      participationTrends: [
        { quizBatch: 'Quizzes 1-3', participationRate: 88 },
        { quizBatch: 'Quizzes 4-6', participationRate: 83 },
        { quizBatch: 'Quizzes 7-10', participationRate: 79 }
      ],
      confidenceVsCorrectness: [
        { topic: 'HACCP Compliance', confidence: 82, correctness: 78, gap: 4 },
        { topic: 'Pathogen Identification', confidence: 88, correctness: 62, gap: 26 },
        { topic: 'Sanitation Protocols', confidence: 79, correctness: 74, gap: 5 },
        { topic: 'Temperature Control', confidence: 85, correctness: 70, gap: 15 },
        { topic: 'Cross-Contamination Prevention', confidence: 90, correctness: 80, gap: 10 }
      ],
      groupComparison: [
        { group: 'Team Alpha', excellent: 25, pass: 65, fail: 10 },
        { group: 'Team Beta', excellent: 12, pass: 55, fail: 33 },
        { group: 'Team Gamma', excellent: 20, pass: 60, fail: 20 },
        { group: 'Team Delta', excellent: 10, pass: 50, fail: 40 },
        { group: 'Team Epsilon', excellent: 15, pass: 58, fail: 27 }
      ]
    },
    quizDesign: {
      questionTypes: [
        { type: 'Multiple Choice', accuracy: 88 },
        { type: 'True/False', accuracy: 72 },
        { type: 'Short Answer', accuracy: 65 }
      ],
      quizLength: [
        { numQuestions: 10, completionRate: 92, avgScore: 82 },
        { numQuestions: 20, completionRate: 78, avgScore: 73 },
        { numQuestions: 30, completionRate: 65, avgScore: 68 }
      ],
      anonymousResults: { avgScore: 80 },
      identifiedResults: { avgScore: 85 }
    },
    actionFeatures: {
      interventions: [
        { name: 'Liam Nguyen', topic: 'Pathogen Identification' },
        { name: 'Fatima Ali', topic: 'Cross-Contamination Prevention' },
        { name: 'Noah Kim', topic: 'Temperature Control' }
      ],
      quizImprovements: [
        { question: 'What is the ideal pH for bacterial growth?', issue: 'Ambiguous wording' },
        { question: 'Which pathogen is most associated with raw eggs?', issue: 'Needs more specificity' },
        { question: 'What is the incubation period for Listeria?', issue: 'Misleading options' }
      ],
      contentGaps: [
        { concept: 'Pathogen Identification', performance: 62 },
        { concept: 'Temperature Control', performance: 70 },
        { concept: 'Sanitation Protocols', performance: 74 }
      ]
    }
  };

  groupResultsData: any[] = [
    { label: 'Team Alpha', excellent: 25, pass: 65, fail: 10, avgPoints: 88 },
    { label: 'Team Beta', excellent: 12, pass: 55, fail: 33, avgPoints: 75 },
    { label: 'Team Gamma', excellent: 20, pass: 60, fail: 20, avgPoints: 82 },
    { label: 'Team Delta', excellent: 10, pass: 50, fail: 40, avgPoints: 68 },
    { label: 'Team Epsilon', excellent: 15, pass: 58, fail: 27, avgPoints: 79 }
  ];

  constructor(private sidebarStateService: SidebarStateService) {}

  ngOnInit(): void {
    this.sidebarStateService.setSidebarState(true);
    this.sidebarStateService.isExpanded$.subscribe(value => {
      this.isExpanded = value;
      this.loadDashboardData();
    });
    this.filteredConfidenceData = this.dashboardData.engagementInsights.confidenceVsCorrectness;
  }

  loadDashboardData() {
    const daysInMonth = 30;
    this.calendarDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const isHighlighted = this.dashboardData.reminders.some((reminder: any) => {
        const day = parseInt(reminder.dueDate.split('-')[2]);
        return day === i;
      });
      this.calendarDays.push({ day: i, isHighlighted });
    }
    for (let i = 0; i < 2; i++) {
      this.calendarDays.unshift({ day: '', isHighlighted: false });
    }
    this.applyGlobalFilter();
  }

  applyGlobalFilter() {
    const range = this.globalFilter.range;
    const examName = this.globalFilter.examName;
    const group = this.globalFilter.group;

    if (range === 'Last 3 Quizzes') {
      this.dashboardData.examPerformanceBreakdown = [
        { excellent: 20, pass: 60, fail: 20 },
        { excellent: 18, pass: 62, fail: 20 },
        { excellent: 22, pass: 58, fail: 20 }
      ];
      this.dashboardData.teachingAnalytics.lowParticipationRate = 20;
      this.dashboardData.teachingAnalytics.highFailureRate = 15;
      this.dashboardData.groupPerformance = [
        { name: 'Team Alpha', avgScore: 90, passRate: 94 },
        { name: 'Team Beta', avgScore: 78, passRate: 72 },
        { name: 'Team Gamma', avgScore: 85, passRate: 88 },
        { name: 'Team Delta', avgScore: 70, passRate: 68 },
        { name: 'Team Epsilon', avgScore: 82, passRate: 83 }
      ];
      this.groupResultsData = [
        { label: 'Team Alpha', excellent: 28, pass: 62, fail: 10, avgPoints: 90 },
        { label: 'Team Beta', excellent: 15, pass: 55, fail: 30, avgPoints: 78 },
        { label: 'Team Gamma', excellent: 22, pass: 60, fail: 18, avgPoints: 85 },
        { label: 'Team Delta', excellent: 12, pass: 52, fail: 36, avgPoints: 70 },
        { label: 'Team Epsilon', excellent: 18, pass: 58, fail: 24, avgPoints: 82 }
      ];
      this.dashboardData.quizPerformance.completionRate = 90;
      this.dashboardData.quizPerformance.timeUtilization = [
        { quizName: 'HACCP Principles Quiz', avgTime: 9, allocatedTime: 15, avgTimePercentage: 60 },
        { quizName: 'Sanitation Standards Quiz', avgTime: 11, allocatedTime: 15, avgTimePercentage: 73 }
      ];
      this.dashboardData.quizPerformance.gradeDistribution = [
        { quizName: 'Sanitation Standards Quiz', excellent: 20, pass: 60, fail: 20 },
        { group: 'Team Alpha', excellent: 28, pass: 62, fail: 10 },
        { group: 'Team Beta', excellent: 15, pass: 55, fail: 30 },
        { group: 'Team Gamma', excellent: 22, pass: 60, fail: 18 },
        { group: 'Team Delta', excellent: 12, pass: 52, fail: 36 },
        { group: 'Team Epsilon', excellent: 18, pass: 58, fail: 24 }
      ];
      this.dashboardData.engagementInsights.participationTrends = [
        { quizBatch: 'Quiz 1', participationRate: 90 },
        { quizBatch: 'Quiz 2', participationRate: 88 },
        { quizBatch: 'Quiz 3', participationRate: 86 }
      ];
      this.dashboardData.engagementInsights.groupComparison = [
        { group: 'Team Alpha', excellent: 28, pass: 62, fail: 10 },
        { group: 'Team Beta', excellent: 15, pass: 55, fail: 30 },
        { group: 'Team Gamma', excellent: 22, pass: 60, fail: 18 },
        { group: 'Team Delta', excellent: 12, pass: 52, fail: 36 },
        { group: 'Team Epsilon', excellent: 18, pass: 58, fail: 24 }
      ];
    } else if (range === 'Last 5 Quizzes') {
      this.dashboardData.examPerformanceBreakdown = [
        { excellent: 18, pass: 62, fail: 20 },
        { excellent: 20, pass: 60, fail: 20 },
        { excellent: 16, pass: 64, fail: 20 },
        { excellent: 22, pass: 58, fail: 20 },
        { excellent: 14, pass: 66, fail: 20 }
      ];
      this.dashboardData.teachingAnalytics.lowParticipationRate = 24;
      this.dashboardData.teachingAnalytics.highFailureRate = 18;
      this.dashboardData.groupPerformance = [
        { name: 'Team Alpha', avgScore: 87, passRate: 91 },
        { name: 'Team Beta', avgScore: 74, passRate: 69 },
        { name: 'Team Gamma', avgScore: 81, passRate: 84 },
        { name: 'Team Delta', avgScore: 67, passRate: 64 },
        { name: 'Team Epsilon', avgScore: 78, passRate: 79 }
      ];
      this.groupResultsData = [
        { label: 'Team Alpha', excellent: 24, pass: 60, fail: 16, avgPoints: 87 },
        { label: 'Team Beta', excellent: 13, pass: 54, fail: 33, avgPoints: 74 },
        { label: 'Team Gamma', excellent: 19, pass: 58, fail: 23, avgPoints: 81 },
        { label: 'Team Delta', excellent: 11, pass: 50, fail: 39, avgPoints: 67 },
        { label: 'Team Epsilon', excellent: 14, pass: 57, fail: 29, avgPoints: 78 }
      ];
      this.dashboardData.quizPerformance.completionRate = 85;
      this.dashboardData.quizPerformance.timeUtilization = [
        { quizName: 'HACCP Principles Quiz', avgTime: 10, allocatedTime: 15, avgTimePercentage: 67 },
        { quizName: 'Pathogen Control Strategies Quiz', avgTime: 15, allocatedTime: 20, avgTimePercentage: 75 }
      ];
      this.dashboardData.quizPerformance.gradeDistribution = [
        { quizName: 'HACCP Principles Quiz', excellent: 18, pass: 62, fail: 20 },
        { group: 'Team Alpha', excellent: 24, pass: 60, fail: 16 },
        { group: 'Team Beta', excellent: 13, pass: 54, fail: 33 },
        { group: 'Team Gamma', excellent: 19, pass: 58, fail: 23 },
        { group: 'Team Delta', excellent: 11, pass: 50, fail: 39 },
        { group: 'Team Epsilon', excellent: 14, pass: 57, fail: 29 }
      ];
      this.dashboardData.engagementInsights.participationTrends = [
        { quizBatch: 'Quizzes 1-3', participationRate: 87 },
        { quizBatch: 'Quizzes 4-5', participationRate: 82 }
      ];
      this.dashboardData.engagementInsights.groupComparison = [
        { group: 'Team Alpha', excellent: 24, pass: 60, fail: 16 },
        { group: 'Team Beta', excellent: 13, pass: 54, fail: 33 },
        { group: 'Team Gamma', excellent: 19, pass: 58, fail: 23 },
        { group: 'Team Delta', excellent: 11, pass: 50, fail: 39 },
        { group: 'Team Epsilon', excellent: 14, pass: 57, fail: 29 }
      ];
    } else {
      this.dashboardData.examPerformanceBreakdown = [
        { excellent: 18, pass: 62, fail: 20 },
        { excellent: 22, pass: 58, fail: 20 },
        { excellent: 15, pass: 65, fail: 20 },
        { excellent: 20, pass: 60, fail: 20 },
        { excellent: 16, pass: 64, fail: 20 },
        { excellent: 23, pass: 57, fail: 20 },
        { excellent: 19, pass: 61, fail: 20 },
        { excellent: 17, pass: 63, fail: 20 },
        { excellent: 21, pass: 59, fail: 20 },
        { excellent: 14, pass: 66, fail: 20 }
      ];
      this.dashboardData.teachingAnalytics.lowParticipationRate = 28;
      this.dashboardData.teachingAnalytics.highFailureRate = 22;
      this.dashboardData.groupPerformance = [
        { name: 'Team Alpha', avgScore: 88, passRate: 92 },
        { name: 'Team Beta', avgScore: 75, passRate: 70 },
        { name: 'Team Gamma', avgScore: 82, passRate: 85 },
        { name: 'Team Delta', avgScore: 68, passRate: 65 },
        { name: 'Team Epsilon', avgScore: 79, passRate: 80 }
      ];
      this.groupResultsData = [
        { label: 'Team Alpha', excellent: 25, pass: 65, fail: 10, avgPoints: 88 },
        { label: 'Team Beta', excellent: 12, pass: 55, fail: 33, avgPoints: 75 },
        { label: 'Team Gamma', excellent: 20, pass: 60, fail: 20, avgPoints: 82 },
        { label: 'Team Delta', excellent: 10, pass: 50, fail: 40, avgPoints: 68 },
        { label: 'Team Epsilon', excellent: 15, pass: 58, fail: 27, avgPoints: 79 }
      ];
      this.dashboardData.quizPerformance.completionRate = 87;
      this.dashboardData.quizPerformance.timeUtilization = [
        { quizName: 'HACCP Principles Quiz', avgTime: 10, allocatedTime: 15, avgTimePercentage: 67 },
        { quizName: 'Pathogen Control Strategies Quiz', avgTime: 16, allocatedTime: 20, avgTimePercentage: 80 }
      ];
      this.dashboardData.quizPerformance.gradeDistribution = [
        { quizName: 'HACCP Principles Quiz', excellent: 18, pass: 62, fail: 20 },
        { group: 'Team Alpha', excellent: 25, pass: 65, fail: 10 },
        { group: 'Team Beta', excellent: 12, pass: 55, fail: 33 },
        { group: 'Team Gamma', excellent: 20, pass: 60, fail: 20 },
        { group: 'Team Delta', excellent: 10, pass: 50, fail: 40 },
        { group: 'Team Epsilon', excellent: 15, pass: 58, fail: 27 }
      ];
      this.dashboardData.engagementInsights.participationTrends = [
        { quizBatch: 'Quizzes 1-3', participationRate: 88 },
        { quizBatch: 'Quizzes 4-6', participationRate: 83 },
        { quizBatch: 'Quizzes 7-10', participationRate: 79 }
      ];
      this.dashboardData.engagementInsights.groupComparison = [
        { group: 'Team Alpha', excellent: 25, pass: 65, fail: 10 },
        { group: 'Team Beta', excellent: 12, pass: 55, fail: 33 },
        { group: 'Team Gamma', excellent: 20, pass: 60, fail: 20 },
        { group: 'Team Delta', excellent: 10, pass: 50, fail: 40 },
        { group: 'Team Epsilon', excellent: 15, pass: 58, fail: 27 }
      ];
    }

    if (examName) {
      this.dashboardData.examPerformanceBreakdown = this.dashboardData.examPerformanceBreakdown.filter((quiz: any, index: number) => 
        this.examsList[index % this.examsList.length] === examName
      );
      this.dashboardData.quizPerformance.gradeDistribution = this.dashboardData.quizPerformance.gradeDistribution.filter((dist: any) => 
        dist.quizName === examName || dist.group
      );
    }
    if (group) {
      this.groupResultsData = this.groupResultsData.filter((g: any) => g.label === group);
      this.dashboardData.groupPerformance = this.dashboardData.groupPerformance.filter((g: any) => g.name === group);
      this.dashboardData.quizPerformance.gradeDistribution = this.dashboardData.quizPerformance.gradeDistribution.filter((dist: any) => 
        dist.group === group || dist.quizName
      );
      this.dashboardData.engagementInsights.groupComparison = this.dashboardData.engagementInsights.groupComparison.filter((g: any) => g.group === group);
    }

    this.updateStudentRankings();
    this.applyConfidenceFilter();
  }

  applyConfidenceFilter() {
    if (this.confidenceFilter === 'all') {
      this.filteredConfidenceData = this.dashboardData.engagementInsights.confidenceVsCorrectness;
    } else {
      this.filteredConfidenceData = this.dashboardData.engagementInsights.confidenceVsCorrectness.map((item: any) => {
        if (this.confidenceFilter === 'Team Alpha') {
          return { ...item, confidence: item.confidence - 3, correctness: item.correctness + 3, gap: item.confidence - 3 - (item.correctness + 3) };
        } else if (this.confidenceFilter === 'Team Beta') {
          return { ...item, confidence: item.confidence + 2, correctness: item.correctness - 2, gap: item.confidence + 2 - (item.correctness - 2) };
        } else if (this.confidenceFilter === 'Team Gamma') {
          return { ...item, confidence: item.confidence - 1, correctness: item.correctness + 1, gap: item.confidence - 1 - (item.correctness + 1) };
        } else if (this.confidenceFilter === 'Team Delta') {
          return { ...item, confidence: item.confidence + 4, correctness: item.correctness - 4, gap: item.confidence + 4 - (item.correctness - 4) };
        } else {
          return { ...item, confidence: item.confidence - 2, correctness: item.correctness + 2, gap: item.confidence - 2 - (item.correctness + 2) };
        }
      });
    }
  }

  updateStudentRankings() {
    const topFilter = this.topPerformersFilter;
    const bottomFilter = this.needingAttentionFilter;

    if (topFilter !== 'overall') {
      this.dashboardData.topPerformers = this.dashboardData.topPerformers.map((student: any) => ({
        ...student,
        score: Math.floor(student.score * 0.9),
        quizzes: Math.floor(student.quizzes * 0.9)
      }));
    }
    if (bottomFilter !== 'overall') {
      this.dashboardData.needingAttention = this.dashboardData.needingAttention.map((student: any) => ({
        ...student,
        score: Math.floor(student.score * 1.1),
        quizzes: Math.floor(student.quizzes * 1.1)
      }));
    }
  }

  // Heatmap color function for Grade Distribution and Group Performance Comparison
  getHeatmapColor(value: number, isFail: boolean = false): string {
    if (isFail) {
      // For Fail, higher values are worse (redder)
      if (value >= 30) return 'rgba(239, 68, 68, 0.8)'; // Strong red
      if (value >= 20) return 'rgba(239, 68, 68, 0.5)'; // Medium red
      return 'rgba(239, 68, 68, 0.2)'; // Light red
    } else {
      // For Excellent and Pass, higher values are better (greener)
      if (value >= 60) return 'rgba(16, 185, 129, 0.8)'; // Strong green
      if (value >= 40) return 'rgba(16, 185, 129, 0.5)'; // Medium green
      return 'rgba(16, 185, 129, 0.2)'; // Light green
    }
  }
}