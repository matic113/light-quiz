import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormGroupDirective,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
    MatRadioModule,
    MatButtonToggleModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'], // ✅ Corrected to "styleUrls"
})
export class RegisterComponent {
  // Validator to check if password and confirm password match
  passwordMatchValidator: ValidatorFn = (control: AbstractControl) => {
    const formGroup = control as FormGroup;
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  };

  // Reactive form definition
  signupForm = new FormGroup(
    {
      fullName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
      userType: new FormControl('', [Validators.required]), // ✅ Fixed comma issue
    },
    { validators: this.passwordMatchValidator },
  );

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  // Form submission
  onSubmit() {
    if (this.signupForm.valid) {
      const formData = {
        fullname: this.signupForm.value.fullName,
        email: this.signupForm.value.email,
        password: this.signupForm.value.password,
        userType: this.signupForm.value.userType, // ✅ Send userType to the backend
      };

      this.authService.onSignup(formData).subscribe({
        next: (res) => {
          this.router.navigate(['/create']).then(() => {
            window.location.reload(); // ✅ Refresh after navigation
          });
        },
        error: (err) => {
          console.error('Registration error:', err); // ✅ Error logging
        },
      });
    }
  }
}

// Custom ErrorStateMatcher for Material inputs
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null,
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}
