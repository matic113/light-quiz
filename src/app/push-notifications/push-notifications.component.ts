import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { SidebarStateService } from '../services/sidebar-state.service';




@Component({
  selector: 'app-push-notification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './push-notifications.component.html',
  styleUrls: ['./push-notifications.component.css']
})
export class PushNotificationComponent {

  constructor(
    public authService: AuthService,
    private http: HttpClient,
    private sidebarStateService: SidebarStateService,
    
  ) { }
  title = '';
  body = '';
  isSending = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';

  // sendToGroup = false;
  searchQuery = '';
  searchResults: { id: string, name: string }[] = [];
  selectedStudent: { id: string, name: string } | null = null;
  selectedGroup: { shortCode: string, name: string } | null = null;
  groups: { shortCode: string, name: string }[] = [];

  private baseUrl = "https://api.theknight.tech";


  isExpanded: boolean = true;
  isMobile: boolean = true;
  ngOnInit() {
    const token = this.authService.getToken();
    if (!token) return;
    this.http.get<{ shortCode: string, name: string }[]>(`${this.baseUrl}/api/group/created`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (groups) => {
        this.groups = groups;
        if (groups.length === 0) {
          this.selectedGroup = null;
        }
      },
      error: (error) => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Failed to load groups. Please try again.',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
      }
    });

    this.sidebarStateService.setSidebarState(true);

    this.sidebarStateService.isExpanded$.subscribe(value => {
      this.isExpanded = value;
    });

    this.sidebarStateService.isMobile$.subscribe(isMobile => {
      this.isMobile = isMobile;
    });
  }

  async sendNotification(groupShortCode: string | null) {
    if (!this.title || !this.body || !this.selectedGroup || !groupShortCode) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Please fill all fields and select a group',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }

    this.isSending = true;

    const token = this.authService.getToken();
    if (!token) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Authentication token is missing.',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      this.isSending = false;
      return;
    }

    const payload = {
      notificationTitle: this.title,
      notificationBody: this.body,
    };

    try {
      this.http.post(`${this.baseUrl}/api/notifications/group/${groupShortCode}`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'text' as 'json'
      }).subscribe({
        next: (response) => {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Notification sent successfully!',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
          });
          this.resetForm();
        },
        error: (error) => {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: error.error?.message || 'Failed to send notification',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
          });
          this.isSending = false;
        },
        complete: () => {
          this.isSending = false;
        }
      });
    } catch (err) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Error sending notification.',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      this.isSending = false;
    }
  }

  private resetForm() {
    this.title = '';
    this.body = '';
    this.selectedGroup = null;
  }


}

