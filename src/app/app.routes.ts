import { Routes } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { CreateNewExamComponent } from './question/create-new-exam/create-new-exam.component';
import { EnterQuestionsComponent } from './question/enter-questions/enter-questions.component';
import { ReviewComponent } from './question/review/review.component';
import { ExamInformationComponent } from './question/exam-information/exam-information.component';

export const routes: Routes = [
     // Redirect from the root path '' to 'create' to ensure the app starts with the create page
     { path: '', redirectTo: 'create', pathMatch: 'full' },
     { path: 'create', component: CreateNewExamComponent },
     { path: 'enter', component: EnterQuestionsComponent },
     { path: 'review', component: ReviewComponent },
     { path: 'info', component: ExamInformationComponent },
     // Catch-all route for undefined paths, displaying the NotFoundComponent (404 error page)
     { path: "**", component: NotFoundComponent }
];
