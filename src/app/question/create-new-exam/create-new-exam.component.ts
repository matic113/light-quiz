import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';

type Question = {
  type: 'Multiple Choice' | 'Short Answer';
  q: string;
  points?: number;
  correctAnswer?: string;
  options?: string[];
}

type Exam = {
  title: string;
  description: string;
  totalMarks?: number;
  exam_type?: 'Multiple Choice' | 'Short Answer' | 'Mixed';
  date: string;
  time: string;
  duration?: number;
  questions: Question[];
}

@Component({
  selector: 'app-create-new-exam',
  templateUrl: './create-new-exam.component.html',
  styleUrls: ['./create-new-exam.component.css'],
  imports: [CommonModule, DragDropModule, FormsModule],
  standalone: true
})

export class CreateNewExamComponent {
  constructor(private http: HttpClient,
    public authService: AuthService
  ) { }

  currentStep: number = 1;
  showDropdown = false;
  questionsList: Question[] = [];
  showTypeSelector = false;
  examData: Exam = {
    title: '',
    description: '',
    totalMarks: undefined,
    exam_type: undefined,
    date: '',
    time: '',
    duration: undefined,
    questions: this.questionsList
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
      alert('Please complete all required fields:\n' +
        (!this.examData.title.trim() ? '- Title is required\n' : '') +
        (!this.examData.description.trim() ? '- Description is required\n' : '') +
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
      this.questionsList.length > 0
      && this.questionsList.every(q => q.q.trim() && (q.correctAnswer !== "") && q.points !== undefined)
    ) {
      this.currentStep = 3;
    } else {
      alert(
        (!this.questionsList.length ? '- No questions added' : '') +
        (this.questionsList.some((q, i) => !q.q.trim()) ? `- Question text #${this.questionsList.findIndex((q, i) => !q.q.trim()) + 1} is required\n` : '') +
        (this.questionsList.some((q, i) => q.correctAnswer === "") ? `- Question #${this.questionsList.findIndex((q, i) => q.correctAnswer === "") + 1}'s correct answer is required\n` : '') +
        (this.questionsList.some((q, i) => q.points === undefined) ? `- Question #${this.questionsList.findIndex((q, i) => q.points === undefined) + 1}'s points is required\n` : '')
      );
    }
  }

  confirmStep() {
    const apiUrl = 'https://api.theknight.tech/api/quiz';
    const examPayload = this.mapExamToBackendPayload();
    const token = this.authService.getToken();

    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Error',
        text: 'You are not logged in. Please log in first.',
      });
      return;
    }

    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to create this exam?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, create it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.post(apiUrl, examPayload, headers).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Created!',
              text: 'Exam created successfully.',
            });

            // Reset form
            this.currentStep = 1;
            this.examData = {
              title: '',
              description: '',
              totalMarks: undefined,
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
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Failed to create exam. Please try again.',
            });
          },
        });
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Cancelled',
          text: 'Exam creation was cancelled.',
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
        correctAnswer: ''
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
      this.createQuestion('mcq')
    }
    else if (this.examData.exam_type === 'Short Answer') {
      this.createQuestion('subjective')
    }
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.questionsList, event.previousIndex, event.currentIndex);
  }

  mapExamToBackendPayload(): any {
    // دمج التاريخ والوقت وتحويلهم لتنسيق ISO
    const startsAtUTC = new Date(`${this.examData.date}T${this.examData.time}:00Z`).toISOString();

    const mappedQuestions = this.examData.questions.map((question, index) => {

      const questionTypeId = question.type === 'Multiple Choice' ? 1 : 3;
      const points = question.points || 0;

      let options = undefined;

      if (question.type === 'Multiple Choice' && question.options) {
        console.log(question.correctAnswer);
        options = question.options.map((optionText, i) => ({
          optionText: optionText,
          isCorrect: optionText === question.correctAnswer,
          optionLetter: String.fromCharCode(65 + i), // 65 => 'A'
        }));
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
