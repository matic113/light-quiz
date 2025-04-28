import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Import HttpHeaders
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Subject, Subscription } from 'rxjs'; // Import Subject and Subscription
import { debounceTime } from 'rxjs/operators'; // Import debounceTime
import { MatSnackBar } from '@angular/material/snack-bar'; // Import MatSnackBar
import { CustomSnackbarComponent } from '../shared/components/snackbar/custom-snackbar.component'; // Import Snackbar component

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
  imageUrl?: string;
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

interface SaveProgressPayload {
  attemptId: string;
  questionsAnswers: SaveQuestionAnswer[];
}

interface SaveQuestionAnswer {
  questionId: string;
  answerText: string | null;
  answerOptionLetter: string | null;
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
  loading = false; // For submit loading
  saving = false; // For progress saving indicator

  private saveSubject = new Subject<void>();
  private saveSubscription: Subscription | null = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
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
        this.applySavedAnswers(this.progress.questionsAnswers);
      }

      // Check if we need to fetch the latest progress
      // If we're coming from a page refresh (not from resume endpoint)
      // we should fetch the latest progress
      const navigation = this.router.getCurrentNavigation();
      const isFromNavigation = navigation && navigation.extras.state;

      if (!isFromNavigation) {
        // Only fetch progress if we're not coming directly from navigation
        // (i.e., page was refreshed)
        this.fetchLatestProgress();
      }

      // Start timer based on progress or initial duration
      if (this.progress?.attemptEndTimeUTC) {
        this.startTimerFromEndTime(this.progress.attemptEndTimeUTC);
      } else {
        this.startTimer(this.quiz.durationMinutes);
      }

      // Setup debounced saving
      this.saveSubscription = this.saveSubject
        .pipe(debounceTime(1500)) // Wait 1.5 seconds after the last change
        .subscribe(() => this.saveProgress());

    } else {
      // If no quiz data found, redirect back
      this.error = 'No quiz data found';
      setTimeout(() => {
        this.router.navigate(['/quiz']);
      }, 2000);
    }
  }

  private fetchLatestProgress(): void {
    if (!this.quiz) return;

    const token = this.authService.getToken();
    if (!token) {
      console.error('Cannot fetch progress: Authentication token not found.');
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<QuizProgress>(`${this.baseUrl}/api/student/progress/${this.quiz.quizId}`, { headers })
      .subscribe({
        next: (latestProgress) => {
          if (latestProgress && latestProgress.questionsAnswers?.length > 0) {
            // Update the progress object
            this.progress = latestProgress;

            // Clear existing answers
            this.answers = {};

            // Load the latest answers using the shared function
            this.applySavedAnswers(latestProgress.questionsAnswers);

            // Update timer if needed
            if (latestProgress.attemptEndTimeUTC) {
              this.stopTimer();
              this.startTimerFromEndTime(latestProgress.attemptEndTimeUTC);
            }
          }
        },
        error: (error) => {
          console.error('Failed to fetch latest progress:', error);
          // Continue with existing progress data if fetch fails
        }
      });
  }

  /**
   * Applies saved answers from progress data to the current quiz
   * @param questionsAnswers Array of saved question answers
   */
  private applySavedAnswers(questionsAnswers: QuestionAnswer[]): void {
    questionsAnswers.forEach(qa => {
      const questionId = qa.questionId;
      const correspondingQuestion = this.quiz?.questions.find(q => q.questionId === questionId);

      if (correspondingQuestion) {
        let savedValue: string | null = null;
        if (correspondingQuestion.typeId === 1 || correspondingQuestion.typeId === 2) {
          // For choice questions, check both possible field names
          savedValue = qa.optionLetter ?? (qa as any).answerOptionLetter ?? null;
        } else if (correspondingQuestion.typeId === 3 || correspondingQuestion.typeId === 4) {
          // For text questions, use answerText
          savedValue = qa.answerText ?? null;
        } else {
          console.warn(`Unknown question type ${correspondingQuestion.typeId} for Q ${questionId} during loading.`);
          savedValue = qa.optionLetter ?? qa.answerText ?? null;
        }
        this.answers[questionId] = savedValue;
      }
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
    // Unsubscribe from the save subject to prevent memory leaks
    this.saveSubscription?.unsubscribe();
  }

  // Called from template on answer change
  onAnswerChange(): void {
    if (!this.isSubmitted) { // Only save if not submitted
      this.saveSubject.next();
    }
  }

  private async saveProgress(): Promise<void> {
    if (!this.quiz || this.isSubmitted || this.saving) return;

    const token = this.authService.getToken();
    if (!token) {
      console.error('Cannot save progress: Authentication token not found.');
      // Optionally show a snackbar message
      return;
    }

    this.saving = true;
    const attemptId = this.progress?.attemptId ?? this.quiz.attemptId;
    if (!attemptId) {
      console.error('Cannot save progress: Attempt ID not found.');
      this.saving = false;
      return;
    }

    const questionsAnswers: SaveQuestionAnswer[] = this.quiz.questions.map(question => {
      const answerValue = this.answers[question.questionId];
      let answerText: string | null = null;
      let answerOptionLetter: string | null = null;

      // Type IDs: 1 = MC, 2 = T/F, 3 = Short Answer, 4 = Text
      if (question.typeId === 1 || question.typeId === 2) {
        // Choice-based: answerValue is the optionLetter
        answerOptionLetter = typeof answerValue === 'string' ? answerValue : null;
        answerText = ""; // Explicitly empty string for choice questions
      } else if (question.typeId === 3 || question.typeId === 4) {
        // Text-based: answerValue is the text
        answerText = typeof answerValue === 'string' ? answerValue : null;
        answerOptionLetter = null; // Explicitly null for text questions
      } else {
        // Handle unknown types if necessary, maybe log a warning
        console.warn(`Unknown question typeId: ${question.typeId} for question ${question.questionId}`);
      }

      return {
        questionId: question.questionId,
        answerText: answerText,
        answerOptionLetter: answerOptionLetter
      };
    });

    const payload: SaveProgressPayload = {
      attemptId: attemptId,
      questionsAnswers: questionsAnswers
    };

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    try {
      await this.http.post(`${this.baseUrl}/api/student/progress/${this.quiz.quizId}`, payload, { headers }).toPromise();
      console.log('Progress saved successfully.');
      // Optional: Show success snackbar (briefly)
      // this.snackBar.open('Progress saved', 'Dismiss', { duration: 1000 });
    } catch (error) {
      console.error('Failed to save progress:', error);
      // Optional: Show error snackbar
      this.snackBar.openFromComponent(CustomSnackbarComponent, {
        data: {
          message: 'Failed to save progress. Please check your connection.',
          action: 'Close',
          panelClass: ['bg-yellow-100', 'text-yellow-800'], // Warning style
        },
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
      });
    } finally {
      this.saving = false;
    }
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
        // Ensure progress is saved before auto-submitting
        this.saveProgress().then(() => this.submitQuiz());
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

  async submitQuiz(): Promise<void> { // Make async to await final save
    if (!this.quiz || this.isSubmitted) return;

    // Ensure latest progress is saved before submitting
    await this.saveProgress();

    // Stop the timer and prevent further saves
    this.stopTimer();
    this.isSubmitted = true; // Set submitted flag early
    this.saveSubscription?.unsubscribe(); // Stop listening for changes

    const formattedAnswers = this.quiz.questions.map((question) => {
      const answerValue = this.answers[question.questionId];
      return {
        questionId: question.questionId,
        optionLetter:
          (question.typeId === 1 || question.typeId === 2)
            ? (typeof answerValue === 'string' ? answerValue : null)
            : null,
        answerText:
          (question.typeId === 3 || question.typeId === 4)
            ? (typeof answerValue === 'string' ? answerValue : null)
            : null,
      };
    });

    const payload = {
      quizId: this.quiz.quizId,
      attemptId: this.progress?.attemptId ?? this.quiz.attemptId,
      answers: formattedAnswers,
    };

    const token = this.authService.getToken();
    if (!token) {
      this.error = 'Authentication token not found. Please log in again.';
      this.isSubmitted = false; // Revert submitted status if auth fails
      return;
    }
    this.loading = true; // Show loading for submission
    this.saving = false; // Ensure saving indicator is off

    this.http
      .post(`${this.baseUrl}/api/student/submit/${this.quiz.quizId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: () => {
          // No need to set isSubmitted again, already done
          this.loading = false;
          // Navigate to results or dashboard after successful submission
          this.router.navigate(['/results']); // Or '/dashboard'
        },
        error: (error) => {
          console.error('Quiz submission failed:', error);
          this.error = error.error?.message || error.message || 'Failed to submit quiz. Please try again.';
          this.loading = false;
          this.isSubmitted = false; // Allow retry if submission fails
          // Re-enable saving if submission fails?
          // this.saveSubscription = this.saveSubject.pipe(debounceTime(1500)).subscribe(() => this.saveProgress());
        },
      });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
