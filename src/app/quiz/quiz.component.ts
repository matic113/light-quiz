import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from '../auth/auth.service';
import { CustomSnackbarComponent } from '../shared/components/snackbar/custom-snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { SidebarStateService } from '../services/sidebar-state.service';

interface QuizMetadata {
  quizId: string;
  title: string;
  description: string;
  timeAllowed: number;
  startsAt: string;
  numberOfQuestions: number;
  didStartQuiz: boolean;
}

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

// Interfaces matching those in take-quiz.component.ts for consistency
interface QuizDetails { // Structure expected within ResumeResponse and potentially from start
  quizId: string;
  attemptId: string;
  title: string;
  description: string;
  startsAtUTC: string;
  durationMinutes: number;
  questions: QuizQuestion[];
}

interface QuestionAnswer { // Needed for QuizProgress
  questionId: string;
  optionLetter: string | null;
  answerText: string | null;
}

interface QuizProgress { // Structure expected within ResumeResponse
  attemptId: string;
  questionsAnswers: QuestionAnswer[];
  lastSaved: string;
  attemptStartTimeUTC: string;
  attemptEndTimeUTC: string;
}

interface ResumeResponse { // Structure returned by the resume endpoint
  quiz: QuizDetails;
  progress: QuizProgress;
}

// Original QuizData interface (potentially returned by start endpoint)
interface QuizData extends QuizMetadata {
  attemptId: string;
  questions: QuizQuestion[];
  durationMinutes: number;
  startsAtUTC: string;
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css',
})
export class QuizComponent {
  // ----------------sidebar state--------------------------------
    isExpanded: boolean = true;
  
    ngOnInit(): void {
      this.sidebarStateService.setSidebarState(true); 
    
      this.sidebarStateService.isExpanded$.subscribe(value => {
        this.isExpanded = value;
      });
    }
  // ----------------------------------------------------------------------------
  shortcode: string = '';
  quizMetadata: QuizMetadata | null = null;
  baseLink = 'https://api.theknight.tech';
  error: string = '';
  loading: boolean = false;



  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private sidebarStateService: SidebarStateService

  ) { }

  async getQuizMetadata() {
    if (!this.shortcode.trim()) {
      this.error = 'Please enter a shortcode';
      return;
    }
  
    const token = this.authService.getToken();
    if (!token) {
      this.snackBar.openFromComponent(CustomSnackbarComponent, {
        data: {
          message: 'You are not logged in. Please log in first.',
          action: 'Close',
          panelClass: ['bg-red-100', 'text-red-800'],
        },
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
      });
      return;
    }
  
    this.loading = true;
    this.error = '';
  
    try {
      const result = await firstValueFrom(
        this.http.get<QuizMetadata>(
          `${this.baseLink}/api/quiz/metadata/${this.shortcode}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );
      this.quizMetadata = result ?? null;
  
      if (this.quizMetadata) {
        const now = Date.now();
        const startTime = new Date(this.quizMetadata.startsAt).getTime();
        // مدة الاختبار بالمللي ثانية
        const durationMs = this.quizMetadata.timeAllowed * 60_000;
        const endTime = startTime + durationMs;
  
        if (now < startTime) {
          // لم يبدأ بعد: جدولة التفعيل عند لحظة البداية
          this.canStartQuiz = false;
          setTimeout(() => {
            this.canStartQuiz = true;
            // جدولة إيقاف التفعيل عند نهاية الوقت
            setTimeout(() => {
              this.canStartQuiz = false;
            }, durationMs);
          }, startTime - now);
        } else if (now >= startTime && now < endTime) {
          // داخل فترة الاختبار الآن: فعّل الزر وجدول تعطيله
          this.canStartQuiz = true;
          setTimeout(() => {
            this.canStartQuiz = false;
          }, endTime - now);
        } else {
          // تجاوزت الفترة
          this.canStartQuiz = false;
        }
      }
  
    } catch (err: any) {
      if (err.status === 404) {
        this.error = 'Failed to fetch quiz metadata. Please check your shortcode.';
      } else if (err.status === 400) {
        this.error = 'You have already attempted this quiz before.';
      }
      this.quizMetadata = null;
    } finally {
      this.loading = false;
    }
  }
  
canStartQuiz: boolean = false; 
  async startQuiz() {
    if (!this.quizMetadata) return;

    const token = this.authService.getToken();
    if (!token) {
      this.snackBar.openFromComponent(CustomSnackbarComponent, {
        data: {
          message: 'You are not logged in. Please log in first.',
          action: 'Close',
          panelClass: ['bg-red-100', 'text-red-800'],
        },
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        panelClass: ['bg-red-100', 'text-red-800'],
      });
      return;
    }

    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      this.loading = true;
      const quizId = this.quizMetadata.quizId;
      let navigationData: any; // Use 'any' temporarily or create a union type
      let navigateToQuizId: string;

      if (this.quizMetadata.didStartQuiz) {
        // Call the resume endpoint - Expects ResumeResponse
        const resumeResponse = await firstValueFrom(
          this.http.post<ResumeResponse>( // <-- Expect ResumeResponse
            `${this.baseLink}/api/quiz/resume/${quizId}`,
            {},
            headers
          )
        );
        navigationData = resumeResponse; // Pass the whole ResumeResponse
        navigateToQuizId = resumeResponse.quiz.quizId; // Get quizId from the nested structure
      } else { // else means that it's the first time to start this quiz
        // Call the start endpoint - Assume it returns QuizData (adjust if needed)
        const startResponse = await firstValueFrom(
          this.http.post<QuizData>( // <-- Assume QuizData for start
            `${this.baseLink}/api/quiz/start/${quizId}`,
            {},
            headers
          )
        );
        // Map QuizData to the structure expected by TakeQuizComponent (like ResumeResponse)
        const mappedQuizDetails: QuizDetails = {
          quizId: startResponse.quizId,
          attemptId: startResponse.attemptId,
          title: startResponse.title,
          description: startResponse.description,
          startsAtUTC: startResponse.startsAtUTC, // Directly use from QuizData
          durationMinutes: startResponse.durationMinutes, // Directly use from QuizData
          questions: startResponse.questions
        };

        // Create the navigation data structure similar to ResumeResponse
        navigationData = {
          quiz: mappedQuizDetails,
          progress: null // No progress when starting fresh
        };
        navigateToQuizId = startResponse.quizId;
      }

      // Navigate with the correct data structure in state
      this.router.navigate(['/take-quiz', navigateToQuizId], {
        state: { quizData: navigationData }, // Pass data under 'quizData' key
      });
    } catch (err: any) {
      console.log(err);

      if (err.status === 400) {
        this.snackBar.openFromComponent(CustomSnackbarComponent, {
          data: {
            message: 'You have already attempted this quiz before.',
            action: 'Close',
            panelClass: ['bg-red-100', 'text-red-800'],
          },
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['bg-red-100', 'text-red-800'],
        });
      } else {
        this.snackBar.openFromComponent(CustomSnackbarComponent, {
          data: {
            message: 'Failed to start the quiz. Please try again.',
            action: 'Close',
            panelClass: ['bg-red-100', 'text-red-800'],
          },
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['bg-red-100', 'text-red-800'],
        });

      }
    } finally {
      this.loading = false;
    }
  }

  cancel() {
    this.quizMetadata = null;
    this.error = '';
    this.shortcode = ''; // Also clear the shortcode input
  }
}
