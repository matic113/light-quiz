import { AuthService } from './../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { SidebarStateService } from '../../services/sidebar-state.service';

// Interfaces
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
  selector: 'app-student',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css'],
})
export class StudentComponent implements OnInit {
  // Join group form
  shortCode: string = '';
  message: string = '';
  success: boolean = false;

  // Create group form
  groupName: string = '';
  showAddGroupBox: boolean = false;

  // Search terms
  searchTerm: string = '';
  studentSearchTerm: string = '';

  // Groups and selection
  groups: Group[] = [];
  selectedGroup: Group | null = null;

  // Sidebar state
  isExpanded: boolean = true;
  isMobile: boolean = false;

  private readonly baseUrl = 'https://api.theknight.tech';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private sidebarStateService: SidebarStateService
  ) {}

  ngOnInit(): void {
    this.loadUserGroups();
    this.sidebarStateService.isExpanded$.subscribe(val => this.isExpanded = val);
    this.sidebarStateService.isMobile$.subscribe(val => this.isMobile = val);
  }

  // ===========================
  // Group Management Methods
  // ===========================

  /** Load groups that the student belongs to */
  loadUserGroups(): void {
    const token = this.authService.getToken();
    if (!token) return;
    this.http.get<Group[]>(`${this.baseUrl}/api/group/memberof`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: groups => this.groups = groups,
      error: err => console.error('Error fetching groups:', err)
    });
  }

  /** Toggle the visibility of the create group form */
  toggleAddGroup(): void {
    this.showAddGroupBox = !this.showAddGroupBox;
  }

  /** Create a new group */
  createGroup(): void {
    if (!this.groupName.trim()) return;
    const token = this.authService.getToken();
    if (!token) return;

    this.http.post<void>(
      `${this.baseUrl}/api/group`,
      { groupName: this.groupName, studentsId: [] },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        this.showToast('✅ Group created successfully!', 'success');
        this.groupName = '';
        this.showAddGroupBox = false;
        this.loadUserGroups();
      },
      error: () => {
        this.showToast('❌ Failed to create group.', 'error');
      }
    });
  }

  /** Copy group short code to clipboard */
  copyCode(code: string): void {
    navigator.clipboard.writeText(code)
      .catch(err => console.error('Failed to copy code:', err));
  }

  /** Select a group to view its members */
  selectGroup(group: Group): void {
    this.selectedGroup = group;
     this.selectedGroup = group;
     this.getGroupQuizzes(group.shortCode)
  }

  /** Return to the groups list view */
  backToList(): void {
    this.selectedGroup = null;
  }

  /** Join a group using a short code */
  joinGroup(): void {
    Swal.fire({
      title: 'Join a Group',
      input: 'text',
      inputPlaceholder: '🔑 Enter group code',
      showCancelButton: true,
      confirmButtonText: 'Join',
      cancelButtonText: 'Cancel',
      inputValidator: value => {
        if (!value) return '❗ You must enter the group code.';
        return null;
      }
    }).then(result => {
      if (!result.isConfirmed) return;
      const code = result.value.trim();
      const token = this.authService.getToken();
      if (!token) return;

      this.http.post<void>(`${this.baseUrl}/api/group/join/${code}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: () => {
          this.showToast('✅ Successfully joined the group!', 'success');
          this.message = '✅ Successfully joined the group.';
          this.success = true;
          this.loadUserGroups();
        },
        error: () => {
          this.showToast('❌ Failed to join the group.', 'error');
          this.message = '❌ Error while joining the group.';
          this.success = false;
        }
      });
    });
  }

  // ===========================
  // Filters
  // ===========================

  /** Filter groups by name */
  get filteredGroups(): Group[] {
    if (!this.searchTerm.trim()) return this.groups;
    const term = this.searchTerm.toLowerCase();
    return this.groups.filter(group => group.name.toLowerCase().includes(term));
  }

  /** Filter students inside the selected group */
  get filteredStudents(): Member[] {
    if (!this.selectedGroup) return [];
    if (!this.studentSearchTerm.trim()) return this.selectedGroup.members;
    const term = this.studentSearchTerm.toLowerCase();
    return this.selectedGroup.members.filter(
      member => member.memberName.toLowerCase().includes(term) ||
                member.memberEmail.toLowerCase().includes(term)
    );
  }

  
/** Leave a group using its short code */
leaveGroup(shortCode: string): void {
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you really want to leave this group?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',  // Red confirm button
    cancelButtonColor: '#3085d6', // Blue cancel button
    confirmButtonText: 'Yes, leave!',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      const token = this.authService.getToken();
      if (!token) {
        this.showToast('❌ Unauthorized. Please log in again.', 'error');
        return;
      }

      this.http.post<void>(
        `${this.baseUrl}/api/group/leave/${shortCode}`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      ).subscribe({
        next: () => {
          this.showToast('✅ You left the group successfully.', 'success');
          this.selectedGroup = null;
          this.loadUserGroups();
        },
        error: () => {
          this.showToast('❌ Failed to leave the group.', 'error');
        }
      });
    }
  });
}

groupQuizzes: Quiz[] = [];

getGroupQuizzes(shortCode: string): void {
  const token = this.authService.getToken();
  if (!token) return;

  this.http.get<Quiz[]>(`${this.baseUrl}/api/quiz/metadata/group/${shortCode}`, {
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
