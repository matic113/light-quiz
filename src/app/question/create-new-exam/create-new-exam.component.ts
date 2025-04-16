import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
type Question = {
  type: 'Multiple Choice' | 'Short Answer';
  q: string;
  points?: number;
  correctAnswer: string;
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
    console.log(this.examData);
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

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.questionsList, event.previousIndex, event.currentIndex);
  }
}
