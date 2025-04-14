import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-create-new-exam',
  templateUrl: './create-new-exam.component.html',
  styleUrls: ['./create-new-exam.component.css'],
  imports: [CommonModule, DragDropModule],
  standalone: true
})
export class CreateNewExamComponent {
  currentStep: number = 1;

  questions = [
    { title: 'رأس السؤال الأول', type: 'Multiple Choice', points: 30 },
    { title: 'رأس السؤال الثاني', type: 'Multiple Choice', points: 10 },
  ];


  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
  }

  nextStep() {
    this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

}
