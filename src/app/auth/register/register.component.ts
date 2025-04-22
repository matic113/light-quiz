import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormGroupDirective,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  ValidationErrors,
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
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule
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
        this.passwordComplexityValidator,
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
      userType: new FormControl('', [Validators.required]),
    },
    { validators: this.passwordMatchValidator },
  );
  passwordComplexityValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
  
    const errors: string[] = [];
  
    if (value.length < 8) {
      errors.push('at least 8 characters');
    }
  
    if (!/[A-Z]/.test(value)) {
      errors.push('one uppercase letter (A–Z)');
    }
  
    if (!/\d/.test(value)) {
      errors.push('one digit (0–9)');
    }
  
    if (!/[^a-zA-Z0-9]/.test(value)) {
      errors.push('one special character (e.g. !, @, #)');
    }
  
    return errors.length ? { passwordComplexity: errors } : null;
  }
    

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  // Form submission
  isLoading = false;

  onSubmit() {
    if (this.signupForm.valid) {
      this.isLoading = true;
  
      const formData = {
        fullname: this.signupForm.value.fullName,
        email: this.signupForm.value.email,
        password: this.signupForm.value.password,
        userType: this.signupForm.value.userType,
      };
  
      this.authService.onSignup(formData).subscribe({
        next: (res) => {
          import('sweetalert2').then((Swal) => {
            Swal.default.fire({
              toast: true,
              position: 'bottom-end',
              icon: 'success',
              title: 'Registration Successful',
              showConfirmButton: false,
              timer: 2000,
              timerProgressBar: true,
            }).then(() => {
              this.router.navigate(['/create']).then(() => {
                window.location.reload();
              });
            });
          });
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
  
          import('sweetalert2').then((Swal) => {
            if (err.error?.errors?.Email) {
              Swal.default.fire({
                icon: 'error',
                title: 'Email Already in Use',
                text: 'The email is already in use. Please use a different email.',
              });
            } else {
              Swal.default.fire({
                icon: 'error',
                title: 'Registration Error',
                text: 'An error occurred during registration. Please try again later.',
              });
              console.error('Registration error:', err);
            }
          });
        },
      });
    }
  }
  
}


