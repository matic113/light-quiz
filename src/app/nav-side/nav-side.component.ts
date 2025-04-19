import { Component, OnInit } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth/auth.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-nav-side',
  imports: [
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    RouterLink,
    CommonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './nav-side.component.html',
  styleUrl: './nav-side.component.css',
})
export class NavSideComponent {
  isExpanded = false;
  token: string | null = null;
  sub: string | null = null;
  isMobile = false;

  constructor(
    public router: Router,
    public authService: AuthService,
    private breakpointObserver: BreakpointObserver,
  ) {}
  ngOnInit(): void {
    this.sub = this.authService.getFirstname();
    this.token = this.authService.getToken();
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this.isMobile = result.matches;
        this.isExpanded = !this.isMobile;
      });
  }
  items = [
    { label: 'Dashboard', icon: 'dashboard', to: '/dashboard' },
    { label: 'Reports', icon: 'bar_chart', to: '/reports' },
    { label: 'Users', icon: 'group', to: '/users' },
    { label: 'Notifications', icon: 'notifications', to: '/notifications' },
    { label: 'Questions', icon: 'help', to: '/create' },
    { label: 'Search', icon: 'search', to: '/search' },
    { label: 'Join Quiz', icon: 'quiz', to: '/quiz' },
  ];
  toggleMenu(): void {
    this.isExpanded = !this.isExpanded;
  }
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.sub = null;
    this.token = null;
  }
}
