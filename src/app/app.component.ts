import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavSideComponent } from './nav-side/nav-side.component';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [NavSideComponent,RouterOutlet,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'light-quiz';
  showSidebar: boolean = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Hide the sidebar on login, register, or student pages
      if (event.url === '/login' || event.url === '/register' || event.url.startsWith('/student/')) {
        this.showSidebar = false;
      } else {
        this.showSidebar = true;
      }
    });
  }
}
