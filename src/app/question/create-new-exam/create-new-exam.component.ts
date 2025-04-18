import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../shared/components/dialog/confirm-dialog.component';
import { CustomSnackbarComponent } from '../../shared/components/snackbar/custom-snackbar.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

type Question = {
  type: 'Multiple Choice' | 'True/False' | 'Short Answer' | 'Text';
  q: string;
  points?: number;
  correctAnswer?: string;
  correctOptionId?: number;
  options?: string[];
};

type Exam = {
  title: string;
  description: string;
  exam_type?: 'Multiple Choice' | 'Short Answer' | 'Mixed';
  date: string;
  time: string;
  duration?: number;
  questions: Question[];
};

const questionTypeNameToId: { [key: string]: number } = {
  'Multiple Choice': 1,
  'True/False': 2,
  'Short Answer': 3,
  Text: 4,
};

@Component({
  selector: 'app-create-new-exam',
  templateUrl: './create-new-exam.component.html',
  styleUrls: ['./create-new-exam.component.css'],
  imports: [CommonModule, DragDropModule, FormsModule, MatDialogModule, MatSnackBarModule],
  standalone: true,
})
export class CreateNewExamComponent {
  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  currentStep: number = 1;
  showDropdown = false;
  questionsList: Question[] = [];
  showTypeSelector = false;
  examData: Exam = {
    title: '',
    description: '',
    exam_type: undefined,
    date: '',
    time: '',
    duration: undefined,
    questions: this.questionsList,
  };

  // next بتاعت اول شاشة
  navigateToAddQuetionsStep() {
    if (
      this.examData.title.trim() &&
      this.examData.description.trim() &&
      this.examData.date &&
      this.examData.time &&
      this.examData.duration &&
      this.examData.exam_type
    ) {
      this.currentStep = 2;
    } else {
      alert(
        'Please complete all required fields:\n' +
        (!this.examData.title.trim() ? '- Title is required\n' : '') +
        (!this.examData.description.trim()
          ? '- Description is required\n'
          : '') +
        (!this.examData.date ? '- Date is required\n' : '') +
        (!this.examData.time ? '- Time is required\n' : '') +
        (!this.examData.duration ? '- Duration is required\n' : '') +
        (!this.examData.exam_type ? '- Exam type is required' : '')
      );
    }
  }

  // next بتاعت شاشة اضافة الاسئلة
  navigateToReviewStep() {
    if (
      this.questionsList.length > 0 &&
      this.questionsList.every(
        (q) => q.q.trim() && q.points !== undefined &&
          (
            (q.type === 'Multiple Choice' || q.type === 'True/False')
              ? q.correctOptionId !== undefined && q.correctOptionId !== null
              : q.correctAnswer && q.correctAnswer.trim() !== ''
          )
      )
    ) {
      this.currentStep = 3;
    } else {
      alert(
        (!this.questionsList.length ? '- No questions added\n' : '') +
        (this.questionsList.some((q) => !q.q.trim())
          ? `- Question text #${this.questionsList.findIndex((q) => !q.q.trim()) + 1
          } is required\n`
          : '') +
        (this.questionsList.some((q) =>
          (q.type === 'Multiple Choice' || q.type === 'True/False') &&
          (q.correctOptionId === undefined || q.correctOptionId === null)
        )
          ? `- Question #${this.questionsList.findIndex((q) =>
            (q.type === 'Multiple Choice' || q.type === 'True/False') &&
            (q.correctOptionId === undefined || q.correctOptionId === null)
          ) + 1
          }'s correct option is required\n`
          : '') +
        (this.questionsList.some((q) =>
          (q.type !== 'Multiple Choice' && q.type !== 'True/False') &&
          (!q.correctAnswer || q.correctAnswer.trim() === '')
        )
          ? `- Question #${this.questionsList.findIndex((q) =>
            (q.type !== 'Multiple Choice' && q.type !== 'True/False') &&
            (!q.correctAnswer || q.correctAnswer.trim() === '')
          ) + 1
          }'s correct answer is required\n`
          : '') +
        (this.questionsList.some((q) => q.points === undefined)
          ? `- Question #${this.questionsList.findIndex((q) => q.points === undefined) + 1
          }'s points is required\n`
          : '')
      );
    }
  }

  confirmStep() {
    const apiUrl = 'https://api.theknight.tech/api/quiz';
    const examPayload = this.mapExamToBackendPayload();
    const token = this.authService.getToken();

    console.log(JSON.stringify(examPayload));

    if (!token) {
      this.snackBar.openFromComponent(CustomSnackbarComponent, {
        data: {
          message: 'You are not logged in. Please log in first.',
          action: 'Close',
          panelClass: ['bg-red-100', 'text-red-800']
        },
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        panelClass: ['bg-red-100', 'text-red-800']
      });
      return;
    }

    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Are you sure?',
        text: 'Do you want to create this exam?',
        confirmText: 'Yes, create it!',
        cancelText: 'No, cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.post(apiUrl, examPayload, headers).subscribe({
          next: () => {
            this.snackBar.openFromComponent(CustomSnackbarComponent, {
              data: {
                message: 'Exam created successfully',
                action: 'Close',
                panelClass: ['bg-green-100', 'text-green-800']
              },
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'bottom',
              panelClass: ['bg-green-100', 'text-green-800']
            });

            // Reset form
            this.currentStep = 1;
            this.examData = {
              title: '',
              description: '',
              exam_type: undefined,
              date: '',
              time: '',
              duration: undefined,
              questions: [],
            };
            this.questionsList = [];
          },
          error: (err) => {
            console.error('Error creating exam:', err);
            this.snackBar.open('Failed to create exam. Please try again.', 'Close', {
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'bottom',
              panelClass: ['bg-red-100', 'text-red-800']
            });
          },
        });
      } else {
        this.snackBar.open('Exam creation was cancelled', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom'
        });
      }
    });
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  addQuestion() {
    this.showTypeSelector = true;
  }

  createQuestion(type: 'mcq' | 'subjective') {
    if (type === 'mcq') {
      this.questionsList.push({
        type: 'Multiple Choice',
        q: '',
        options: ['', ''],
        correctAnswer: '',
      });
    } else {
      this.questionsList.push({
        type: 'Short Answer',
        q: '',
        correctAnswer: '',
      });
    }
    this.showDropdown = false;
    this.showTypeSelector = false;
  }

  removeQuestion(index: number) {
    this.questionsList.splice(index, 1);
  }

  addOption(question: any) {
    question.options.push('');
  }

  removeOption(question: any, index: number) {
    if (question.options!.length >= 3) {
      question.options.splice(index, 1);
    }
  }

  toggleDropdownForAddQuetion() {
    if (this.examData.exam_type === 'Mixed') {
      this.showDropdown = !this.showDropdown;
    } else if (this.examData.exam_type === 'Multiple Choice') {
      this.createQuestion('mcq');
    } else if (this.examData.exam_type === 'Short Answer') {
      this.createQuestion('subjective');
    }
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.questionsList,
      event.previousIndex,
      event.currentIndex
    );
  }

  mapExamToBackendPayload(): any {
    const startsAtUTC = new Date(
      `${this.examData.date}T${this.examData.time}:00Z`
    ).toISOString();

    const mappedQuestions = this.examData.questions.map((question) => {
      // using a dictionary to map question types to ids
      const questionTypeId = questionTypeNameToId[question.type];
      // make sure the points are integer as the backend expects
      const points = parseInt(String(question.points ?? 0), 10);
      // start with an empty array
      // if the question has options then we fill the array otherwise leave it empty
      let options: any[] = [];

      if (
        question.type === 'Multiple Choice' ||
        question.type === 'True/False'
      ) {
        options = (question.options || []).map((optionText, i) => ({
          optionText: optionText,
          isCorrect: i == question.correctOptionId,
          optionLetter: String.fromCharCode(97 + i), // 97 => 'a' (ascii codes)
        }));
        // correctAnswer is always empty string for option-based questions
        question.correctAnswer = '';
      }

      return {
        questionText: question.q,
        questionTypeId: questionTypeId,
        points: points,
        correctAnswer: question.correctAnswer,
        options: options,
      };
    });

    return {
      title: this.examData.title,
      description: this.examData.description,
      startsAtUTC: startsAtUTC,
      durationMinutes: this.examData.duration || 0,
      anonymous: true,
      questions: mappedQuestions,
    };
  }
}
