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

interface QuizData {
  quizId: string;
  attemptId: string;
  title: string;
  description: string;
  startsAtUTC: string;
  durationMinutes: number;
  questions: QuizQuestion[];
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
  quiz: QuizData | null = null;
  answers: { [key: string]: string } = {};
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
    const state = navigation?.extras.state as { quizData: QuizData };
    if (state && state.quizData) {
      this.quiz = state.quizData;
    }
  }

  ngOnInit(): void {
    // Start timer if we have quiz data
    if (this.quiz) {
      this.startTimer(this.quiz.durationMinutes);
    } else {
      // If no quiz data in state, redirect back to quiz page
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

    this.timerInterval = setInterval(() => {
      totalSeconds--;
      this.updateTimerDisplay(totalSeconds);

      if (totalSeconds <= 0) {
        this.stopTimer();
        this.submitQuiz();
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
    const totalSeconds = this.quiz.durationMinutes * 60;
    const remainingSeconds = this.minutes * 60 + this.seconds;
    return ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  }

  submitQuiz(): void {
    if (!this.quiz || this.isSubmitted) return;

    const formattedAnswers = this.quiz.questions.map((question) => ({
      questionId: question.questionId,
      optionLetter:
        question.typeId === 1 || question.typeId === 2
          ? this.answers[question.questionId]
          : null,
      answerText:
        question.typeId === 3 ? this.answers[question.questionId] : null,
    }));

    const payload = {
      quizId: this.quiz.quizId,
      attemptId: this.quiz.attemptId,
      answers: formattedAnswers,
    };

    const token = this.authService.getToken();
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
        },
        error: (error) => {
          this.error = error.message || 'Failed to submit quiz';
          this.loading = false;
        },
      });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
