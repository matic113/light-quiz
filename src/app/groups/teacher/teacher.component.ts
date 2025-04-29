import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { SidebarStateService } from '../../services/sidebar-state.service';
import { Observable } from 'rxjs';

// Interfaces for Teacher, Member, and Group
interface Teacher {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

interface Member {
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberAvatarUrl: string;
}

interface Group {
  groupId: string;
  shortCode: string;
  name: string;
  teacher: Teacher;
  members: Member[];
}
interface Quiz {
  quizId: string;
  shortCode: string;
  title: string;
  description: string;
  timeAllowed: number;
  startsAt: string;
  numberOfQuestions: number;
  possiblePoints: number;
  didStartQuiz: boolean;
  groupId: string;
  anonymous: boolean;
}
@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './teacher.component.html',
  styleUrls: ['./teacher.component.css']
})
export class TeacherComponent implements OnInit {




  // Group creation form state
  groupName = '';
  showAddGroupBox = false;

  // List of groups created by the user
  userGroups: Group[] = [];
  searchTerm: string = '';

  // Currently selected group
  selectedGroup: Group | null = null;

  // Sidebar states
  isExpanded: boolean = true;
  isMobile: boolean = true;

  // Backend API base URL
  private baseUrl1 = 'https://api.theknight.tech';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private sidebarStateService: SidebarStateService
  ) { }

  ngOnInit(): void {
    this.loadUserGroups();
    this.sidebarStateService.setSidebarState(true);
    this.sidebarStateService.isExpanded$.subscribe(value => {
      this.isExpanded = value;
    });

    this.sidebarStateService.isMobile$.subscribe(isMobile => {
      this.isMobile = isMobile;
    });
  }

  // Load all groups created by the logged-in user
  loadUserGroups() {
    const token = this.authService.getToken();
    if (!token) return;

    this.http.get<Group[]>(`${this.baseUrl1}/api/group/created`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: groups => this.userGroups = groups,
      error: err => console.error('Error fetching groups:', err)
    });
  }

  // Create a new group
  createGroup() {
    if (!this.groupName.trim()) return;
    const token = this.authService.getToken();
    const headers = { headers: { Authorization: `Bearer ${token}` } };
    const body = { groupName: this.groupName, studentsId: [] };

    this.http.post(`${this.baseUrl1}/api/group`, body, headers).subscribe({
      next: () => {
        Swal.fire({
          toast: true, position: 'top-end', icon: 'success',
          title: '✅ Group created successfully',
          showConfirmButton: false, timer: 1500, timerProgressBar: true
        });
        this.groupName = '';
        this.showAddGroupBox = false;
        this.loadUserGroups();
      },
      error: () => Swal.fire({
        toast: true, position: 'top-end', icon: 'error',
        title: '❌ Error creating group',
        showConfirmButton: false, timer: 1500, timerProgressBar: true
      })
    });
  }

  // Toggle the add group form visibility
  toggleAddGroup() {
    this.showAddGroupBox = !this.showAddGroupBox;
  }

  // Copy short code to clipboard
  copyCode(code: string) {
    navigator.clipboard.writeText(code)
      .then(() => Swal.fire({
        toast: true, position: 'top-end', icon: 'success',
        title: 'Code copied!', showConfirmButton: false,
        timer: 1500, timerProgressBar: true
      }))
      .catch(() => Swal.fire({
        toast: true, position: 'top-end', icon: 'error',
        title: 'Failed to copy!', showConfirmButton: false,
        timer: 1500, timerProgressBar: true
      }));
  }

  // Filter groups by search input
  get filteredGroups() {
    if (!this.searchTerm.trim()) return this.userGroups;
    const term = this.searchTerm.toLowerCase();
    return this.userGroups.filter(g => g.name.toLowerCase().includes(term));
  }

  // Select a group for detail view
  selectGroup(group: Group) {
    this.selectedGroup = group;
    this.getGroupQuizzes(group.shortCode)

  }

  // Return to group list view
  backToList() {
    this.selectedGroup = null;
  }

  // Delete a student from the selected group
  deletePerson(): void {
    if (!this.selectedGroup) {
      console.error('No group selected!');
      return;
    }

    // طلب البريد الإلكتروني من المستخدم
    Swal.fire({
      title: 'Enter the email of the student to delete',
      input: 'email',
      inputLabel: 'Student Email',
      inputPlaceholder: 'user@example.com',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) return 'Please enter an email!';
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) return 'Invalid email format!';
        return null;
      }
    }).then(res => {
      if (!res.isConfirmed || !res.value) return;

      const email = res.value.trim();
      console.log('Searching for student with email:', email);

      // البحث عن الطالب باستخدام البريد الإلكتروني
      const member = this.selectedGroup!.members.find(m => m.memberEmail === email);
      if (!member) {
        console.warn('No student found with that email in this group!');
        Swal.fire('Not found', 'No student with that email in this group.', 'warning');
        return;
      }

      console.log('📌 Student found:', member);

      // تأكيد الحذف
      Swal.fire({
        title: `Are you sure you want to delete ${member.memberName}?`,
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel'
      }).then(confirmRes => {
        if (!confirmRes.isConfirmed) return;

        const token = this.authService.getToken();
        if (!token) {
          Swal.fire('Error', 'Not authenticated', 'error');
          return;
        }

        // تجهيز البيانات المرسلة إلى السيرفر
        const body = {
          memberIds: [member.memberId], // ارسال ID الطالب
          quizShortCode: this.selectedGroup!.shortCode // ارسال كود المجموعة
        };

        console.log('📦 Request body:', body);

        // إرسال الطلب إلى السيرفر
        this.http.post<void>(
          `${this.baseUrl1}/api/group/remove`,
          body,
          { headers: { Authorization: `Bearer ${token}` } }
        ).subscribe({
          next: () => {
            Swal.fire({
              toast: true, position: 'top-end', icon: 'success',
              title: 'Student deleted successfully', showConfirmButton: false, timer: 1500
            });
            this.getGroupDetails(this.selectedGroup!.shortCode);
          },
          error: err => {
            console.error('Error deleting student:', err);
            Swal.fire('Error', 'Could not delete student', 'error');
          }
        });
      });
    });
  }



  // Add a new student to the selected group
  addPerson(): void {
    if (!this.selectedGroup) return;

    Swal.fire({
      title: 'Add a new student',
      input: 'email',
      inputLabel: 'Student email',
      inputPlaceholder: 'user@example.com',
      showCancelButton: true,
      confirmButtonText: 'Add',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) return 'Please enter an email!';
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) return 'Invalid email format!';
        return null;
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const email = result.value.trim();
        const body = {
          quizShortCode: this.selectedGroup!.shortCode,
          memberEmails: [{ email }]
        };
        const token = this.authService.getToken();
        if (!token) {
          Swal.fire('Error', 'Not authenticated', 'error');
          return;
        }

        this.http.post<void>(`${this.baseUrl1}/api/group/add`, body, {
          headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
          next: () => {
            Swal.fire({
              toast: true, position: 'top-end', icon: 'success',
              title: 'Student added successfully', showConfirmButton: false,
              timer: 1500
            });
            this.getGroupDetails(this.selectedGroup!.shortCode);
          },
          error: err => {
            console.error('Error adding student:', err);
            Swal.fire('Error', 'Error adding student', 'error');
          }
        });
      }
    });
  }

  // Get the details of a single group by shortCode
  private getGroupDetails(shortCode: string): void {
    const token = this.authService.getToken();
    if (!token) return;

    this.http.get<Group>(`${this.baseUrl1}/api/group/${shortCode}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: group => this.selectedGroup = group,
      error: err => console.error('Error fetching group details:', err)
    });
  }

  // Search input for students within selected group
  studentSearchTerm: string = '';
  get filteredStudents() {
    if (!this.selectedGroup) return [];
    if (!this.studentSearchTerm.trim()) return this.selectedGroup.members;

    const term = this.studentSearchTerm.toLowerCase();
    return this.selectedGroup.members.filter(student =>
      student.memberName.toLowerCase().includes(term) ||
      student.memberEmail.toLowerCase().includes(term)
    );
  }

  // Delete an entire group
  deleteGroup(shortCode: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = this.authService.getToken();
        if (!token) return;

        this.http.delete<void>(`${this.baseUrl1}/api/group/${shortCode}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
          next: () => {
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: '✅ Group deleted successfully',
              showConfirmButton: false,
              timer: 1500,
              timerProgressBar: true
            });
            this.loadUserGroups();
            this.selectedGroup = null;
          },
          error: () => {
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'error',
              title: '❌ Error deleting group',
              showConfirmButton: false,
              timer: 1500,
              timerProgressBar: true
            });
          }
        });
      }
    });
  }
groupQuizzes: Quiz[] = [];

getGroupQuizzes(shortCode: string): void {
  const token = this.authService.getToken();
  if (!token) return;

  this.http.get<Quiz[]>(`${this.baseUrl1}/api/quiz/metadata/group/${shortCode}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).subscribe({
    next: quizzes => {
      this.groupQuizzes = quizzes;
    },
    error: err => {
      console.error('Error fetching quizzes:', err);
      this.showToast('❌ Failed to load quizzes.', 'error');
    }
  });
}
// ===========================
  // Helper Methods
  // ===========================

  /** Show a toast message */
  private showToast(message: string, icon: 'success' | 'error'): void {
    Swal.fire({
      toast: true,
      position: 'bottom-end',
      icon,
      title: message,
      showConfirmButton: false,
      timer: 1500
    });
  }
}
