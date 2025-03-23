import { Component, OnInit } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-nav-side',
  imports: [MatSidenavModule,MatListModule,MatToolbarModule,RouterLink,RouterLinkActive,RouterOutlet,CommonModule,MatIconModule],
  templateUrl: './nav-side.component.html',
  styleUrl: './nav-side.component.css'
})
export class NavSideComponent implements OnInit {
  isMobile: boolean = false;

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    // Monitor the screen size to determine if the device is portable
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }
}
