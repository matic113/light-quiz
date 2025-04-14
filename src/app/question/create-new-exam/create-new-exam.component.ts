import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
type Question = {
  type: 'Multiple Choice' | 'Short Answer';
  q: string;
  points: number;
  correctAnswer: string;
  options?: string[]; //الاختيارات لو اختياري
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

  questionsList: Question[] = [
    {
      type: 'Multiple Choice',
      q: 'Which language is used to style web pages?',
      points: 10,
      correctAnswer: 'CSS',
      options: ['HTML', 'JavaScript', 'CSS', 'Python']
    },
    {
      type: 'Short Answer',
      q: 'What does HTML stand for?',
      points: 5,
      correctAnswer: 'HyperText Markup Language'
    }
  ];

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


  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.questionsList, event.previousIndex, event.currentIndex);
  }

  nextStep() {
    if (
      this.examData.title.trim() &&
      this.examData.description.trim() &&
      this.examData.date &&
      this.examData.time &&
      this.examData.duration &&
      this.examData.exam_type
    ) {
      console.log('✅ Exam Data Valid:', this.examData);
      this.currentStep++;
    } else {
      alert('⚠️ Please complete all required fields before proceeding.');
    }
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

}
