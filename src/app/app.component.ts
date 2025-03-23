import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavSideComponent } from './nav-side/nav-side.component';

@Component({
  selector: 'app-root',
  imports: [NavSideComponent,RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'light-quiz';
}
