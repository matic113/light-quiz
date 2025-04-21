import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarStateService {

  private isExpandedSubject = new BehaviorSubject<boolean>(true);
  private isMobileSubject = new BehaviorSubject<boolean>(true); // مبدئيًا false

  isExpanded$ = this.isExpandedSubject.asObservable();
  isMobile$ = this.isMobileSubject.asObservable(); // ✅ عشان تقدر تتابعه من أي مكون

  setSidebarState(isExpanded: boolean): void {
    this.isExpandedSubject.next(isExpanded);
  }

  getSidebarState(): boolean {
    return this.isExpandedSubject.getValue();
  }

  setIsMobile(isMobile: boolean): void {
    this.isMobileSubject.next(isMobile);
  }

  getIsMobile(): boolean {
    return this.isMobileSubject.getValue();
  }
}
