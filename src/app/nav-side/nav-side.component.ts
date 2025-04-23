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
import { SidebarStateService } from '../services/sidebar-state.service';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';

interface UserInfo{
  userId: string;
  fullName: string;
  avatarUrl : string;
  email: string;
}
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
  isExpanded = true;
  token: string | null = null;
  sub: string | null = null;
  role: string | null = null;
  avatarUrl : string | null = null;
  isMobile = false;

  constructor(
    public router: Router,
    public authService: AuthService,
    private breakpointObserver: BreakpointObserver,
    private sidebarStateService: SidebarStateService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.sub = this.authService.getFirstname();
    this.token = this.authService.getToken();
    this.role = this.authService.getRole();
    this.loadUserInfo();

    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this.isMobile = result.matches;
        this.isExpanded = !this.isMobile;
        this.sidebarStateService.setIsMobile(this.isMobile);
      });
  }
  
  
  toggleMenu(): void {
    this.isExpanded = !this.isExpanded;
    this.sidebarStateService.setSidebarState(this.isExpanded);
  }

  loadUserInfo() {
    const token = this.authService.getToken();
    if (!token) return;

    this.http.get<UserInfo>('https://api.theknight.tech/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (info) => {
        this.avatarUrl = info.avatarUrl;
      },
      error: (error) => {
        console.error('Error user info:', error);
      }
    });
  }

  logout(): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.router.navigate(['/login']);
        this.sub = null;
        this.token = null;
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'info',
          title: 'Logged out successfully',
          showConfirmButton: false,
          timer: 2000
        });
      }
    });
  }
}
