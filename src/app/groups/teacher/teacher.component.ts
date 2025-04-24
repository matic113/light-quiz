import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

interface Teacher {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

interface Member {
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



@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './teacher.component.html',
  styleUrl: './teacher.component.css'
})
export class TeacherComponent implements OnInit {

  groupName = '';
  userGroups: Group[] = [];
  private baseUrl1 = 'https://api.theknight.tech';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserGroups();
  }

  createGroup() {
    const token = this.authService.getToken();
    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    };

    const body = {
      groupName: this.groupName,
      studentsId: []
    };

    this.http.post(`${this.baseUrl1}/api/group`, body, headers)
      .subscribe({
        next: (res: any) => {
          Swal.fire({
            toast: true,
            position: 'bottom-end',
            icon: 'success',
            title: '✅ Group created successfully',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true
          });
          this.groupName = '';
          this.showAddGroupBox = false;
          this.loadUserGroups(); // Refresh the list after adding
        },
        error: (err) => {
          console.error(err);
          Swal.fire({
            toast: true,
            position: 'bottom-end',
            icon: 'error',
            title: '❌ An error occurred while creating the group',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true
          });
        }
      });
  }

  loadUserGroups() {
    const token = this.authService.getToken();
    if (!token) return;
  
    this.http.get<Group[]>(`${this.baseUrl1}/api/group/created`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (groups) => {
        this.userGroups = groups;
        console.log('All group data:', groups); // تحقق من بيانات المدرس هنا

      },
      error: (error) => {
        console.error('Error fetching groups:', error);
      }
    });
  }
showAddGroupBox = false;

toggleAddGroup() {
  this.showAddGroupBox = !this.showAddGroupBox;
}

  copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: 'Code copied!',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true
      });
    }).catch(err => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to copy code!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true
      });
      console.error('Failed to copy: ', err);
    });
  }
  searchTerm: string = '';

  get filteredGroups() {
    if (!this.searchTerm) return this.userGroups;
  
    const term = this.searchTerm.toLowerCase().trim();
    return this.userGroups.filter(group =>
      group.name.toLowerCase().includes(term)
    );
  }
  

}
