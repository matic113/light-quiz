import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { SidebarStateService } from '../services/sidebar-state.service';

interface QuizResult {
  quizTitle: string;
  correctQuestions: number;
  totalQuestions: number;
  grade: number;
  possiblePoints: number;
  quizShortCode: string;
}



export interface CorrectedQuizModel {
  quizId: string;
  shortCode: string;
  title: string;
  description: string;
  grade: number;
  possiblePoints: number;
  correctQuestions: number;
  totalQuestions: number;
  submissionDate: string; // تقدر تحولها لـ Date لو حابب
  gradingDate: string;
  questions: QuestionResult[];
}

export interface QuestionResult {
  questionText: string;
  options: QuestionOption[];
  points: number;
  studentAnsweredText: string;
  studentAnsweredOption: string | null;
  correctOption: string | null;
  isCorrect: boolean;
  imageUrl?: string;
  feedbackMessage: string;
}

export interface QuestionOption {
  optionId: string;
  optionText: string;
  optionLetter: string;
}


@Component({
  selector: 'app-results',
  imports: [
    CommonModule
  ],
  templateUrl: './results.component.html',
  styleUrl: './results.component.css',
})
export class ResultsComponent {
  isExpanded: boolean = true;

  results: QuizResult[] = [];
  isLoading = true;
  // isAnswersLoading = false;
  isAnswersLoadingMap: { [shortCode: string]: boolean } = {};

  private baseUrl = 'https://api.theknight.tech';


  constructor(private http: HttpClient, private authService: AuthService, private sidebarStateService: SidebarStateService
  ) { }


  ngOnInit(): void {
    const token = this.authService.getToken();
    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    // TODO : quiz id changes later 
    this.http.get<QuizResult[]>(`${this.baseUrl}/api/student/results`, headers)
      .subscribe({
        next: (data) => {
          this.results = data;
          this.isLoading = false;
          console.log(data);
        },
        error: () => {
          this.isLoading = false;
          // تقدر تعرض رسالة خطأ لو حبيت
        }
      });
    this.sidebarStateService.setSidebarState(true);

    this.sidebarStateService.isExpanded$.subscribe(value => {
      this.isExpanded = value;

    });
  }



  selectedQuiz!: CorrectedQuizModel;
  isModalOpen = false;

  showAnswers(quizShortCode: string) {
    this.isAnswersLoadingMap[quizShortCode] = true;
    this.http.get<CorrectedQuizModel>(`${this.baseUrl}/api/quiz/review/${quizShortCode}`, {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`,
      },
    }).subscribe({
      next: (quiz) => {
        this.selectedQuiz = quiz;
        this.isModalOpen = true;
        this.isAnswersLoadingMap[quizShortCode] = false;
      },
      error: (err) => {
        console.error('Error fetching quiz answers:', err);
        this.isAnswersLoadingMap[quizShortCode] = false;
      }
    });
  }

  closeModal() {
    this.isModalOpen = false;
  }



}
