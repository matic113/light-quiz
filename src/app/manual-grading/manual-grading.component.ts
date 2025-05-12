import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth/auth.service';
import { SidebarStateService } from '../services/sidebar-state.service';

interface Question {
  questionId?: string;
  questionText: string;
  imageUrl: string | null;
  options: {
    optionId: string;
    optionText: string;
    optionLetter: string;
  }[];
  points: number;
  studentAnsweredText: string;
  studentAnsweredOption: string | null;
  correctOption: string | null;
  isCorrect: boolean;
  aiMessage: string;
  aiConfidence: number;
  aiRating: number;
}

interface QuizSubmission {
  quizId: string;
  shortCode: string;
  title: string;
  description: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  grade: number;
  possiblePoints: number;
  correctQuestions: number;
  totalQuestions: number;
  submissionDate: string;
  gradingDate: string;
  questions: Question[];
}

@Component({
  selector: 'app-manual-grading',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './manual-grading.component.html',
  styleUrl: './manual-grading.component.css'
})
export class ManualGradingComponent implements OnInit {
  submission: QuizSubmission | null = null;
  loading = true;
  error: string | null = null;
  baseUrl = 'https://api.theknight.tech';
  isExpanded: boolean = true;
  isMobile: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private sidebarStateService: SidebarStateService
  ) {}

  ngOnInit() {
    this.sidebarStateService.setSidebarState(true);

    this.sidebarStateService.isExpanded$.subscribe(value => {
      this.isExpanded = value;
    });

    this.sidebarStateService.isMobile$.subscribe(isMobile => {
      this.isMobile = isMobile;
    });

    this.route.queryParams.subscribe(params => {
      const { quizShortCode, studentId } = params;
      if (quizShortCode && studentId) {
        this.fetchSubmission(quizShortCode, studentId);
      } else {
        this.error = 'Missing required parameters';
        this.loading = false;
      }
    });
  }

  private fetchSubmission(quizShortCode: string, studentId: string) {
    const token = this.authService.getToken();
    if (!token) {
      this.error = 'Authentication required';
      this.loading = false;
      return;
    }

    this.http.get<QuizSubmission>(`${this.baseUrl}/api/quiz/manual-grading`, {
      params: { quizShortCode, studentId },
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        this.submission = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load submission data';
        this.loading = false;
        console.error('Error fetching submission:', err);
      }
    });
  }

  needsReview(question: Question): boolean {
    return question.aiConfidence < 5;
  }

  toggleQuestionCorrectness(question: Question) {
    if (!this.submission) return;
    question.isCorrect = !question.isCorrect;
  }

  saveAllChanges() {
    if (!this.submission) return;
    
    // Prepare the update payload
    const updatePayload = {
      quizId: this.submission.quizId,
      studentId: this.submission.studentId,
      questions: this.submission.questions.map(q => ({
        questionId: q.questionId,
        newGrade: q.isCorrect ? q.points : 0,
        isCorrect: q.isCorrect  
      }))
    };

    // Debug: log the payload
    console.log('Sending update payload:', updatePayload);

    // Send the update to the backend
    const token = this.authService.getToken();
    if (!token) {
      this.error = 'Authentication required';
      return;
    }

    this.loading = true;
    this.http.post(`${this.baseUrl}/api/quiz/update-grades`, updatePayload, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        // Update successful
        this.loading = false;
        console.log('Grades updated successfully');
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to update grades';
        console.error('Error updating grades:', err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/quizzes']);
  }
}
