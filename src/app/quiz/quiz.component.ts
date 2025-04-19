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

interface QuizMetadata {
  quizId: string;
  title: string;
  description: string;
  timeAllowed: number;
  startsAt: string;
  numberOfQuestions: number;
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
  ) {}

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
        panelClass: ['bg-red-100', 'text-red-800'],
      });
      return;
    }

    this.loading = true;
    this.error = '';

    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const result = await firstValueFrom(
        this.http.get<QuizMetadata>(
          `${this.baseLink}/api/quiz/metadata/${this.shortcode}`,
          headers,
        ),
      );
      this.quizMetadata = result ?? null;
    } catch (err) {
      this.error =
        'Failed to fetch quiz metadata. Please check your shortcode.';
      this.quizMetadata = null;
    } finally {
      this.loading = false;
    }
  }

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
      const quizData = await firstValueFrom(
        this.http.post<QuizData>(
          `${this.baseLink}/api/quiz/start/${this.quizMetadata.quizId}`,
          {},
          headers,
        ),
      );

      // Navigate with quiz data in state
      this.router.navigate(['/take-quiz', quizData.quizId], {
        state: { quizData },
      });
    } catch (err) {
      this.error = 'Failed to start the quiz. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}
