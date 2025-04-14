import { Component, OnInit } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth/auth.service';


@Component({
  selector: 'app-nav-side',
  imports: [MatSidenavModule,MatListModule,MatToolbarModule,RouterLink,RouterLinkActive,RouterOutlet,CommonModule,MatIconModule],
  templateUrl: './nav-side.component.html',
  styleUrl: './nav-side.component.css'
})
export class NavSideComponent implements OnInit {
  isMobile: boolean = false;
  constructor(
    public authService: AuthService, // Changed to public for template access
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.sub = this.authService.getFirstname(); 
    this.token = this.authService.getToken();
    // Monitor the screen size to determine if the device is portable
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }
  

  token: string | null = null;
  sub: string | null = null;

  

  logout(): void {
    this.authService.logout(); 
    this.router.navigate(['/create']);
    this.sub = null;
    this.token = null;
  }
  isMenuOpen = false;

toggleMenu() {
  this.isMenuOpen = !this.isMenuOpen;
}
}
