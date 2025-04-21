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
import Swal from 'sweetalert2';
import { SidebarStateService } from '../../services/sidebar-state.service';

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
  imports: [
    CommonModule,
    DragDropModule,
    FormsModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  standalone: true,
})
export class CreateNewExamComponent {
  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private sidebarStateService: SidebarStateService
  ) { }
  isExpanded: boolean = true;
  isMobile: boolean = true;

  ngOnInit(): void {
    this.sidebarStateService.setSidebarState(true);

    this.sidebarStateService.isExpanded$.subscribe(value => {
      this.isExpanded = value;
    });

    this.sidebarStateService.isMobile$.subscribe(isMobile => {
      this.isMobile = isMobile;
    });
  }



  generatedExamCode: string = '';
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
  navigateToAddQuestionsStep() {
    const missingFields: string[] = [];

    if (!this.examData.title.trim()) missingFields.push('• Title');
    if (!this.examData.description.trim()) missingFields.push('• Description');
    if (!this.examData.date) missingFields.push('• Date');
    if (!this.examData.time) missingFields.push('• Time');
    if (!this.examData.duration) missingFields.push('• Duration');
    if (!this.examData.exam_type) missingFields.push('• Exam Type');

    if (this.examData.duration && this.examData.duration < 0) {
      missingFields.push('• Duration must be a positive number');
    }

    const now = new Date();
    const examDateStr = this.examData.date; // بصيغة '2025-05-01'
    const examTimeStr = this.examData.time; // بصيغة '14:24'

    if (examDateStr && examTimeStr) {
      const [year, month, day] = examDateStr.split('-').map(Number);
      const [hours, minutes] = examTimeStr.split(':').map(Number);

      const examDateTime = new Date(year, month - 1, day, hours, minutes);

      if (examDateTime.getTime() <= now.getTime()) {
        if (examDateTime.toDateString() === now.toDateString()) {
          missingFields.push('• Time must be later than the current time');
        } else {
          missingFields.push('• Date must be a future date');
        }
      }
    }

    if (missingFields.length === 0) {
      this.currentStep = 2;
    } else {
      const htmlMessage = `
      <div style="text-align: center;">
        <strong>Please complete the following fields:</strong>
      </div>
      <div style="text-align: left; display: inline-block; padding-left: 20px; margin-top: 10px;">
        ${missingFields.join('<br>')}
      </div>
    `;



      Swal.fire({
        icon: 'warning',
        title: 'Missing Required Fields',
        html: htmlMessage,
        confirmButtonText: 'OK',
        showCloseButton: true,
        timer: 3000,
        timerProgressBar: true,
        allowOutsideClick: false,
        allowEscapeKey: true
      });
    }
  }



  // next بتاعت شاشة اضافة الاسئلة
  navigateToReviewStep() {

    if (
      this.questionsList.length > 0 &&
      this.questionsList.every(
        (q) =>
          q.q.trim() &&
          q.points !== undefined && q.points > 0 &&
          q.options!.every(opt => opt && opt.trim()) &&
          (q.type === 'Multiple Choice' || q.type === 'True/False'
            ? q.correctOptionId !== undefined && q.correctOptionId !== null
            : q.correctAnswer && q.correctAnswer.trim() !== ''),
      )
    ) {

      this.currentStep = 3;
    } else {
      this.checkInputsQuetionsData();
    }
  }


  checkInputsQuetionsData() {
    const errors: string[] = [];

    if (!this.questionsList.length) {
      errors.push('- No questions added');
    }

    const questionIndexMissingText = this.questionsList.findIndex(q => !q.q || q.q.trim() === '');
    if (questionIndexMissingText !== -1) {
      errors.push(`- Question text #${questionIndexMissingText + 1} is required`);
    }

    const questionIndexEmptyOption = this.questionsList.findIndex(q =>
      (q.type === 'Multiple Choice' || q.type === 'True/False') &&
      q.options?.some(opt => !opt || opt.trim() === '')
    );
    if (questionIndexEmptyOption !== -1) {
      errors.push(`- Question #${questionIndexEmptyOption + 1} has empty options`);
    }

    const questionIndexMissingCorrectOption = this.questionsList.findIndex(q =>
      (q.type === 'Multiple Choice' || q.type === 'True/False') &&
      (q.correctOptionId === undefined || q.correctOptionId === null)
    );
    if (questionIndexMissingCorrectOption !== -1) {
      errors.push(`- Question #${questionIndexMissingCorrectOption + 1} is missing a correct option`);
    }

    const questionIndexMissingCorrectAnswer = this.questionsList.findIndex(q =>
      q.type !== 'Multiple Choice' &&
      q.type !== 'True/False' &&
      (!q.correctAnswer || q.correctAnswer.trim() === '')
    );
    if (questionIndexMissingCorrectAnswer !== -1) {
      errors.push(`- Question #${questionIndexMissingCorrectAnswer + 1} is missing a correct answer`);
    }

    const questionIndexMissingPoints = this.questionsList.findIndex(q => q.points === undefined);
    if (questionIndexMissingPoints !== -1) {
      errors.push(`- Question #${questionIndexMissingPoints + 1} is missing points`);
    }

    const questionIndexNegativePoints = this.questionsList.findIndex(q => q.points !== undefined && q.points < 0);
    if (questionIndexNegativePoints !== -1) {
      errors.push(`- Question #${questionIndexNegativePoints + 1} must have points greater than 0`);
    }

    if (errors.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Errors',
        html: errors.join('<br>'),
        confirmButtonText: 'OK',
      });
    }
  }

  confirmStep() {
    const apiUrl = 'https://api.theknight.tech/api/quiz';
    const examPayload = this.mapExamToBackendPayload();
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

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to create this exam?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, create it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.post(apiUrl, examPayload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          observe: 'response' as const,
        }).subscribe({
          next: (response) => {
            const locationHeader =
              response.headers.get('Location') || response.headers.get('location') || '';
            const examCode = locationHeader.split('/').pop() || '';
            this.generatedExamCode = examCode;
            this.currentStep = 4;

            this.snackBar.openFromComponent(CustomSnackbarComponent, {
              data: {
                message: 'Exam created successfully',
                action: 'Close',
                panelClass: ['bg-green-100', 'text-green-800'],
              },
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'bottom',
            });
          },
          error: (err) => {
            console.error('Error creating exam:', err);
            this.snackBar.open(
              'Failed to create exam. Please try again.',
              'Close',
              {
                duration: 5000,
                horizontalPosition: 'right',
                verticalPosition: 'bottom',
                panelClass: ['bg-red-100', 'text-red-800'],
              },
            );
          },
        });
      } else {
        this.snackBar.open('Exam creation was cancelled', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
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
      event.currentIndex,
    );
  }

  mapExamToBackendPayload(): any {
    const startsAtUTC = new Date(
      `${this.examData.date}T${this.examData.time}:00Z`,
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

  calculateTotalPoints() {
    return this.questionsList.reduce((total, question) => {
      return total + (question.points || 0);
    }, 0);
  }

  copyExamLink() {
    const examLink = `${this.generatedExamCode}`;
    navigator.clipboard.writeText(examLink).then(() => {
      this.snackBar.openFromComponent(CustomSnackbarComponent, {
        data: {
          message: 'Exam link copied to clipboard!',
          action: 'Close',
          panelClass: ['bg-green-100', 'text-green-800'],
        },
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
      });
    }, (err) => {
      this.snackBar.openFromComponent(CustomSnackbarComponent, {
        data: {
          message: 'Failed to copy the link.',
          action: 'Close',
          panelClass: ['bg-red-100', 'text-red-800'],
        },
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
      });
    });
  }

}
