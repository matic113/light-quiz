import { Component, Inject } from '@angular/core';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';

@Component({
  selector: 'app-custom-snackbar',
  template: `
    <div
      class="flex items-center justify-between p-2 rounded-lg"
      [class]="data.panelClass ? data.panelClass.join(' ') : ''"
    >
      <span>{{ data.message }}</span>
      <button
        (click)="snackBarRef.dismiss()"
        class="ml-2 px-2 py-0.5 rounded hover:bg-black/10 transition-colors duration-200 text-current"
      >
        {{ data.action }}
      </button>
    </div>
  `,
  standalone: true,
  imports: [],
})
export class CustomSnackbarComponent {
  constructor(
    public snackBarRef: MatSnackBarRef<CustomSnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA)
    public data: {
      message: string;
      action: string;
      panelClass?: string[];
    },
  ) {}
}
