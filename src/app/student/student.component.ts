import { Component } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { NoCopyDirective } from '../directives/no-copy.directive';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, NoCopyDirective],
})
export class StudentComponent {
  private backEndBaseUrl = 'https://api.theknight.tech';
  private _studentId: string;
  quiz: any;
  answers: { [key: string]: string } = {};
  minutes: number = 0;
  seconds: number = 0;
  private timerInterval: any;
  isSubmittedSuccessfully = false;

  isPageBlurred: boolean = false;
  private screenThreshold = 0.5;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    public authService: AuthService, private router: Router
  ) {
    this._studentId = this.authService.getStudentId() || '';
  }

  onBlur = () => {
    this.isPageBlurred = true;
  };

  onFocus = () => {
    this.checkWindowSize(); // رجع فوكس، نعيد التحقق من الحجم
  };

  checkWindowSize = () => {
    const widthRatio = window.innerWidth / screen.width;
    const heightRatio = window.innerHeight / screen.height;

    if (widthRatio < this.screenThreshold || heightRatio < this.screenThreshold) {
      this.isPageBlurred = true;
    } else {
      this.isPageBlurred = false;
    }
  };


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const quizId = params['quizId'];
      if (quizId) {
        this.fetchQuiz(quizId);
      }
    });
    window.addEventListener('blur', this.onBlur);
    window.addEventListener('focus', this.onFocus);
    window.addEventListener('resize', this.checkWindowSize);
    this.checkWindowSize(); // check once on load
  }


  fetchQuiz(quizId: string): void {
    this.http.get(`${this.backEndBaseUrl}/api/quiz/${quizId}`, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    }).subscribe({
      next: (data: any) => {
        this.quiz = data;
        if (this.quiz.durationMinutes > 0) {
          this.startTimer(this.quiz.durationMinutes);
        }

      },
      error: (r) => {
        alert('Error: ' + r.error);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    window.removeEventListener('blur', this.onBlur);
    window.removeEventListener('focus', this.onFocus);
    window.removeEventListener('resize', this.checkWindowSize);
  }

  startTimer(durationMinutes: number): void {
    let totalSeconds = durationMinutes * 60;
    this.updateTimerDisplay(totalSeconds);

    this.timerInterval = setInterval(() => {
      totalSeconds--;
      this.updateTimerDisplay(totalSeconds);

      if (totalSeconds <= 0) {
        clearInterval(this.timerInterval);
        this.submitQuiz();
      }
    }, 1000);
  }

  updateTimerDisplay(totalSeconds: number): void {
    this.minutes = Math.floor(totalSeconds / 60);
    this.seconds = totalSeconds % 60;
  }

  getProgress(): number {
    if (!this.quiz?.durationMinutes) return 0;
    const totalSeconds = this.quiz.durationMinutes * 60;
    const elapsedSeconds = totalSeconds - (this.minutes * 60 + this.seconds);
    return (elapsedSeconds / totalSeconds) * 100;
  }

  getProgressColor(): string {
    return this.getProgress() >= 70 ? 'bg-red-300' : 'bg-green-100';
  }

  submitQuiz(): void {
    const formattedAnswers = this.quiz.questions.map((q: any) => {
      const answer = this.answers[q.questionId] || '';
      return {
        questionId: q.questionId,
        optionLetter: (q.typeId === 1 || q.typeId === 2) ? answer : null,
        answerText: q.typeId === 3 ? answer : null,
      };
    });


    const payload = {
      quizId: this.quiz.quizId,
      studentId: this._studentId,
      answers: formattedAnswers,
    };

    this.http.post(`${this.backEndBaseUrl}/api/student/submit/${this.quiz.quizId}`, payload,
      {
        headers: {
          'Authorization': `Bearer ${this.authService.getToken()}`
        }
      }
    ).subscribe({
      next: () => {
        this.isSubmittedSuccessfully = true;
      },
      error: () => {
        alert('An error occurred while submitting.');
      },
    });
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

}
