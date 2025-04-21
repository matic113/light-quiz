import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login({ email, password }).subscribe({
        next: (response) => {
          import('sweetalert2').then((Swal) => {
            Swal.default.fire({
              icon: 'success',
              title: 'Login Successful',
              text: 'Welcome back!',
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 1000,
              timerProgressBar: true,
            }).then(() => {
              this.router.navigate(['/create']).then(() => {
                window.location.reload();
              });
            });
          });
        },
        error: (err) => {
          import('sweetalert2').then((Swal) => {
            Swal.default.fire({
              icon: 'error',
              title: 'Login Failed',
              text: 'Email or password is incorrect.',
              confirmButtonText: 'Try Again',
            });
          });
        },
      });
    } else {
      import('sweetalert2').then((Swal) => {
        Swal.default.fire({
          icon: 'warning',
          title: 'Invalid Input',
          text: 'Please fill in all fields correctly.',
          confirmButtonText: 'OK',
        });
      });
    }
  }
}
