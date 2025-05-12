import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavSideComponent } from './nav-side/nav-side.component';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [NavSideComponent, RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'light-quiz';
  showSidebar: boolean = true;
  constructor(private router: Router) { }

  ngOnInit(): void {
    // Listen to route changes

  
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          const hiddenRoutes = ['/login', '/register', '/landing'];
          const isHidden =
            hiddenRoutes.includes(event.urlAfterRedirects) ||
            event.urlAfterRedirects.startsWith('/take-quiz/');
  
          this.showSidebar = !isHidden;
        });
    }
  isExcludedPage(): boolean {
    return this.router.url === '/t-groups' || this.router.url === '/s-groups'|| this.router.url === '/landing';
  }
}
