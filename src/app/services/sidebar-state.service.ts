import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarStateService {

  private isExpandedSubject = new BehaviorSubject<boolean>(true);

  isExpanded$ = this.isExpandedSubject.asObservable();

  setSidebarState(isExpanded: boolean): void {
    this.isExpandedSubject.next(isExpanded);
  }

  getSidebarState(): boolean {
    return this.isExpandedSubject.getValue();
  }}
