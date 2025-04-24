import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';


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
  ) { }
  title = '';
  body = '';
  isSending = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';

  sendToGroup = false;
  searchQuery = '';
  searchResults: { id: string, name: string }[] = [];
  selectedStudent: { id: string, name: string } | null = null;
  selectedGroup: string = '';
  groups: { groupId: string, name: string }[] = [];

  private baseUrl = "https://api.theknight.tech";



  async ngOnInit() {

  }

  onSendToGroupChange(event: boolean) {
    if (event && this.groups.length === 0) {
      const token = this.authService.getToken();
      if (!token) return;
      this.http.get<{ groupId: string, name: string }[]>(`${this.baseUrl}/api/group/created`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (groups) => {
          this.groups = groups;
          if (groups.length === 0) {
            this.selectedGroup = '';
          }
        },
        error: (error) => {
          this.showMessage('Failed to load groups. Please try again.', 'error');
        }
      });
    }

  }

  async search(query: string) {
    this.searchQuery = query;
    if (!query.trim()) {
      this.searchResults = [];
      return;
    }

    const students = await fetch(`https://your-api.com/students?query=${query}`).then(res => res.json());
    this.searchResults = students.map((s: any) => ({ id: s.id, name: s.name }));
  }

  selectStudent(student: any) {
    this.selectedStudent = student;
    this.searchQuery = student.name;
    this.searchResults = [];
  }

  clearStudent() {
    this.selectedStudent = null;
    this.searchQuery = '';
  }

  async sendNotification() {
    if (!this.title || !this.body || (!this.selectedStudent && !this.selectedGroup)) {
      this.showMessage('Please fill all fields including a recipient.', 'error');
      return;
    }

    this.isSending = true;
    const token = this.authService.getToken();
    if (!token) return;


    // todo: change device token
    try {
      const payload = {
        title: this.title,
        body: this.body,
        deviceToken: "adsvadsvad"
      };

      this.http.post(`${this.baseUrl}/api/Gemini/notify`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).subscribe({
        next: (response: any) => {
          this.showMessage('Notification sent successfully!', 'success');
          this.title = '';
          this.body = '';
          this.clearStudent();
          this.selectedGroup = '';
        },
        error: (error) => {
          this.showMessage(error.error?.message || 'Failed to send notification.', 'error');
        },
        complete: () => {
          this.isSending = false;
        }
      });

    } catch (err) {
      this.showMessage('Error sending notification.', 'error');
      this.isSending = false;
    }
  }

  showMessage(message: string, type: 'success' | 'error') {
    this.message = message;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 3000);
  }
}

