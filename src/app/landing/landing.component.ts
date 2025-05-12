import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {
  currentYear = new Date().getFullYear();
  isLoggedIn = false;
  userRole: string | null = null;
  userName: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.userRole = this.authService.getRole();
      this.userName = this.authService.getFirstname();
      
      // Redirect based on role
      const defaultRoute = this.userRole === 'teacher' ? '/create' : '/quiz';
      this.router.navigate([defaultRoute]);
    }
  }

  getDashboardRoute(): string {
    return this.userRole === 'teacher' ? '/create' : '/quiz';
  }
}
