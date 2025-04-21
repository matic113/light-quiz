import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

interface QuizOption {
  optionId: string;
  optionText: string;
  optionLetter: string;
}

interface QuizQuestion {
  questionId: string;
  quizId: string;
  text: string;
  typeId: number;
  points: number;
  options: QuizOption[];
}

interface QuizDetails {
  quizId: string;
  attemptId: string;
  title: string;
  description: string;
  startsAtUTC: string;
  durationMinutes: number;
  questions: QuizQuestion[];
}

interface QuestionAnswer {
  questionId: string;
  optionLetter: string | null;
  answerText: string | null;
}

interface QuizProgress {
  attemptId: string;
  questionsAnswers: QuestionAnswer[];
  lastSaved: string;
  attemptStartTimeUTC: string;
  attemptEndTimeUTC: string;
}

interface ResumeResponse {
  quiz: QuizDetails;
  progress: QuizProgress;
}

@Component({
  selector: 'app-take-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './take-quiz.component.html',
  styleUrl: './take-quiz.component.css',
})
export class TakeQuizComponent implements OnInit, OnDestroy {
  private baseUrl = 'https://api.theknight.tech';
  quiz: QuizDetails | null = null;
  progress: QuizProgress | null = null;
  answers: { [key: string]: string | null } = {}; // Allow null for text answers initially
  minutes: number = 0;
  seconds: number = 0;
  private timerInterval: any;
  isSubmitted = false;
  error: string | null = null;
  loading = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {
    // Get quiz data from router state
    const navigation = this.router.getCurrentNavigation();
    // Adjust state type to ResumeResponse
    const state = navigation?.extras.state as { quizData: ResumeResponse };
    if (state && state.quizData) {
      this.quiz = state.quizData.quiz;
      this.progress = state.quizData.progress;
    } else {
      // Handle case where data might be just QuizData (for non-resume starts)
      // This might need adjustment based on how startQuiz passes data
      const fallbackState = navigation?.extras.state as { quizData: QuizDetails };
      if (fallbackState && fallbackState.quizData) {
        this.quiz = fallbackState.quizData;
        // No progress data in this case
      }
    }
  }

  ngOnInit(): void {
    if (this.quiz) {
      // Initialize answers from progress if available
      if (this.progress && this.progress.questionsAnswers?.length > 0) {
        this.progress.questionsAnswers.forEach(qa => {
          // Prioritize optionLetter for MC/TF, otherwise use answerText
          this.answers[qa.questionId] = qa.optionLetter ?? qa.answerText;
        });
      }

      // Start timer based on progress or initial duration
      if (this.progress?.attemptEndTimeUTC) {
        this.startTimerFromEndTime(this.progress.attemptEndTimeUTC);
      } else {
        this.startTimer(this.quiz.durationMinutes);
      }
    } else {
      // If no quiz data found, redirect back
      this.error = 'No quiz data found';
      setTimeout(() => {
        this.router.navigate(['/quiz']);
      }, 2000);
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  private startTimer(durationMinutes: number): void {
    if (!durationMinutes) return;
    let totalSeconds = durationMinutes * 60;
    this.updateTimerDisplay(totalSeconds);
    this.startInterval(totalSeconds);
  }

  private startTimerFromEndTime(endTimeUTC: string): void {
    const now = new Date();
    const endTime = new Date(endTimeUTC);
    let totalSeconds = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));

    if (totalSeconds <= 0) {
        console.warn('Quiz time has already expired based on attemptEndTimeUTC.');
        // Optionally auto-submit or show a message
        this.minutes = 0;
        this.seconds = 0;
        // Consider calling submitQuiz() here if expired
        // this.submitQuiz();
        return; // Don't start the interval if time is up
    }

    this.updateTimerDisplay(totalSeconds);
    this.startInterval(totalSeconds);
  }

  private startInterval(initialTotalSeconds: number): void {
    let totalSeconds = initialTotalSeconds;
    this.timerInterval = setInterval(() => {
      totalSeconds--;
      this.updateTimerDisplay(totalSeconds);

      if (totalSeconds <= 0) {
        this.stopTimer();
        this.submitQuiz(); // Auto-submit when timer runs out
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private updateTimerDisplay(totalSeconds: number): void {
    this.minutes = Math.floor(totalSeconds / 60);
    this.seconds = totalSeconds % 60;
  }

  getProgress(): number {
    if (!this.quiz?.durationMinutes) return 0;

    let totalDurationSeconds: number;
    let remainingSeconds = this.minutes * 60 + this.seconds;

    // If resuming, calculate total duration based on start/end times if possible
    if (this.progress?.attemptStartTimeUTC && this.progress?.attemptEndTimeUTC) {
        const startTime = new Date(this.progress.attemptStartTimeUTC);
        const endTime = new Date(this.progress.attemptEndTimeUTC);
        totalDurationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    } else {
        // Fallback to durationMinutes if start/end times aren't available
        totalDurationSeconds = this.quiz.durationMinutes * 60;
    }

    if (totalDurationSeconds <= 0) return 100; // Avoid division by zero, assume completed if duration is zero or negative

    const elapsedSeconds = totalDurationSeconds - remainingSeconds;
    return (elapsedSeconds / totalDurationSeconds) * 100;
  }

  submitQuiz(): void {
    if (!this.quiz || this.isSubmitted) return;

    const formattedAnswers = this.quiz.questions.map((question) => ({
      questionId: question.questionId,
      // Ensure we send the correct format based on question type
      optionLetter:
        (question.typeId === 1 || question.typeId === 2)
          ? (this.answers[question.questionId] as string | null) // Cast needed if answers allows null
          : null,
      answerText:
        question.typeId === 3
          ? (this.answers[question.questionId] as string | null)
          : null,
    }));

    const payload = {
      quizId: this.quiz.quizId,
      // Use attemptId from progress if available, otherwise from quiz details
      attemptId: this.progress?.attemptId ?? this.quiz.attemptId,
      answers: formattedAnswers,
    };

    const token = this.authService.getToken();
    if (!token) {
        this.error = 'Authentication token not found. Please log in again.';
        // Optionally redirect to login
        return;
    }
    this.loading = true;

    this.http
      .post(`${this.baseUrl}/api/student/submit/${this.quiz.quizId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: () => {
          this.isSubmitted = true;
          this.loading = false;
          this.stopTimer();
          // Navigate to results or dashboard after successful submission
          this.router.navigate(['/results']); // Or '/dashboard'
        },
        error: (error) => {
          console.error('Quiz submission failed:', error);
          this.error = error.error?.message || error.message || 'Failed to submit quiz. Please try again.';
          this.loading = false;
        },
      });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
